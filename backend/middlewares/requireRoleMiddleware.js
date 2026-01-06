const { hasRole } = require("../utils/roles");

function requireRole(requiredRole) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    if (!hasRole(req.user.role, requiredRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

module.exports = requireRole;
