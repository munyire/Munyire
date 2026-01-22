const DolgozoModel = require("./Dolgozo");
const RuhaModel = require("./Ruha");
const RaktarModel = require("./Raktar");
const RuhaKiBeModel = require("./RuhaKiBe");
const RendelesModel = require("./Rendeles");

function initModels(sequelize) {
  const Dolgozo = DolgozoModel(sequelize);
  const Ruha = RuhaModel(sequelize);
  const Raktar = RaktarModel(sequelize);
  const RuhaKiBe = RuhaKiBeModel(sequelize);
  const Rendeles = RendelesModel(sequelize);

  // Associations
  Dolgozo.hasMany(RuhaKiBe, { foreignKey: "DolgozoID" });
  RuhaKiBe.belongsTo(Dolgozo, { foreignKey: "DolgozoID" });

  Ruha.hasMany(Raktar, { foreignKey: "Cikkszam" });
  Raktar.belongsTo(Ruha, { foreignKey: "Cikkszam" });

  Ruha.hasMany(RuhaKiBe, { foreignKey: "Cikkszam", sourceKey: "Cikkszam" });
  RuhaKiBe.belongsTo(Ruha, { foreignKey: "Cikkszam", targetKey: "Cikkszam" });

  Ruha.hasMany(Rendeles, { foreignKey: "Cikkszam", sourceKey: "Cikkszam" });
  Rendeles.belongsTo(Ruha, { foreignKey: "Cikkszam", targetKey: "Cikkszam" });

  return { Dolgozo, Ruha, Raktar, RuhaKiBe, Rendeles };
}

module.exports = { initModels };

