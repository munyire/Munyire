const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RuhaKiBe = sequelize.define('RuhaKiBe', {
    RuhaKiBeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DolgozoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Dolgozok',
        key: 'DolgozoID'
      }
    },
    RuhaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ruhak',
        key: 'RuhaID'
      }
    },
    KiadasDatum: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    VisszaDatum: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Mennyiseg: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    Indok: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 500]
      }
    },
    RuhaMinoseg: {
      type: DataTypes.ENUM('Uj', 'Jo', 'Szakadt'),
      allowNull: true
    }
  }, {
    tableName: 'RuhaKiBe',
    timestamps: true
  });

  return RuhaKiBe;
};

