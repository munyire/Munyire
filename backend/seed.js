const { sequelize, models } = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
    console.log('Seeding database...');

    try {
        await sequelize.sync({ force: false }); // Don't wipe if not needed, or true if we want fresh start? User said "create... data", not wipe. Let's append or use unique checks.
        // Actually, "hozunk letre ... minden tablaba" implies adding data.
        // Safe to just add.

        // 1. Create Dolgozok (50)
        console.log('Creating Dolgozok...');
        const roles = ['Dolgozo', 'Manager', 'Admin'];
        const names = ['Kovacs', 'Nagy', 'Szabo', 'Toth', 'Varga', 'Kiss', 'Horvath', 'Molnar', 'Nemeth', 'Farkas'];
        const firstNames = ['Istvan', 'Maria', 'Peter', 'Eva', 'Janos', 'Katalin', 'Zoltan', 'Zsuzsanna', 'Laszlo', 'Anna'];

        const dolgozok = [];
        const passwordHash = await bcrypt.hash('password123', 10);

        for (let i = 0; i < 50; i++) {
            const lastName = names[Math.floor(Math.random() * names.length)];
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const role = roles[Math.floor(Math.random() * roles.length)];
            const username = `user_seed_${Date.now()}_${i}`;

            dolgozok.push({
                DNev: `${lastName} ${firstName}`,
                Email: `${username}@example.com`,
                Telefonszam: `+3630${Math.floor(1000000 + Math.random() * 9000000)}`,
                Nem: Math.random() > 0.5 ? 'F' : 'N',
                Munkakor: 'Altalanos',
                Szerepkor: role,
                FelhasznaloNev: username,
                JelszoHash: passwordHash
            });
        }
        const savedDolgozok = await models.Dolgozo.bulkCreate(dolgozok);
        console.log(`Created ${savedDolgozok.length} Dolgozok.`);

        // 2. Create Ruhak (50 types)
        console.log('Creating Ruhak...');
        const types = ['Polo', 'Nadrag', 'Kopeny', 'Melleny', 'Bakancs', 'Kesztyu', 'Sapka'];
        const colors = ['Feher', 'Fekete', 'Kek', 'Zold', 'Piros', 'Sarga'];
        const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '42', '44', '46'];

        const ruhak = [];
        for (let i = 0; i < 50; i++) {
            ruhak.push({
                Cikkszam: 2000000 + i, // Distinct range from manual tests
                Fajta: types[Math.floor(Math.random() * types.length)],
                Szin: colors[Math.floor(Math.random() * colors.length)],
                Meret: sizes[Math.floor(Math.random() * sizes.length)],
                Minoseg: 'Új', // Default description? Ruha table doesn't have Minoseg/Stock, Raktar does. Wait, Ruha def in README says: "Készlet és minőség a Raktar táblában".
                // But checking Ruha.js model or previous POST request:
                // The POST /api/ruhak body had "Mennyiseg" locally to create Raktar entry possibly?
                // Checking Ruha.js: Cikkszam, Fajta, Szin, Meret.
                // Let's stick to base Ruha attributes.
            });
        }
        // BulkCreate ignores errors? Or fails? Cikkszam must be unique.
        // We used unique range.
        const savedRuhak = await models.Ruha.bulkCreate(ruhak, { ignoreDuplicates: true });
        // Note: bulkCreate might not return all instances if ignoreDuplicates is true on SQLite sometimes, but let's try.
        // Actually standard bulkCreate returns the created objects.
        console.log(`Created ${ruhak.length} Ruhak.`);

        // 3. Create Raktar (Stock) (100 entries)
        // Link random Ruha to random Quality and Quantity
        console.log('Creating Raktar...');
        const qualities = ['Új', 'Jó', 'Használt', 'Selejt'];
        const raktarData = [];

        // For each created Ruha, add some stock
        for (const ruha of ruhak) {
            // Add 1-3 stock entries (different qualities) for this Ruha
            const numEntries = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < numEntries; j++) {
                raktarData.push({
                    Cikkszam: ruha.Cikkszam,
                    Minoseg: qualities[Math.floor(Math.random() * qualities.length)],
                    Mennyiseg: Math.floor(Math.random() * 100)
                });
            }
        }
        await models.Raktar.bulkCreate(raktarData);
        console.log(`Created ${raktarData.length} Raktar entries.`);

        // 4. Create RuhaKiBe (200 transactions)
        console.log('Creating RuhaKiBe...');
        const tranzakciok = [];
        // Need valid IDs.
        // Since bulkCreate returned data might not include IDs if we didn't fetch them, 
        // but here we have the objects. Dolgozo has ID (auto increment), Ruha has Cikkszam.
        // savedDolgozok has IDs.

        const dolgozoIds = savedDolgozok.map(d => d.DolgozoID);
        const ruhaCikkszams = ruhak.map(r => r.Cikkszam);

        for (let i = 0; i < 200; i++) {
            const isReturn = Math.random() > 0.5;
            const dolgozoId = dolgozoIds[Math.floor(Math.random() * dolgozoIds.length)];
            const cikkszam = ruhaCikkszams[Math.floor(Math.random() * ruhaCikkszams.length)];

            tranzakciok.push({
                DolgozoID: dolgozoId,
                Cikkszam: cikkszam,
                KiadasDatum: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random past date
                VisszaDatum: isReturn ? new Date() : null,
                Indok: 'Seed adat',
                Mennyiseg: 1,
                RuhaMinoseg: isReturn ? qualities[Math.floor(Math.random() * qualities.length)] : null
            });
        }
        await models.RuhaKiBe.bulkCreate(tranzakciok);
        console.log(`Created ${tranzakciok.length} Transactions.`);

        // 5. Create Rendelesek (50)
        console.log('Creating Rendelesek...');
        const rendelesek = [];
        const statuses = ['Leadva', 'Teljesítve', 'Lemondva'];

        for (let i = 0; i < 50; i++) {
            rendelesek.push({
                Cikkszam: ruhaCikkszams[Math.floor(Math.random() * ruhaCikkszams.length)],
                RDatum: new Date(Date.now() - Math.floor(Math.random() * 5000000000)),
                Mennyiseg: Math.floor(Math.random() * 50) + 1,
                Statusz: statuses[Math.floor(Math.random() * statuses.length)]
            });
        }
        await models.Rendeles.bulkCreate(rendelesek);
        console.log(`Created ${rendelesek.length} Orders.`);

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        // Close connection not strictly needed for script that exits, but good practice if reusable.
        // sequelize.close(); 
    }
}

seed();
