const bcrypt = require("bcrypt");
const dolgozoRepo = require("../repositories/dolgozoRepository");
const ruhakibeRepo = require("../repositories/ruhakibeRepository");

async function list() {
  return dolgozoRepo.findAll();
}

async function listNames() {
  return dolgozoRepo.findAllNames();
}

async function get(id) {
  return dolgozoRepo.findById(id);
}

async function create(data) {
  const hash = await bcrypt.hash(data.password, Number(process.env.BCRYPT_ROUNDS) || 10);
  return dolgozoRepo.create({
    DNev: data.DNev,
    Email: data.Email,
    Telefonszam: data.Telefonszam,
    Nem: data.Nem,
    Munkakor: data.Munkakor,
    Szerepkor: data.Szerepkor,
    FelhasznaloNev: data.FelhasznaloNev,
    JelszoHash: hash,
  });
}

async function update(id, data) {
  const updates = { ...data };
  if (data.password) {
    updates.JelszoHash = await bcrypt.hash(data.password, Number(process.env.BCRYPT_ROUNDS) || 10);
    delete updates.password;
  }
  return dolgozoRepo.update(id, updates);
}

async function remove(id) {
  return dolgozoRepo.remove(id);
}

async function listClothes(dolgozoId) {
  return ruhakibeRepo.findByDolgozo(dolgozoId);
}

async function listActiveClothes(dolgozoId) {
  return ruhakibeRepo.findActiveByDolgozo(dolgozoId);
}

async function listWithActiveItems() {
  return ruhakibeRepo.findDolgozokWithActive();
}

module.exports = {
  list,
  listNames,
  get,
  create,
  update,
  remove,
  listClothes,
  listActiveClothes,
  listWithActiveItems,
};
