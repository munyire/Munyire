const DolgozoModel = require("./Dolgozo");
const RuhaModel = require("./Ruha");
const RuhaKiBeModel = require("./RuhaKiBe");
const RendelesModel = require("./Rendeles");

function initModels(sequelize) {
  const Dolgozo = DolgozoModel(sequelize);
  const Ruha = RuhaModel(sequelize);
  const RuhaKiBe = RuhaKiBeModel(sequelize);
  const Rendeles = RendelesModel(sequelize);

  // Associations
  Dolgozo.hasMany(RuhaKiBe, { foreignKey: "DolgozoID" });
  RuhaKiBe.belongsTo(Dolgozo, { foreignKey: "DolgozoID" });

  Ruha.hasMany(RuhaKiBe, { foreignKey: "RuhaID" });
  RuhaKiBe.belongsTo(Ruha, { foreignKey: "RuhaID" });

  Ruha.hasMany(Rendeles, { foreignKey: "RuhaID" });
  Rendeles.belongsTo(Ruha, { foreignKey: "RuhaID" });

  return { Dolgozo, Ruha, RuhaKiBe, Rendeles };
}

module.exports = { initModels };

