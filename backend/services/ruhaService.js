const ruhaRepo = require("../repositories/ruhaRepository");

async function list() {
  return ruhaRepo.findAll();
}

async function get(id) {
  return ruhaRepo.findById(id);
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

module.exports = { list, get, create, update, remove };
