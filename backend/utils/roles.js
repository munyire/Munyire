// Szerepkör hierarchia
const ROLE_LEVEL = {
  Dolgozo: 1,
  Manager: 2,
  Admin: 3
};

/**
 * Ellenőrzi, hogy egy szerepkör legalább a megadott minimum szintű-e
 * @param {string} userRole - A felhasználó szerepköre
 * @param {string} minRole - A minimum szükséges szerepkör
 * @returns {boolean}
 */
function hasMinimumRole(userRole, minRole) {
  const userLevel = ROLE_LEVEL[userRole] || 0;
  const minLevel = ROLE_LEVEL[minRole] || 0;
  return userLevel >= minLevel;
}

/**
 * Visszaadja a szerepkör szintjét
 * @param {string} role - Szerepkör
 * @returns {number}
 */
function getRoleLevel(role) {
  return ROLE_LEVEL[role] || 0;
}

module.exports = {
  ROLE_LEVEL,
  hasMinimumRole,
  getRoleLevel
};

