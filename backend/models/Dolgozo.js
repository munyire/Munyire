const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dolgozo = sequelize.define('Dolgozo', {
    DolgozoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    DNev: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    Telefonszam: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Nem: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Munkakor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    Szerepkor: {
      type: DataTypes.ENUM('Dolgozo', 'Manager', 'Admin'),
      allowNull: false,
      defaultValue: 'Dolgozo'
    },
    FelhasznaloNev: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    JelszoHash: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'Dolgozok',
    timestamps: true
  });

  return Dolgozo;
};

