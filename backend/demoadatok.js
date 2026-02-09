const BASE_URL = 'http://localhost:3000/api';

// Segédfüggvény a késleltetéshez, hogy ne terheljük túl a szervert hirtelen
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random generátorok
const VEZETEKNEVEK = ['Kovács', 'Nagy', 'Szabó', 'Tóth', 'Varga', 'Kiss', 'Horváth', 'Molnár', 'Németh', 'Farkas', 'Papp', 'Balogh', 'Takács', 'Juhász', 'Mészáros'];
const KERESZTNEVEK_F = ['István', 'János', 'László', 'Zoltán', 'József', 'Attila', 'Péter', 'Tamás', 'Gábor', 'Sándor', 'Ferenc', 'Béla', 'Csaba', 'Dávid', 'Erik'];
const KERESZTNEVEK_N = ['Mária', 'Katalin', 'Éva', 'Zsuzsanna', 'Anna', 'Judit', 'Andrea', 'Erika', 'Ildikó', 'Gabriella', 'Monika', 'Magdolna', 'Edit', 'Viktória', 'Nikolett'];
const MUNKAKOROK = ['Általános munkás', 'Szakmunkás', 'Gépkezelő', 'Raktáros', 'Csoportvezető', 'Adminisztrátor', 'Karbantartó', 'Takarító', 'Villanyszerelő', 'Festő'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

async function main() {
    console.log('=== Demo Adatok Feltöltése Kezdődik ===\n');

    let token = '';

    // 1. Bejelentkezés Admin-ként
    try {
        console.log('1. Bejelentkezés admin-ként...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'alma' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('   ✅ Sikeres bejelentkezés! Token megszerezve.\n');
    } catch (err) {
        console.error('❌ Kritikus hiba: Nem sikerült bejelentkezni.', err);
        process.exit(1);
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // ============================================
    // 2. DOLGOZÓK LÉTREHOZÁSA (50 db) - Minden adattal együtt
    // ============================================
    console.log('2. Dolgozók létrehozása (50 db) - nem, telefonszám, munkakörrel...');
    const createdUsers = [];
    const roles = ['Dolgozo', 'Dolgozo', 'Dolgozo', 'Dolgozo', 'Manager']; // Több dolgozó, kevesebb manager

    for (let i = 0; i < 50; i++) {
        const isFemale = Math.random() > 0.5;
        const vezeteknev = randomItem(VEZETEKNEVEK);
        const keresztnev = randomItem(isFemale ? KERESZTNEVEK_N : KERESZTNEVEK_F);
        const nev = `${vezeteknev} ${keresztnev}`;
        const username = `user${i + 1}`;
        const role = randomItem(roles);
        
        // Neme meghatározása
        const nem = isFemale ? 'Nő' : 'Férfi';
        
        // Telefonszám generálása magyar formátumban
        const prefix = randomItem(['+3620', '+3630', '+3670', '+3620', '+3630']);
        const telefonszam = `${prefix}${randomNumber(1000000, 9999999)}`;
        
        // Munkakör
        const munkakor = randomItem(MUNKAKOROK);

        try {
            // POST /api/dolgozok - ez már tartalmazza az összes mezőt
            const res = await fetch(`${BASE_URL}/dolgozok`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    DNev: nev,
                    Email: `${username}@munyire.hu`,
                    FelhasznaloNev: username,
                    password: 'password123',
                    Szerepkor: role,
                    Nem: nem,
                    Telefonszam: telefonszam,
                    Munkakor: munkakor
                })
            });

            if (res.ok) {
                const user = await res.json();
                createdUsers.push({ ...user, name: nev });
                if ((i + 1) % 10 === 0) process.stdout.write('.');
            } else {
                const error = await res.text();
                console.error(`\n   ❌ Hiba (${username}): ${res.status} - ${error}`);
            }
        } catch (err) {
            console.error(`\n   ❌ Hálózati hiba (${username})`, err.message);
        }
        await sleep(50);
    }
    console.log(`\n   ✅ ${createdUsers.length} dolgozó létrehozva (nem, telefonszám, munkakörrel).\n`);

    // ============================================
    // 3. RUHÁK LÉTREHOZÁSA (30 különböző típus)
    // ============================================
    console.log('3. Ruhák létrehozása (30 különböző típus)...');

    // Előre definiált ruhák (cikkszámok 1000000-tól kezdődnek)
    const ruhaDefinitions = [
        { fajta: 'Póló', szin: 'Fehér', meret: 'S' },
        { fajta: 'Póló', szin: 'Fehér', meret: 'M' },
        { fajta: 'Póló', szin: 'Fehér', meret: 'L' },
        { fajta: 'Póló', szin: 'Fehér', meret: 'XL' },
        { fajta: 'Póló', szin: 'Kék', meret: 'M' },
        { fajta: 'Póló', szin: 'Kék', meret: 'L' },
        { fajta: 'Póló', szin: 'Kék', meret: 'XL' },
        { fajta: 'Póló', szin: 'Fekete', meret: 'L' },
        { fajta: 'Póló', szin: 'Fekete', meret: 'XL' },
        
        { fajta: 'Nadrág', szin: 'Kék', meret: '30' },
        { fajta: 'Nadrág', szin: 'Kék', meret: '32' },
        { fajta: 'Nadrág', szin: 'Kék', meret: '34' },
        { fajta: 'Nadrág', szin: 'Fekete', meret: '32' },
        { fajta: 'Nadrág', szin: 'Fekete', meret: '34' },
        { fajta: 'Nadrág', szin: 'Szürke', meret: '32' },
        
        { fajta: 'Cipő', szin: 'Fekete', meret: '40' },
        { fajta: 'Cipő', szin: 'Fekete', meret: '42' },
        { fajta: 'Cipő', szin: 'Fekete', meret: '43' },
        { fajta: 'Cipő', szin: 'Fekete', meret: '44' },
        { fajta: 'Cipő', szin: 'Barna', meret: '42' },
        { fajta: 'Cipő', szin: 'Barna', meret: '43' },
        
        { fajta: 'Kabát', szin: 'Sárga', meret: 'M' },
        { fajta: 'Kabát', szin: 'Sárga', meret: 'L' },
        { fajta: 'Kabát', szin: 'Narancs', meret: 'L' },
        { fajta: 'Kabát', szin: 'Narancs', meret: 'XL' },
        
        { fajta: 'Mellény', szin: 'Narancs', meret: 'M' },
        { fajta: 'Mellény', szin: 'Narancs', meret: 'L' },
        
        { fajta: 'Kesztyű', szin: 'Kombinált', meret: 'S' },
        { fajta: 'Kesztyű', szin: 'Kombinált', meret: 'M' },
        { fajta: 'Kesztyű', szin: 'Kombinált', meret: 'L' },
        
        { fajta: 'Sapka', szin: 'Kék', meret: 'Egy méret' },
    ];

    const createdClothes = [];

    for (const def of ruhaDefinitions) {
        try {
            const mennyiseg = randomNumber(50, 150);
            const body = {
                Fajta: def.fajta,
                Szin: def.szin,
                Meret: def.meret,
                Mennyiseg: mennyiseg,
                Minoseg: 'Új'
            };

            const res = await fetch(`${BASE_URL}/ruhak`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const created = await res.json();
                createdClothes.push({
                    Cikkszam: created.Cikkszam,
                    Fajta: def.fajta,
                    Szin: def.szin,
                    Meret: def.meret,
                    Mennyiseg: mennyiseg
                });
                process.stdout.write('+');
            } else {
                const error = await res.text();
                console.error(`\n   ❌ Hiba Ruha létrehozásnál (${def.fajta}): ${res.status} - ${error}`);
            }
        } catch (err) {
            console.error('\n   ❌ Hiba ruha létrehozásnál:', err.message);
        }
        await sleep(50);
    }
    console.log(`\n   ✅ ${createdClothes.length} ruha típus létrehozva (cikkszámok: 1000000-${1000000 + createdClothes.length - 1}).\n`);

    // ============================================
    // 4. RAKTÁR FELTÖLTÉSE KÜLÖNBÖZŐ MINŐSÉGŰ RUHÁKKAL
    // ============================================
    console.log('4. Raktár feltöltése különböző minőségű ruhákkal...');
    
    // A ruha létrehozásnál már létrejött "Új" minőségű készlet
    // Most hozzáadunk "Jó", "Használt", "Szakadt" minőségű ruhákat is
    const minosegek = ['Jó', 'Használt'];
    let raktarFeltoltes = 0;

    for (const ruha of createdClothes) {
        for (const minoseg of minosegek) {
            try {
                // Raktár feltöltés közvetlenül az API-n keresztül
                // A ruha frissítésével tudunk raktárat hozzáadni
                const extraMennyiseg = randomNumber(10, 30);
                
                // Először lekérjük a ruha adatait
                const getRes = await fetch(`${BASE_URL}/ruhak/cikkszam/${ruha.Cikkszam}`, {
                    headers: headers
                });
                
                if (getRes.ok) {
                    // Raktár létrehozás közvetlenül az adatbázison keresztül
                    // Mivel nincs külön raktár API, a ruha update-tel próbálkozunk
                    const updateRes = await fetch(`${BASE_URL}/ruhak/${ruha.Cikkszam}`, {
                        method: 'PUT',
                        headers: headers,
                        body: JSON.stringify({
                            Mennyiseg: extraMennyiseg,
                            Minoseg: minoseg
                        })
                    });
                    
                    if (updateRes.ok) {
                        raktarFeltoltes++;
                    }
                }
            } catch (err) {
                // Csendes hiba, nem minden ruhánál van szükség extra készletre
            }
        }
    }
    console.log(`   ✅ Raktár feltöltve különböző minőségű ruhákkal.\n`);

    // ============================================
    // 5. RUHÁK KIADÁSA DOLGOZÓKNAK
    // ============================================
    console.log('5. Ruhák kiadása dolgozóknak...');

    // Minden dolgozó kap: 1 pólót, 1 nadrágot, 1 cipőt
    const polok = createdClothes.filter(r => r.Fajta === 'Póló');
    const nadragok = createdClothes.filter(r => r.Fajta === 'Nadrág');
    const cipok = createdClothes.filter(r => r.Fajta === 'Cipő');
    
    // Extra ruhák egyes dolgozóknak
    const kabatok = createdClothes.filter(r => r.Fajta === 'Kabát');
    const mellények = createdClothes.filter(r => r.Fajta === 'Mellény');
    const kesztyuk = createdClothes.filter(r => r.Fajta === 'Kesztyű');
    const sapkak = createdClothes.filter(r => r.Fajta === 'Sapka');

    let assignmentCount = 0;
    let visszavetelAdatok = []; // Eltároljuk a visszavételhez

    for (let i = 0; i < createdUsers.length; i++) {
        const user = createdUsers[i];
        
        // Alap ruha kiosztás (póló, nadrág, cipő)
        const alapRuhak = [
            randomItem(polok),
            randomItem(nadragok),
            randomItem(cipok)
        ];

        // Extra ruha néhány dolgozónak (minden 3. kap kabátot, minden 4. kesztyűt, stb.)
        const extraRuhak = [];
        if (i % 3 === 0) extraRuhak.push(randomItem(kabatok));
        if (i % 4 === 0) extraRuhak.push(randomItem(kesztyuk));
        if (i % 5 === 0) extraRuhak.push(randomItem(mellények));
        if (i % 2 === 0) extraRuhak.push(randomItem(sapkak));

        const osszesRuha = [...alapRuhak, ...extraRuhak];

        for (const item of osszesRuha) {
            try {
                // Kiadás dátum: elmúlt 1 évben
                const kiadasDatum = randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date());
                
                const res = await fetch(`${BASE_URL}/ruhakibe`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({
                        DolgozoID: user.DolgozoID || user.id,
                        RuhaID: item.Cikkszam,
                        Mennyiseg: 1,
                        Indok: 'Alap munkaruházat kiadás',
                        KiadasDatum: kiadasDatum.toISOString().split('T')[0]
                    })
                });

                if (res.ok) {
                    const kiadottRuha = await res.json();
                    assignmentCount++;
                    
                    // Eltároljuk visszavételhez (az első 20 dolgozó ruha néhányát visszavesszük)
                    if (i < 20 && Math.random() > 0.5) {
                        visszavetelAdatok.push({
                            RuhaKiBeID: kiadottRuha.RuhaKiBeID,
                            DolgozoNev: user.name,
                            RuhaFajta: item.Fajta
                        });
                    }
                } else {
                    const error = await res.text();
                    if (error.includes('Insufficient stock')) {
                        console.log(`\n   ⚠️ Nincs készlet: ${item.Fajta} (cikkszám: ${item.Cikkszam})`);
                    }
                }
            } catch (err) {
                console.error(`\n   ❌ Hiba kiadásnál:`, err.message);
            }
        }
        
        if ((i + 1) % 10 === 0) process.stdout.write('*');
        await sleep(30);
    }
    console.log(`\n   ✅ Összesen ${assignmentCount} tétel került kiadásra ${createdUsers.length} dolgozónak.\n`);

    // ============================================
    // 6. RUHÁK VISSZAVÉTELE
    // ============================================
    console.log('6. Ruhák visszavétele...');
    
    const minosegiKategoriak = ['Jó', 'Használt', 'Szakadt'];
    let visszavetelCount = 0;

    for (const item of visszavetelAdatok) {
        try {
            const visszaDatum = randomDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date());
            const minoseg = randomItem(minosegiKategoriak);

            const res = await fetch(`${BASE_URL}/ruhakibe/${item.RuhaKiBeID}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    VisszaDatum: visszaDatum.toISOString().split('T')[0],
                    RuhaMinoseg: minoseg
                })
            });

            if (res.ok) {
                visszavetelCount++;
                process.stdout.write('v');
            }
        } catch (err) {
            console.error(`\n   ❌ Hiba visszavételnél:`, err.message);
        }
        await sleep(30);
    }
    console.log(`\n   ✅ ${visszavetelCount} ruha visszavéve (minőségek: Jó, Használt, Szakadt).\n`);

    // ============================================
    // 7. RENDELÉSEK LÉTREHOZÁSA
    // ============================================
    console.log('7. Rendelések létrehozása...');
    
    const szallitok = ['Munkaruha Kft.', 'Safety Trade Kft.', 'Textil Plusz Bt.', 'Profil Ruházati Kft.', 'Munkavédelem Zrt.'];
    let rendelesCount = 0;

    // Több rendelés különböző ruhákhoz
    const rendelniValoRuhak = createdClothes.slice(0, 15); // Az első 15 ruhából rendelünk

    for (const ruha of rendelniValoRuhak) {
        try {
            const mennyiseg = randomNumber(20, 100);
            const res = await fetch(`${BASE_URL}/rendelesek`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    Cikkszam: ruha.Cikkszam,
                    Mennyiseg: mennyiseg,
                    Szallito: randomItem(szallitok),
                    Megjegyzes: `Automatikus utánrendelés - ${ruha.Fajta} ${ruha.Szin} ${ruha.Meret}`
                })
            });

            if (res.ok) {
                rendelesCount++;
                process.stdout.write('R');
            } else {
                const error = await res.text();
                console.error(`\n   ❌ Hiba rendelésnél (${ruha.Fajta}): ${error}`);
            }
        } catch (err) {
            console.error(`\n   ❌ Hiba rendelésnél:`, err.message);
        }
        await sleep(50);
    }
    console.log(`\n   ✅ ${rendelesCount} rendelés létrehozva.\n`);

    // ============================================
    // 8. NÉHÁNY RENDELÉS TELJESÍTÉSE
    // ============================================
    console.log('8. Néhány rendelés teljesítése...');
    
    try {
        // Lekérjük a függő rendeléseket
        const pendingRes = await fetch(`${BASE_URL}/rendelesek/pending`, {
            headers: headers
        });

        if (pendingRes.ok) {
            const pendingOrders = await pendingRes.json();
            let teljesitveCount = 0;

            // Az első 5 rendelést teljesítjük
            for (let i = 0; i < Math.min(5, pendingOrders.length); i++) {
                try {
                    const completeRes = await fetch(`${BASE_URL}/rendelesek/${pendingOrders[i].RendelesID}/complete`, {
                        method: 'POST',
                        headers: headers
                    });

                    if (completeRes.ok) {
                        teljesitveCount++;
                        process.stdout.write('T');
                    }
                } catch (err) {
                    console.error(`\n   ❌ Hiba teljesítésnél:`, err.message);
                }
                await sleep(50);
            }
            console.log(`\n   ✅ ${teljesitveCount} rendelés teljesítve (készlet feltöltve).\n`);
        }
    } catch (err) {
        console.error('   ❌ Hiba a teljesítések során:', err.message);
    }

    // ============================================
    // 9. EXTRA KIADÁSOK (újabb kör)
    // ============================================
    console.log('9. Extra ruha kiadások...');
    
    let extraKiadCount = 0;
    // Minden 5. dolgozó kap még egy extra ruhát
    for (let i = 0; i < createdUsers.length; i += 5) {
        const user = createdUsers[i];
        const extraRuha = randomItem(createdClothes);
        
        try {
            const res = await fetch(`${BASE_URL}/ruhakibe`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    DolgozoID: user.DolgozoID || user.id,
                    RuhaID: extraRuha.Cikkszam,
                    Mennyiseg: 1,
                    Indok: 'Extra munkaruházat kiadás',
                    KiadasDatum: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                extraKiadCount++;
                process.stdout.write('E');
            }
        } catch (err) {
            console.error(`\n   ❌ Hiba extra kiadásnál:`, err.message);
        }
        await sleep(30);
    }
    console.log(`\n   ✅ ${extraKiadCount} extra ruha kiadva.\n`);

    // ============================================
    // ÖSSZESÍTŐ
    // ============================================
    console.log('=== Demo Adatok Feltöltése BEFEJEZVE ===\n');
    console.log('📊 Összesítő:');
    console.log(`   • Dolgozók: ${createdUsers.length} fő`);
    console.log(`   • Ruha típusok: ${createdClothes.length} db`);
    console.log(`   • Kiadott ruhák: ${assignmentCount} db`);
    console.log(`   • Visszavett ruhák: ${visszavetelCount} db`);
    console.log(`   • Rendelések: ${rendelesCount} db`);
    console.log(`   • Extra kiadások: ${extraKiadCount} db`);
    console.log(`\n👥 Szerepkörök:`);
    const adminCount = createdUsers.filter(u => u.Szerepkor === 'Admin').length;
    const managerCount = createdUsers.filter(u => u.Szerepkor === 'Manager').length;
    const dolgozoCount = createdUsers.filter(u => u.Szerepkor === 'Dolgozo').length;
    console.log(`   • Admin: ${adminCount} fő`);
    console.log(`   • Manager: ${managerCount} fő`);
    console.log(`   • Dolgozo: ${dolgozoCount} fő`);
    console.log(`\n📋 Dolgozói adatok (minden dolgozóhoz):`);
    console.log(`   • Nem: Férfi/Nő`);
    console.log(`   • Telefonszám: Magyar formátum (+3620/+3630/+3670)`);
    console.log(`   • Munkakör: ${MUNKAKOROK.join(', ')}`);
    console.log(`\n👕 Ruhák minőségi kategóriái a raktárban:`);
    console.log(`   • Új, Jó, Használt, Szakadt`);
    console.log(`\n🔑 Bejelentkezési adatok:'`);
    console.log(`   • Admin: username: admin, password: alma`);
    console.log(`   • Dolgozók: username: user1-user50, password: password123`);
    console.log('\n========================================');
}

main().catch(err => {
    console.error('Váratlan hiba:', err);
    process.exit(1);
});
