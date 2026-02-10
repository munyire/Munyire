const { models } = require("../db");

async function findByCikkszamAndMinoseg(cikkszam, minoseg, options = {}) {
    return models.Raktar.findOne({
        where: {
            Cikkszam: cikkszam,
            Minoseg: minoseg
        },
        ...options
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

async function remove(cikkszam, minoseg) {
    return models.Raktar.destroy({
        where: {
            Cikkszam: cikkszam,
            Minoseg: minoseg
        }
    });
}

module.exports = { findByCikkszamAndMinoseg, create, updateStock, getStockForCikkszam, remove };
