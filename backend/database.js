const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './munyire.db',
    logging: false // Disable logging for cleaner output
});

// Define Dolgozok model
const Dolgozok = sequelize.define('Dolgozok', {
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
    RuhaID: {
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
    },
    Minoseg: {
        type: DataTypes.STRING, // Pl. 'Uj', 'Jo', 'Szakadt'
        defaultValue: 'Uj',
        allowNull: false
    }
}, {
    tableName: 'Ruhak',
    timestamps: false
});

// Define RuhaKiBe model
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
            model: Dolgozok,
            key: 'DolgozoID'
        }
    },
    RuhaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ruhak,
            key: 'RuhaID'
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
    },
    RuhaMinoseg: {
        type: DataTypes.STRING, // Minoseg a visszaadáskor
        allowNull: true // Lehet null, ha még nincs visszaadva
    }
}, {
    tableName: 'RuhaKiBe',
    timestamps: false
});

// Define Rendelesek model
const Rendelesek = sequelize.define('Rendelesek', {
    RendelesID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    RuhaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Ruhak,
            key: 'RuhaID'
        }
    },
    RDatum: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Mennyiseg: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Statusz: {
        type: DataTypes.STRING, // Pl. 'Leadva', 'Feldolgozás alatt', 'Teljesítve', 'Törölve'
        defaultValue: 'Leadva',
        allowNull: false
    }
}, {
    tableName: 'Rendelesek',
    timestamps: false
});

// Define associations
Dolgozok.hasMany(RuhaKiBe, { foreignKey: 'DolgozoID' });
RuhaKiBe.belongsTo(Dolgozok, { foreignKey: 'DolgozoID' });

Ruhak.hasMany(RuhaKiBe, { foreignKey: 'RuhaID' });
RuhaKiBe.belongsTo(Ruhak, { foreignKey: 'RuhaID' });

Ruhak.hasMany(Rendelesek, { foreignKey: 'RuhaID' });
Rendelesek.belongsTo(Ruhak, { foreignKey: 'RuhaID' });

// Sync database
const syncDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        // Drop tables and re-create to handle ID renames and new fields cleanly in dev
        // In production, use migrations!
        await sequelize.sync({ force: true }); // Use force: true for development to drop and re-create tables
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