const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './munyire.db',
    logging: false // Disable logging for cleaner output
});

// Define Dolgozok model
const Dolgozok = sequelize.define('Dolgozok', {
    DID: {
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
        unique: true
    },
    Telefonszam: DataTypes.STRING,
    Nem: DataTypes.STRING,
    Munkakor: DataTypes.STRING,
    Admin: {
        type: DataTypes.INTEGER,
        defaultValue: 0
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
    timestamps: false
});

// Define Ruhak model
const Ruhak = sequelize.define('Ruhak', {
    KID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Fajta: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Szin: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Meret: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Mennyiseg: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Ruhak',
    timestamps: false
});

// Define RuhaKiBe model
const RuhaKiBe = sequelize.define('RuhaKiBe', {
    KiadasID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Dolgozok,
            key: 'DID'
        }
    },
    KID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ruhak,
            key: 'KID'
        }
    },
    KiadasDatum: {
        type: DataTypes.STRING,
        allowNull: false
    },
    VisszaDatum: DataTypes.STRING,
    Mennyiseg: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'RuhaKiBe',
    timestamps: false
});

// Define Rendelesek model
const Rendelesek = sequelize.define('Rendelesek', {
    RID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    KID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ruhak,
            key: 'KID'
        }
    },
    RDatum: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Mennyiseg: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'Rendelesek',
    timestamps: false
});

// Define associations
Dolgozok.hasMany(RuhaKiBe, { foreignKey: 'DID' });
RuhaKiBe.belongsTo(Dolgozok, { foreignKey: 'DID' });

Ruhak.hasMany(RuhaKiBe, { foreignKey: 'KID' });
RuhaKiBe.belongsTo(Ruhak, { foreignKey: 'KID' });

Ruhak.hasMany(Rendelesek, { foreignKey: 'KID' });
Rendelesek.belongsTo(Ruhak, { foreignKey: 'KID' });

// Sync database
const syncDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({ alter: true }); // Use alter to avoid dropping tables
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    syncDb,
    Dolgozok,
    Ruhak,
    RuhaKiBe,
    Rendelesek
};