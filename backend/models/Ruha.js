const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ruha = sequelize.define(
    "Ruha",
    {
      RuhaID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      Cikkszam: { type: DataTypes.STRING, allowNull: false, unique: true },
      Fajta: { type: DataTypes.STRING, allowNull: false },
      Szin: { type: DataTypes.STRING, allowNull: false },
      Meret: { type: DataTypes.STRING, allowNull: false },
      Mennyiseg: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      Minoseg: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "Ruhak",
      timestamps: true,
    }
  );

  return Ruha;
};
