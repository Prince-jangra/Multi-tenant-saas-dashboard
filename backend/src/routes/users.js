import { Router } from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users for the tenant (admin only, or users can see themselves)
router.get('/', async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		// If user is admin, show all users. Otherwise, only show themselves
		if (req.user.role === 'admin') {
			const users = await User.find({ tenantId: req.tenant._id })
				.select('-password')
				.sort({ createdAt: -1 });
			return res.json(users);
		} else {
			// Non-admin users can only see themselves
			return res.json([{
				id: req.user._id,
				email: req.user.email,
				name: req.user.name,
				role: req.user.role,
				createdAt: req.user.createdAt,
				updatedAt: req.user.updatedAt
			}]);
		}
	} catch (err) {
		return next(err);
	}
});

// Create new user (admin only)
router.post('/', adminMiddleware, async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		const { email, password, name, role } = req.body;

		if (!email || !password || !name) {
			return res.status(400).json({ error: 'Email, password, and name are required' });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ 
			email: email.toLowerCase(), 
			tenantId: req.tenant._id 
		});
		if (existingUser) {
			return res.status(400).json({ error: 'User already exists' });
		}

		// Create user
		const user = await User.create({
			email: email.toLowerCase(),
			password,
			name,
			role: role || 'user',
			tenantId: req.tenant._id
		});

		res.status(201).json({
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		});
	} catch (err) {
		return next(err);
	}
});

// Update user (admin only, or user can update themselves)
router.put('/:id', async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		const { name, role, email } = req.body;
		const userId = req.params.id;

		// Check if user exists and belongs to tenant
		const user = await User.findOne({ _id: userId, tenantId: req.tenant._id });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Only admin can update other users or change roles
		const isAdmin = req.user.role === 'admin';
		const isSelf = req.user._id.toString() === userId;

		if (!isAdmin && !isSelf) {
			return res.status(403).json({ error: 'Access denied' });
		}

		if (!isAdmin && role) {
			return res.status(403).json({ error: 'Only admins can change roles' });
		}

		// Update fields
		if (name) user.name = name;
		if (email) user.email = email.toLowerCase();
		if (role && isAdmin) user.role = role;

		await user.save();

		res.json({
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		});
	} catch (err) {
		return next(err);
	}
});

// Delete user (admin only)
router.delete('/:id', adminMiddleware, async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		const userId = req.params.id;

		// Prevent deleting yourself
		if (req.user._id.toString() === userId) {
			return res.status(400).json({ error: 'Cannot delete your own account' });
		}

		const user = await User.findOneAndDelete({ 
			_id: userId, 
			tenantId: req.tenant._id 
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json({ message: 'User deleted successfully' });
	} catch (err) {
		return next(err);
	}
});

export default router;

