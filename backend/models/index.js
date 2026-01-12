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

  Ruha.hasMany(RuhaKiBe, { foreignKey: "Cikkszam", sourceKey: "Cikkszam" }); // Assuming RuhaKiBe also needs update to reference Cikkszam? The plan didn't explicitly mention migrating RuhaKiBe FK, but RuhaID is gone.
  // Wait, if RuhaID is gone, RuhaKiBe needs to point to Cikkszam OR we keep RuhaID but make Cikkszam primary?
  // The plan said "Primary Key: Cikkszam". So RuhaID is GONE.
  // Therefore RuhaKiBe MUST reference Cikkszam.
  RuhaKiBe.belongsTo(Ruha, { foreignKey: "Cikkszam", targetKey: "Cikkszam" });

  Ruha.hasMany(Rendeles, { foreignKey: "Cikkszam", sourceKey: "Cikkszam" });
  Rendeles.belongsTo(Ruha, { foreignKey: "Cikkszam", targetKey: "Cikkszam" });

  return { Dolgozo, Ruha, Raktar, RuhaKiBe, Rendeles };
}

module.exports = { initModels };

