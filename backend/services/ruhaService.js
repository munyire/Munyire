const ruhaRepo = require("../repositories/ruhaRepository");
const ruhakibeRepo = require("../repositories/ruhakibeRepository");

async function list() {
  return ruhaRepo.findAll();
}

async function search(q) {
  return ruhaRepo.search(q);
}

async function get(id) {
  return ruhaRepo.findById(id);
}

async function getByCikkszam(cikkszam) {
  return ruhaRepo.findByCikkszam(cikkszam);
}

async function history(ruhaId) {
  return ruhakibeRepo.findByDateRange(null, null, { RuhaID: ruhaId });
}

async function active(ruhaId) {
  return ruhakibeRepo.findActiveForRuha(ruhaId);
}

async function create(data) {
  return ruhaRepo.create(data);
}

async function update(id, data) {
  return ruhaRepo.update(id, data);
}

async function remove(id) {
  return ruhaRepo.remove(id);
}

module.exports = {
  list,
  search,
  get,
  getByCikkszam,
  history,
  active,
  create,
  update,
  remove,
};
