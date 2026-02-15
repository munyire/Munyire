const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ruha = sequelize.define(
    "Ruha",
    {
      Cikkszam: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, unique: true },
      Fajta: { type: DataTypes.STRING, allowNull: false },
      Szin: { type: DataTypes.STRING, allowNull: false },
      Meret: { type: DataTypes.STRING, allowNull: false },
      Ar: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
    },
    {
      tableName: "Ruhak",
      timestamps: true,
    }
  );

  return Ruha;
};
