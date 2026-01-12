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


function normalizeText(text) {
  if (!text) return "XXX";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 3)
    .padEnd(3, "X");
}

async function getOptions() {
  const [types, colors, sizes] = await Promise.all([
    ruhaRepo.getDistinctValues("Fajta"),
    ruhaRepo.getDistinctValues("Szin"),
    ruhaRepo.getDistinctValues("Meret"),
  ]);

  return {
    types,
    colors,
    sizes,
  };
}

async function create(data) {
  // Ensure Minoseg has default if missing
  if (!data.Minoseg) data.Minoseg = "Új";

  // Check for duplicates
  const existing = await ruhaRepo.findByAttributes(data);
  if (existing) {
    const error = new Error("Duplicate item found");
    error.code = "DUPLICATE_ITEM";
    throw error;
  }

  if (!data.Cikkszam) {
    const typePrefix = normalizeText(data.Fajta);
    const colorPrefix = normalizeText(data.Szin);
    const sizePart = data.Meret ? data.Meret.toUpperCase() : "XX";
    const qualityPrefix = normalizeText(data.Minoseg);
    const prefix = `${typePrefix}-${colorPrefix}-${sizePart}-${qualityPrefix}`;

    // Find last SKU with this prefix
    const lastItems = await ruhaRepo.findByCikkszamPrefix(prefix);
    let nextSeq = 1;

    if (lastItems && lastItems.length > 0) {
      const lastSku = lastItems[0].Cikkszam;
      const parts = lastSku.split("-");
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    const seqStr = nextSeq.toString().padStart(4, "0");
    data.Cikkszam = `${prefix}-${seqStr}`;
  }

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
  getOptions,
  create,
  update,
  remove,
};
