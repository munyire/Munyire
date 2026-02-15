const rendelesRepo = require("../repositories/rendelesRepository");
const ruhaRepo = require("../repositories/ruhaRepository");
const raktarRepo = require("../repositories/raktarRepository");

async function list() {
  return rendelesRepo.findAll();
}

async function listPending() {
  return rendelesRepo.findPending();
}

async function listByStatus(statusz) {
  return rendelesRepo.findByStatus(statusz);
}

async function listByRuha(cikkszam) {
  return rendelesRepo.findByRuha(cikkszam);
}

async function get(id) {
  return rendelesRepo.findById(id);
}

async function create(data) {
  // Map RuhaID to Cikkszam if needed, or assume data.RuhaID holds the Cikkszam
  const cikkszam = data.Cikkszam || data.RuhaID; // Check both

  const ruha = await ruhaRepo.findByCikkszam(cikkszam);
  if (!ruha) {
    const err = new Error(`Ruha not found (Cikkszam: ${cikkszam})`);
    err.status = 404;
    throw err;
  }

  // Ensure we save Cikkszam field
  data.Cikkszam = cikkszam;

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
  if (order.Statusz === "Lemondva") {
    const err = new Error("A lemondott rendelés nem teljesíthető");
    err.status = 400;
    throw err;
  }

  // order has Cikkszam (via index.js association and create mapping)
  // Check if DB schema migration happened. If explicit column usage, access order.Cikkszam or order.RuhaID?
  // Since we assume DB reset, it's order.Cikkszam (or implicit FK).
  // Ideally we should use order.Cikkszam.
  const cikkszam = order.Cikkszam || order.RuhaID;

  const ruha = await ruhaRepo.findByCikkszam(cikkszam);
  if (!ruha) {
    const err = new Error("Ruha not found");
    err.status = 404;
    throw err;
  }

  await order.update({ Statusz: "Teljesítve" });

  // Update Stock (Incoming order adds to stock?)
  // Yes, order complete -> items arrive -> add to stock.
  // Assume generic 'Új' quality for new orders.

  let raktar = await raktarRepo.findByCikkszamAndMinoseg(cikkszam, "Új");
  if (!raktar) {
    raktar = await raktarRepo.create({
      Cikkszam: cikkszam,
      Minoseg: "Új",
      Mennyiseg: 0
    });
  }

  await raktar.update({ Mennyiseg: raktar.Mennyiseg + order.Mennyiseg });

  return order;
}

async function cancel(id) {
  const order = await rendelesRepo.findById(id);
  if (!order) {
    const err = new Error("Order not found");
    err.status = 404;
    throw err;
  }
  if (order.Statusz === "Teljesítve") {
    const err = new Error("A teljesített rendelés nem mondható le");
    err.status = 400;
    throw err;
  }
  if (order.Statusz === "Lemondva") return order;

  await order.update({ Statusz: "Lemondva" });
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
  cancel,
  remove,
};
