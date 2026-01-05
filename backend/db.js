const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Sequelize kapcsolat létrehozása (SQLite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Modellek importálása és inicializálása
const DolgozoModel = require('./models/Dolgozo')(sequelize, DataTypes);
const RuhaModel = require('./models/Ruha')(sequelize, DataTypes);
const RuhaKiBeModel = require('./models/RuhaKiBe')(sequelize, DataTypes);
const RendelesModel = require('./models/Rendeles')(sequelize, DataTypes);

// Modellek egy objektumba gyűjtése
const models = {
  Dolgozo: DolgozoModel,
  Ruha: RuhaModel,
  RuhaKiBe: RuhaKiBeModel,
  Rendeles: RendelesModel
};

// Asszociációk beállítása
models.Dolgozo.hasMany(models.RuhaKiBe, { 
  foreignKey: 'DolgozoID',
  as: 'ruhakibe'
});

models.Ruha.hasMany(models.RuhaKiBe, { 
  foreignKey: 'RuhaID',
  as: 'ruhakibe'
});

models.Ruha.hasMany(models.Rendeles, { 
  foreignKey: 'RuhaID',
  as: 'rendelesek'
});

models.RuhaKiBe.belongsTo(models.Dolgozo, {
  foreignKey: 'DolgozoID',
  as: 'dolgozo'
});

models.RuhaKiBe.belongsTo(models.Ruha, {
  foreignKey: 'RuhaID',
  as: 'ruha'
});

models.Rendeles.belongsTo(models.Ruha, {
  foreignKey: 'RuhaID',
  as: 'ruha'
});

// Adatbázis szinkronizálása
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Adatbázis kapcsolat létrejött.');

    await sequelize.sync({
      force: false,
      alter: true
    });
    console.log('Minden modell szinkronizálva az adatbázissal.');
  } catch (error) {
    console.error('Hiba az adatbázis inicializálásakor:', error);
    process.exit(1);
  }
}

module.exports = {
  connectToDatabase,
  models,
  sequelize
};

