import { Router } from 'express';
import Tenant from '../models/Tenant.js';

const router = Router();

// For admin or seed verification; in real app protect this endpoint
router.get('/', async (req, res, next) => {
	try {
		const tenants = await Tenant.find({}).select('name slug brand');
		return res.json(tenants);
	} catch (err) { return next(err); }
});

router.get('/me', async (req, res) => {
	if (!req.tenant) return res.status(404).json({ error: 'Tenant not resolved' });
	return res.json({ 
		name: req.tenant.name, 
		slug: req.tenant.slug, 
		brand: req.tenant.brand,
		theme: req.tenant.theme 
	});
});

export default router;

