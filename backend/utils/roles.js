const ROLES = {
  Dolgozo: "Dolgozo",
  Manager: "Manager",
  Admin: "Admin",
};

const ROLE_ORDER = [ROLES.Dolgozo, ROLES.Manager, ROLES.Admin];

function hasRole(userRole, requiredRole) {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(requiredRole);
}

module.exports = { ROLES, ROLE_ORDER, hasRole };
