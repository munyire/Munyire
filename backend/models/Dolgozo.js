const { DataTypes } = require("sequelize");
const { ROLES } = require("../utils/roles");

module.exports = (sequelize) => {
  const Dolgozo = sequelize.define(
    "Dolgozo",
    {
      DolgozoID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      DNev: { type: DataTypes.STRING, allowNull: false },
      Email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
      Telefonszam: { type: DataTypes.STRING, allowNull: true },
      Nem: { type: DataTypes.STRING, allowNull: true },
      Munkakor: { type: DataTypes.STRING, allowNull: true },
      Szerepkor: { type: DataTypes.ENUM(...Object.values(ROLES)), allowNull: false, defaultValue: ROLES.Dolgozo },
      FelhasznaloNev: { type: DataTypes.STRING, allowNull: false, unique: true },
      JelszoHash: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "Dolgozok",
      timestamps: true,
    }
  );

  return Dolgozo;
};
