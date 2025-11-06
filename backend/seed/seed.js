import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from '../src/models/Tenant.js';
import Resource from '../src/models/Resource.js';
import User from '../src/models/User.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/multitenant_saas';

async function run() {
	await mongoose.connect(mongoUri);
	console.log('Connected to MongoDB');

	await Promise.all([
		Resource.deleteMany({}),
		User.deleteMany({}),
		Tenant.deleteMany({})
	]);

	const tenants = await Tenant.insertMany([
		{ 
			name: 'Acme Corp', 
			slug: 'acme', 
			brand: { 
				tagline: 'Roadrunner Ready',
				logoUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="28" height="28" rx="9" fill="%23e11d48"/%3E%3Cpath d="M14 8L18 12L14 16L10 12L14 8Z" fill="white"/%3E%3C/svg%3E'
			}, 
			theme: { primary: '#e11d48', background: '#fff7ed', text: '#111827' } 
		},
		{ 
			name: 'Globex', 
			slug: 'globex', 
			brand: { 
				tagline: 'Future Proof',
				logoUrl: 'data:image/svg+xml;charset=utf-8,%3Csvg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="28" height="28" rx="9" fill="%230ea5e9"/%3E%3Ccircle cx="14" cy="14" r="6" stroke="white" stroke-width="2" fill="none"/%3E%3Ccircle cx="14" cy="14" r="3" fill="white"/%3E%3C/svg%3E'
			}, 
			theme: { primary: '#0ea5e9', background: '#0b1220', text: '#e2e8f0' } 
		}
	]);

	const acme = tenants.find(t => t.slug === 'acme');
	const globex = tenants.find(t => t.slug === 'globex');

	await User.insertMany([
		{ tenantId: acme._id, email: 'alice@acme.com', name: 'Alice' },
		{ tenantId: globex._id, email: 'gary@globex.com', name: 'Gary' }
	]);

	await Resource.insertMany([
		{ tenantId: acme._id, title: 'Acme Guide', content: 'Welcome Acme users' },
		{ tenantId: acme._id, title: 'Acme Roadmap', content: 'Q4 plans' },
		{ tenantId: globex._id, title: 'Globex Handbook', content: 'Welcome Globex users' }
	]);

	console.log('Seed complete');
	await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });

