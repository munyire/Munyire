const jwt = require("jsonwebtoken");

function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return next();
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  } catch (err) {
    // ignore invalid token for optional auth
  }
  return next();
}

module.exports = optionalAuthMiddleware;
