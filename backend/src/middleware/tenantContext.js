import Tenant from '../models/Tenant.js';

function extractTenantFromHost(host) {
	if (!host) return null;
	// Strip port if present, e.g. localhost:4000 -> localhost
	const hostname = host.split(':')[0].toLowerCase();
	// Ignore localhost or IP addresses in dev
	const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
	if (hostname === 'localhost' || isIp) return null;
	// Take the first label as potential subdomain
	const [firstLabel] = hostname.split('.');
	return firstLabel || null;
}

export async function tenantContextMiddleware(req, res, next) {
	try {
		let slug = null;
		// Priority: Header -> Path prefix -> Subdomain
		slug = req.header('X-Tenant-ID') || null;
		if (!slug) {
			const pathMatch = req.path.match(/^\/(t|tenant)\/([a-z0-9-]+)(\/|$)/i);
			if (pathMatch) slug = pathMatch[2];
		}
		if (!slug) {
			slug = extractTenantFromHost(req.headers.host);
		}

		// Normalize slug: trim and lowercase
		if (slug) {
			slug = slug.trim().toLowerCase();
		}

		if (!slug) {
			req.tenant = null;
			return next();
		}

		const tenant = await Tenant.findOne({ slug: slug.toLowerCase() });
		if (!tenant) {
			// Log for debugging
			console.log(`[Tenant] Not found: "${slug}" (from header: ${req.header('X-Tenant-ID')}, path: ${req.path})`);
			return res.status(404).json({ error: `Tenant not found: "${slug}"` });
		}

		req.tenant = tenant;
		return next();
	} catch (err) {
		console.error('[Tenant] Error in middleware:', err);
		return next(err);
	}
}

