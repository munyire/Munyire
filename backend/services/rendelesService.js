const rendelesRepo = require("../repositories/rendelesRepository");
const ruhaRepo = require("../repositories/ruhaRepository");

async function list() {
  return rendelesRepo.findAll();
}

async function listPending() {
  return rendelesRepo.findPending();
}

async function listByStatus(statusz) {
  return rendelesRepo.findByStatus(statusz);
}

async function listByRuha(ruhaId) {
  return rendelesRepo.findByRuha(ruhaId);
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

async function complete(id) {
  const order = await rendelesRepo.findById(id);
  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  if (order.Statusz === "Teljesítve") return order;

  const ruha = await ruhaRepo.findById(order.RuhaID);
  if (!ruha) {
    const err = new Error("Ruha not found");
    err.status = 404;
    throw err;
  }

  await order.update({ Statusz: "Teljesítve" });
  await ruha.update({ Mennyiseg: ruha.Mennyiseg + order.Mennyiseg });

  return order;
}

async function remove(id) {
  return rendelesRepo.remove(id);
}

module.exports = {
  list,
  listPending,
  listByStatus,
  listByRuha,
  get,
  create,
  update,
  complete,
  remove,
};
