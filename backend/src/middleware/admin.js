// Middleware to check if user is admin
// This should be used AFTER authMiddleware
export const adminMiddleware = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		return next();
	}
	return res.status(403).json({ error: 'Admin access required' });
};

