const { hasRole } = require("../utils/roles");

function requireSelfOrRole({ paramKey = "id", role }) {
  return function selfOrRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const requestedId = String(req.params[paramKey]);
    const isSelf = requestedId && String(req.user.id) === requestedId;
    if (isSelf || hasRole(req.user.role, role)) {
      return next();
    }
    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = requireSelfOrRole;
