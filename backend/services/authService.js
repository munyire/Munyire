const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dolgozoRepo = require("../repositories/dolgozoRepository");
const { ROLES } = require("../utils/roles");

async function register({ name, email, username, password, role = ROLES.Dolgozo }) {
  const existing = await dolgozoRepo.findByUsername(username);
  if (existing) {
    const err = new Error("Username already exists");
    err.status = 400;
    throw err;
  }
  const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);
  const user = await dolgozoRepo.create({
    DNev: name,
    Email: email,
    FelhasznaloNev: username,
    JelszoHash: hash,
    Szerepkor: role,
  });
  return user;
}

async function login({ username, password }) {
  const user = await dolgozoRepo.findByUsername(username);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.JelszoHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }
  const token = jwt.sign(
    { id: user.DolgozoID, role: user.Szerepkor, name: user.DNev },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  return { token, user };
}

async function ensureAdminFromEnv() {
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  if (!adminUser || !adminPass) return null;
  const existing = await dolgozoRepo.findByUsername(adminUser);
  if (existing) return existing;
  const hash = await bcrypt.hash(adminPass, Number(process.env.BCRYPT_ROUNDS) || 10);
  return dolgozoRepo.create({
    DNev: "Admin",
    Email: adminEmail,
    FelhasznaloNev: adminUser,
    JelszoHash: hash,
    Szerepkor: ROLES.Admin,
  });
}

module.exports = { register, login, ensureAdminFromEnv };
