const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Raktar = sequelize.define(
        "Raktar",
        {
            RaktarID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
            Cikkszam: { type: DataTypes.INTEGER, allowNull: false },
            Minoseg: { type: DataTypes.STRING, allowNull: false, defaultValue: "Új" },
            Mennyiseg: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        },
        {
            tableName: "Raktar",
            timestamps: true,
        }
    );

    return Raktar;
};
