import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authMiddleware = async (req, res, next) => {
	try {
		// Get token from Authorization header or cookie
		const authHeader = req.headers.authorization;
		const token = authHeader?.startsWith('Bearer ') 
			? authHeader.substring(7) 
			: req.cookies?.token;

		if (!token) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET);
		
		// Get user and populate tenant
		const user = await User.findById(decoded.userId).populate('tenantId');
		if (!user) {
			return res.status(401).json({ error: 'User not found' });
		}

		// Ensure user's tenant matches request tenant (if tenant context exists)
		if (req.tenant && user.tenantId._id.toString() !== req.tenant._id.toString()) {
			return res.status(403).json({ error: 'Access denied: tenant mismatch' });
		}

		req.user = user;
		req.userId = user._id;
		next();
	} catch (err) {
		if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}
		return next(err);
	}
};

export const generateToken = (userId) => {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

