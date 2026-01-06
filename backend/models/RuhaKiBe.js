const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RuhaKiBe = sequelize.define(
    "RuhaKiBe",
    {
      RuhaKiBeID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      KiadasDatum: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      VisszaDatum: { type: DataTypes.DATE, allowNull: true },
      Indok: { type: DataTypes.STRING, allowNull: true },
      Mennyiseg: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      RuhaMinoseg: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "RuhaKiBe",
      timestamps: true,
    }
  );

  return RuhaKiBe;
};
