const { models } = require("../db");
const { Op, fn, col, literal } = require("sequelize");

// Teljes készletjelentés
async function inventory() {
  return models.Ruha.findAll();
}

// Dolgozónkénti összesítő
async function employeeSummary() {
  return models.RuhaKiBe.findAll({
    attributes: [
      "DolgozoID",
      [fn("COUNT", col("RuhaKiBeID")), "transactionCount"],
      [fn("SUM", col("Mennyiseg")), "totalQuantity"],
    ],

    group: ["DolgozoID"],
  });
}

// Havi riport
async function monthly(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const issued = await models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: { [Op.between]: [start, end] },
    },
  });

  const returned = await models.RuhaKiBe.findAll({
    where: {
      VisszaDatum: { [Op.between]: [start, end] },
    },
  });

  return { issued, returned };
}

// Minőség szerinti összesítés
async function qualitySummary() {
  return models.RuhaKiBe.findAll({
    attributes: ["RuhaMinoseg", [fn("COUNT", col("RuhaKiBeID")), "count"]],
    group: ["RuhaMinoseg"],
  });
}

// Havi kiadások riport
async function monthlyExpenses(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const expenses = await models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: models.Ruha,
        attributes: ["Fajta", "Ar"],
      },
      {
        model: models.Dolgozo,
        attributes: ["DNev"],
      },
    ],
  });

  // Calculate total expense
  let totalExpense = 0;
  const detailedExpenses = expenses.map(item => {
    const ar = item.Ruha ? parseFloat(item.Ruha.Ar || 0) : 0;
    const mennyiseg = item.Mennyiseg || 0;
    const total = ar * mennyiseg;
    totalExpense += total;
    return {
      KiadasDatum: item.KiadasDatum,
      Fajta: item.Ruha ? item.Ruha.Fajta : 'Ismeretlen',
      Mennyiseg: mennyiseg,
      Ar: ar,
      Total: total,
      DolgozoNev: item.Dolgozo ? item.Dolgozo.DNev : 'Ismeretlen',
    };
  });

  return { expenses: detailedExpenses, totalExpense };
}

// Éves kiadások riport
async function yearlyExpenses(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  const expenses = await models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: models.Ruha,
        attributes: ["Fajta", "Ar"],
      },
    ],
  });

  // Calculate total expense
  let totalExpense = 0;
  const monthlyBreakdown = {};

  expenses.forEach(item => {
    const ar = item.Ruha ? parseFloat(item.Ruha.Ar || 0) : 0;
    const mennyiseg = item.Mennyiseg || 0;
    const total = ar * mennyiseg;
    totalExpense += total;

    // Group by month
    const date = new Date(item.KiadasDatum);
    const month = date.getMonth() + 1;
    if (!monthlyBreakdown[month]) {
      monthlyBreakdown[month] = 0;
    }
    monthlyBreakdown[month] += total;
  });

  return { totalExpense, monthlyBreakdown };
}

// Féléves kiadások riport
async function halfYearExpenses(year, half) {
  let startMonth, endMonth;
  if (half === 1) {
    startMonth = 0; // January
    endMonth = 5;   // June
  } else {
    startMonth = 6; // July
    endMonth = 11;  // December
  }

  const start = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);

  const expenses = await models.RuhaKiBe.findAll({
    where: {
      KiadasDatum: { [Op.between]: [start, end] },
    },
    include: [
      {
        model: models.Ruha,
        attributes: ["Fajta", "Ar"],
      },
    ],
  });

  // Calculate total expense
  let totalExpense = 0;
  const monthlyBreakdown = {};

  expenses.forEach(item => {
    const ar = item.Ruha ? parseFloat(item.Ruha.Ar || 0) : 0;
    const mennyiseg = item.Mennyiseg || 0;
    const total = ar * mennyiseg;
    totalExpense += total;

    // Group by month
    const date = new Date(item.KiadasDatum);
    const month = date.getMonth() + 1;
    if (!monthlyBreakdown[month]) {
      monthlyBreakdown[month] = 0;
    }
    monthlyBreakdown[month] += total;
  });

  return { totalExpense, monthlyBreakdown, half };
}

// Aktuális készlet értéke
async function inventoryValue() {
  const inventory = await models.Raktar.findAll({
    include: [
      {
        model: models.Ruha,
        attributes: ["Fajta", "Ar"],
      },
    ],
  });

  let totalValue = 0;
  const valueByType = {};

  inventory.forEach(item => {
    const ar = item.Ruha ? parseFloat(item.Ruha.Ar || 0) : 0;
    const mennyiseg = item.Mennyiseg || 0;
    const total = ar * mennyiseg;
    totalValue += total;

    const fajta = item.Ruha ? item.Ruha.Fajta : 'Ismeretlen';
    if (!valueByType[fajta]) {
      valueByType[fajta] = { quantity: 0, value: 0 };
    }
    valueByType[fajta].quantity += mennyiseg;
    valueByType[fajta].value += total;
  });

  return { totalValue, valueByType, itemCount: inventory.length };
}

module.exports = { 
  inventory, 
  employeeSummary, 
  monthly, 
  qualitySummary,
  monthlyExpenses,
  yearlyExpenses,
  halfYearExpenses,
  inventoryValue
};
