import { Router } from 'express';
import Resource from '../models/Resource.js';

const router = Router();

router.get('/', async (req, res, next) => {
	try {
		if (!req.tenant) return res.status(400).json({ error: 'Tenant required' });
		const resources = await Resource.find({ tenantId: req.tenant._id }).sort({ createdAt: -1 });
		return res.json(resources);
	} catch (err) { return next(err); }
});

router.post('/', async (req, res, next) => {
	try {
		if (!req.tenant) return res.status(400).json({ error: 'Tenant required' });
		const { title, content } = req.body || {};
		const created = await Resource.create({ tenantId: req.tenant._id, title, content });
		return res.status(201).json(created);
	} catch (err) { return next(err); }
});

router.get('/:id', async (req, res, next) => {
	try {
		if (!req.tenant) return res.status(400).json({ error: 'Tenant required' });
		const resource = await Resource.findOne({ _id: req.params.id, tenantId: req.tenant._id });
		if (!resource) return res.status(404).json({ error: 'Not found' });
		return res.json(resource);
	} catch (err) { return next(err); }
});

export default router;

