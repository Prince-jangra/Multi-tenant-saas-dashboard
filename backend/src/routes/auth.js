import { Router } from 'express';
import User from '../models/User.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		const { email, password, name } = req.body;
		
		if (!email || !password || !name) {
			return res.status(400).json({ error: 'Email, password, and name are required' });
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase(), tenantId: req.tenant._id });
		if (existingUser) {
			return res.status(400).json({ error: 'User already exists' });
		}

		// Create user
		const user = await User.create({
			email: email.toLowerCase(),
			password,
			name,
			tenantId: req.tenant._id
		});

		// Generate token
		const token = generateToken(user._id);

		// Set token in cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		res.status(201).json({
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role
			},
			token
		});
	} catch (err) {
		return next(err);
	}
});

// Login
router.post('/login', async (req, res, next) => {
	try {
		if (!req.tenant) {
			return res.status(400).json({ error: 'Tenant required' });
		}

		const { email, password } = req.body;
		
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password are required' });
		}

		// Find user
		const user = await User.findOne({ 
			email: email.toLowerCase().trim(), 
			tenantId: req.tenant._id 
		}).populate('tenantId');

		if (!user) {
			console.log(`[Auth] User not found: ${email.toLowerCase().trim()} for tenant: ${req.tenant.slug}`);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			console.log(`[Auth] Password mismatch for user: ${user.email}`);
			return res.status(401).json({ error: 'Invalid credentials' });
		}

		// Generate token
		const token = generateToken(user._id);

		// Set token in cookie
		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		res.json({
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role
			},
			token
		});
	} catch (err) {
		console.error('[Auth] Login error:', err);
		return next(err);
	}
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
	res.json({
		user: {
			id: req.user._id,
			email: req.user.email,
			name: req.user.name,
			role: req.user.role
		}
	});
});

// Logout
router.post('/logout', (req, res) => {
	res.clearCookie('token');
	res.json({ message: 'Logged out successfully' });
});

export default router;

