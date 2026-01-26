const BASE_URL = 'http://localhost:3000/api';

// Segédfüggvény a késleltetéshez, hogy ne terheljük túl a szervert hirtelen
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random generátorok
const VEZETEKNEVEK = ['Kovács', 'Nagy', 'Szabó', 'Tóth', 'Varga', 'Kiss', 'Horváth', 'Molnár', 'Németh', 'Farkas', 'Papp', 'Balogh'];
const KERESZTNEVEK = ['István', 'János', 'László', 'Zoltán', 'József', 'Attila', 'Péter', 'Tamás', 'Gábor', 'Sándor', 'Maria', 'Katalin', 'Eva', 'Zsuzsanna', 'Anna'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
    console.log('--- Demo Adatok Feltöltése Kezdődik ---');

    let token = '';

    // 1. Bejelentkezés Admin-ként
    try {
        console.log('1. Bejelentkezés...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'alma' }) // README szerinti alapértelmezett
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('   Sikeres bejelentkezés! Token megszerezve.');
    } catch (err) {
        console.error('Kritikus hiba: Nem sikerült bejelentkezni.', err);
        process.exit(1);
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Dolgozók létrehozása (50 db)
    // 50 dolgozó, köztük dolgozó, manager. (Admin már van)
    console.log('\n2. Dolgozók létrehozása (50 db)...');
    const createdUsers = [];
    const roles = ['Dolgozo', 'Dolgozo', 'Dolgozo', 'Dolgozo', 'Manager']; // Több dolgozó, kevesebb manager

    for (let i = 0; i < 50; i++) {
        const vezeteknev = randomItem(VEZETEKNEVEK);
        const keresztnev = randomItem(KERESZTNEVEK);
        const nev = `${vezeteknev} ${keresztnev}`;
        const username = `user${i}_${Date.now()}`;
        const role = randomItem(roles);

        try {
            const res = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    name: nev,
                    email: `${username}@example.com`,
                    username: username,
                    password: 'password123',
                    role: role
                })
            });

            if (res.ok) {
                const user = await res.json();
                createdUsers.push(user);
                // Csak minden 10.-et logoljuk, hogy ne szemetelje tele a konzolt
                if ((i + 1) % 10 === 0) process.stdout.write('.');
            } else {
                console.error(`   Hiba (${username}): ${res.status}`);
            }
        } catch (err) {
            console.error(`   Hálózati hiba (${username})`, err.message);
        }
        await sleep(50); // Kis szünet
    }
    console.log(`\n   Kész. ${createdUsers.length} dolgozó létrehozva.`);

    // 3. Ruhák létrehozása (20 db)
    // "legyen valamiből 5, 10, 20, 30, etc"
    console.log('\n3. Ruhák létrehozása (20 típus)...');

    // Előre definiált típusok, hogy biztos legyen nadrág, póló, cipő
    const ruhaDefinitions = [
        { fajta: 'Póló', szin: 'Fehér', meret: 'L', menny: 50 },
        { fajta: 'Póló', szin: 'Kék', meret: 'M', menny: 40 },
        { fajta: 'Póló', szin: 'Kék', meret: 'L', menny: 30 },
        { fajta: 'Póló', szin: 'Fekete', meret: 'XL', menny: 20 },

        { fajta: 'Nadrág', szin: 'Kék', meret: '32', menny: 30 },
        { fajta: 'Nadrág', szin: 'Fekete', meret: '34', menny: 25 },
        { fajta: 'Nadrág', szin: 'Szürke', meret: '32', menny: 15 },

        { fajta: 'Cipő', szin: 'Fekete', meret: '42', menny: 30 },
        { fajta: 'Cipő', szin: 'Fekete', meret: '43', menny: 30 },
        { fajta: 'Cipő', szin: 'Barna', meret: '44', menny: 20 },

        { fajta: 'Kabát', szin: 'Sárga', meret: 'L', menny: 50 },
        { fajta: 'Mellény', szin: 'Narancs', meret: 'XL', menny: 50 },
        { fajta: 'Kesztyű', szin: 'Kombinált', meret: 'M', menny: 100 },
        { fajta: 'Sapka', szin: 'Kék', meret: 'Egy méret', menny: 50 },

        // Maradék 6 random
    ];

    // Feltöltjük a maradékot random adatokkal 20-ig
    const extraTypes = ['Póló', 'Nadrág', 'Köpeny', 'Munkásruha'];
    const extraColors = ['Zöld', 'Piros', 'Szürke'];
    const extraSizes = ['S', 'M', 'L', 'XXL'];
    const quantities = [50, 60, 80, 100];

    while (ruhaDefinitions.length < 20) {
        ruhaDefinitions.push({
            fajta: randomItem(extraTypes),
            szin: randomItem(extraColors),
            meret: randomItem(extraSizes),
            menny: randomItem(quantities)
        });
    }

    const createdClothes = [];
    // Kezdő cikkszám generálás (API lehet, hogy generál, de ha nem, küldjünk)
    // A doksi szerint: Cikkszam opcionális, automatikusan generálódik. Hagyjuk az API-ra.

    // Azonban a logikánkhoz kelleni fog a visszakapott cikkszám.
    // Figyelni kell: POST /ruhak a doksi szerint 201 Created. De mit ad vissza? Nem írja explicit, de remélhetőleg a létrehozott objektumot.

    // A seed.js 2000000-tól kezdte.
    // Mi hagyjuk null-on ha lehet, vagy generáljunk mi is 3000000-tól hogy ne ütközzön.
    let baseCikkszam = 3000001;

    for (const def of ruhaDefinitions) {
        try {
            const body = {
                Cikkszam: baseCikkszam++, // Csak hogy biztos egyedi legyen
                Fajta: def.fajta,
                Szin: def.szin,
                Meret: def.meret,
                Mennyiseg: def.menny,
                Minoseg: 'Új'
            };

            const res = await fetch(`${BASE_URL}/ruhak`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // Reméljük visszaküldi a létrehozott objektumot vagy legalább a Cikkszámot
                // Ha nem, akkor a küldött Cikkszamot használjuk
                const created = await res.json().catch(() => body); // Ha üres válasz, akkor a mi body-nk
                // Ellenőrizzük, hogy van-e Cikkszam a válaszban
                const finalCikkszam = created.Cikkszam || body.Cikkszam;

                createdClothes.push({ ...created, Cikkszam: finalCikkszam, Fajta: def.fajta });
                process.stdout.write('+');
            } else {
                console.error(`   Hiba Ruha létrehozásnál (${def.fajta}): ${res.status}`);
            }
        } catch (err) {
            console.error('   Hiba ruha létrehozásnál:', err.message);
        }
        await sleep(50);
    }
    console.log(`\n   Kész. ${createdClothes.length} ruha létrehozva.`);

    // 4. Ruhák Kiadása (Nadrág, Póló, Cipő minden dolgozónak)
    console.log('\n4. Ruhák kiadása dolgozóknak (Nadrág, Póló, Cipő)...');

    // Keressünk megfelelő cikkszámokat
    const nadragok = createdClothes.filter(r => r.Fajta === 'Nadrág');
    const polok = createdClothes.filter(r => r.Fajta === 'Póló');
    const cipok = createdClothes.filter(r => r.Fajta === 'Cipő');

    if (nadragok.length === 0 || polok.length === 0 || cipok.length === 0) {
        console.warn('   FIGYELEM: Nem minden alaptípus (Nadrág, Póló, Cipő) jött létre, a kiosztás hiányos lehet!');
    }

    let assignmentCount = 0;

    for (const user of createdUsers) {
        // Véletlenszerűen választunk egyet a kategóriából, ha van
        const itemsToAssign = [];
        if (nadragok.length > 0) itemsToAssign.push(randomItem(nadragok));
        if (polok.length > 0) itemsToAssign.push(randomItem(polok));
        if (cipok.length > 0) itemsToAssign.push(randomItem(cipok));

        for (const item of itemsToAssign) {
            try {
                // POST /ruhakibe
                // Body: { DolgozoID, Cikkszam, Mennyiseg: 1, Indok: "Demo..." }
                // User objektum: A register válaszában { id: ..., username: ... } volt. Tehát user.id kell.

                const res = await fetch(`${BASE_URL}/ruhakibe`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        DolgozoID: user.id || user.DolgozoID, // Biztonsági: attól függ mit adott vissza a register
                        RuhaID: item.Cikkszam,
                        Mennyiseg: 1,
                        Indok: 'Személyes felszerelés demo',
                        KiadasDatum: new Date().toISOString().split('T')[0] // Opcionális, de jobb megadni
                    })
                });

                if (res.ok) {
                    assignmentCount++;
                } else {
                    console.error(`   Hiba kiadásnál: ${res.status}`);
                    const txt = await res.text();
                    console.error(txt);
                }
            } catch (err) {
                console.error('   Hiba kiadásnál:', err.message);
            }
        }
        if (assignmentCount % 10 === 0) process.stdout.write('*');
        await sleep(20);
    }
    console.log(`\n   Kész. Összesen ${assignmentCount} tétel került kiadásra.`);

    // 5. Rendelés létrehozása
    console.log('\n5. Demo rendelések létrehozása...');
    if (createdClothes.length > 0) {
        const orderItem = randomItem(createdClothes);
        try {
            const res = await fetch(`${BASE_URL}/rendelesek`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    Cikkszam: orderItem.Cikkszam,
                    Mennyiseg: 50,
                    Szallito: 'Demo Beszállító Kft.',
                    Megjegyzes: 'Automatikus utánrendelés (Demo)'
                })
            });

            if (res.ok) {
                console.log('   Sikeres rendelés leadva 50 db ' + orderItem.Fajta + '-re.');
            } else {
                console.error(`   Hiba rendelésnél: ${res.status}`);
            }
        } catch (err) {
            console.error('   Hiba rendelésnél:', err);
        }
    }

    console.log('\n--- Demo Adatok Feltöltése Befejezve ---');
}

main();
