const rendelesRepo = require("../repositories/rendelesRepository");
const ruhaRepo = require("../repositories/ruhaRepository");

async function list() {
  return rendelesRepo.findAll();
}

async function get(id) {
  return rendelesRepo.findById(id);
}

async function create(data) {
  const ruha = await ruhaRepo.findById(data.RuhaID);
  if (!ruha) {
    const err = new Error("Ruha not found");
    err.status = 404;
    throw err;
  }
  return rendelesRepo.create(data);
}

async function update(id, data) {
  return rendelesRepo.update(id, data);
}

async function remove(id) {
  return rendelesRepo.remove(id);
}

module.exports = { list, get, create, update, remove };
