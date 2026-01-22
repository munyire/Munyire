const ruhaRepo = require("../repositories/ruhaRepository");
const ruhakibeRepo = require("../repositories/ruhakibeRepository");
const raktarRepo = require("../repositories/raktarRepository");

async function list() {
  return ruhaRepo.findAll();
}

async function search(q) {
  return ruhaRepo.search(q);
}

async function get(cikkszam) {
  return ruhaRepo.findById(cikkszam);
}

async function getByCikkszam(cikkszam) {
  return ruhaRepo.findByCikkszam(cikkszam);
}

// History and Active need to check usage. ruhakibeRepo methods might need update if they used RuhaID.
// But we passed RuhaID which is now Cikkszam.
async function history(cikkszam) {
  return ruhakibeRepo.findByDateRange(null, null, { Cikkszam: cikkszam });
}

async function active(cikkszam) {
  return ruhakibeRepo.findActiveForRuha(cikkszam);
}

// Normalization might still be useful for text fields but not for SKU generation anymore?
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
  // Data: Fajta, Szin, Meret, Mennyiseg (optional), Minoseg (optional, default Új)

  // Check for duplicates
  const existing = await ruhaRepo.findByAttributes(data);
  if (existing) {
    // If Ruha exists, we might just want to add stock?
    // But this is "create new product" endpoint usually.
    // However, if product exists, user might be adding stock.
    // Let's throw duplicate error as before, or handle it? 
    // Previous code threw DUPLICATE_ITEM.
    const error = new Error("Duplicate item found");
    error.code = "DUPLICATE_ITEM";
    throw error;
  }

  // Generate Cikkszam (7 digit int)
  // Start at 1000000
  let cikkszam = 1000000;
  const maxCikkszam = await ruhaRepo.findMaxCikkszam();
  if (maxCikkszam) {
    // If the max is less than 1,000,000 (e.g. legacy data), we still want to jump to 1,000,000? 
    // Or if max is 55, should we make it 56?
    // The requirement says Cikkszam should be 7 digits (>= 1000000).
    // So if max found is < 1000000, we stick to 1000000.
    // If max found is >= 1000000, we take max + 1.
    if (maxCikkszam >= 1000000) {
      cikkszam = maxCikkszam + 1;
    }
  }

  data.Cikkszam = cikkszam;

  // Create Ruha
  const ruha = await ruhaRepo.create(data);

  // Create Raktar entry (Default 'Új' stock)
  // use input Minoseg or default 'Új'
  const minoseg = data.Minoseg || "Új";
  const mennyiseg = data.Mennyiseg || 0;

  await raktarRepo.create({
    Cikkszam: ruha.Cikkszam,
    Minoseg: minoseg,
    Mennyiseg: mennyiseg
  });

  // Fetch complete object with Raktar
  return ruhaRepo.findById(ruha.Cikkszam);
}

async function update(cikkszam, data) {
  return ruhaRepo.update(cikkszam, data);
}

async function remove(cikkszam) {
  return ruhaRepo.remove(cikkszam);
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
