"use strict";

const path = require("path");
const { Sequelize } = require("sequelize");
const { initModels } = require("./models");

const dbPath = process.env.DB_PATH || path.join(__dirname, "database.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
});

const models = initModels(sequelize);

async function testConnection() {
  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  models,
  testConnection,
};
