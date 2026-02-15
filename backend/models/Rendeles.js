const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rendeles = sequelize.define(
    "Rendeles",
    {
      RendelesID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      RDatum: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      Mennyiseg: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      Statusz: {
        type: DataTypes.ENUM("Leadva", "Teljesítve", "Lemondva"),
        allowNull: false,
        defaultValue: "Leadva",
      },
      Szallito: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Megjegyzes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "Rendelesek",
      timestamps: true,
    }
  );

  return Rendeles;
};
