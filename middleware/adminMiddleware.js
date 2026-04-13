module.exports = (req, res, next) => {
  // Admin-only guard used by privileged dashboard routes.
  // This runs after authMiddleware has already attached req.user.
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};