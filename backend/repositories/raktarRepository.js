const { models } = require("../db");

async function findByCikkszamAndMinoseg(cikkszam, minoseg) {
    return models.Raktar.findOne({
        where: {
            Cikkszam: cikkszam,
            Minoseg: minoseg
        }
    });
}

async function create(data, options) {
    return models.Raktar.create(data, options);
}

async function updateStock(raktarId, delta, transaction = null) {
    const raktar = await models.Raktar.findByPk(raktarId, { transaction });
    if (!raktar) throw new Error("Stock not found");

    const newQuantity = raktar.Mennyiseg + delta;
    if (newQuantity < 0) throw new Error("Insufficient stock");

    await raktar.update({ Mennyiseg: newQuantity }, { transaction });
    return raktar;
}

async function getStockForCikkszam(cikkszam) {
    return models.Raktar.findAll({
        where: { Cikkszam: cikkszam }
    });
}

module.exports = { findByCikkszamAndMinoseg, create, updateStock, getStockForCikkszam };
