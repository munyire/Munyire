const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Rendeles = sequelize.define('Rendeles', {
    RendelesID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    RuhaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ruhak',
        key: 'RuhaID'
      }
    },
    RDatum: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    Mennyiseg: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    Statusz: {
      type: DataTypes.ENUM('Leadva', 'Teljesítve', 'Lemondva'),
      allowNull: false,
      defaultValue: 'Leadva'
    }
  }, {
    tableName: 'Rendelesek',
    timestamps: true
  });

  return Rendeles;
};

