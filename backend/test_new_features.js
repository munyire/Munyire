
const http = require('http');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'alma';

async function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function run() {
    console.log("Starting Verification...");

    // 1. Login
    const loginRes = await request('POST', '/api/auth/login', { username: ADMIN_USER, password: ADMIN_PASS });
    if (loginRes.status !== 200) {
        console.error("Login failed", loginRes.data);
        process.exit(1);
    }
    const token = loginRes.data.token;
    console.log("Login successful.");

    // 2. Test GET /options
    console.log("Testing GET /api/ruhak/options...");
    const optionsRes = await request('GET', '/api/ruhak/options', null, token);
    if (optionsRes.status === 200 && optionsRes.data.types && optionsRes.data.colors) {
        console.log("✅ GET /options passed. Data:", JSON.stringify(optionsRes.data, null, 2));
    } else {
        console.error("❌ GET /options failed.", optionsRes.status, optionsRes.data);
    }

    // 3. Test SKU Generation
    console.log("Testing Automatic SKU Generation...");
    const timestamp = Date.now();
    const newRuha = {
        Fajta: "TesztPóló",
        Szin: "Fehér",
        Meret: "XL",
        Mennyiseg: 5
    };

    const createRes = await request('POST', '/api/ruhak', newRuha, token);
    if (createRes.status === 201 && createRes.data.Cikkszam) {
        console.log("✅ create passed. Generated SKU:", createRes.data.Cikkszam);

        // Verify Pattern
        // Verify Pattern
        const expectedPrefix = "TES-FEH-XL-XXX"; // Minoseg null -> XXX
        if (createRes.data.Cikkszam.startsWith(expectedPrefix)) {
            console.log("✅ SKU pattern matches expected prefix:", expectedPrefix);
        } else {
            console.error("❌ SKU pattern mismatch. Expected start:", expectedPrefix, "Actual:", createRes.data.Cikkszam);
        }

        // 4. Test Sequential Generation (create same item again)
        console.log("Testing Sequential SKU Generation...");
        const createRes2 = await request('POST', '/api/ruhak', newRuha, token);
        if (createRes2.status === 201 && createRes2.data.Cikkszam) {
            console.log("✅ Second create passed. Generated SKU:", createRes2.data.Cikkszam);
            if (createRes2.data.Cikkszam !== createRes.data.Cikkszam) {
                console.log("✅ SKUs are unique.");
            } else {
                console.error("❌ SKUs are identical! Collision.");
            }
        } else {
            console.error("❌ Second create failed.", createRes2.status, createRes2.data);
        }

    } else {
        console.error("❌ create failed.", createRes.status, createRes.data);
    }

    // 5. Test SKU Generation WITH Quality
    console.log("Testing Automatic SKU Generation with Quality...");
    const qualityRuha = {
        Fajta: "Kabát",
        Szin: "Fekete",
        Meret: "M",
        Minoseg: "Használt",
        Mennyiseg: 1
    };

    const qualityRes = await request('POST', '/api/ruhak', qualityRuha, token);
    if (qualityRes.status === 201 && qualityRes.data.Cikkszam) {
        if (qualityRes.data.Cikkszam.startsWith("KAB-FEK-M-HAS")) {
            console.log("✅ Quality SKU passed:", qualityRes.data.Cikkszam);
        } else {
            console.error("❌ Quality SKU mismatch. Expected start KAB-FEK-M-HAS. Actual:", qualityRes.data.Cikkszam);
        }
    } else {
        console.error("❌ Quality create failed", qualityRes.status, qualityRes.data);
    }

    // 6. Test Duplicate Prevention
    console.log("Testing Duplicate Prevention...");
    // Try to create the EXACT same item as in step 5 (qualityRuha)
    const duplicateRes = await request('POST', '/api/ruhak', qualityRuha, token);

    if (duplicateRes.status === 409) {
        console.log("✅ Duplicate prevention passed: Got 409 Conflict.");
    } else {
        console.error("❌ Duplicate prevention failed. Expected 409, got:", duplicateRes.status, duplicateRes.data);
    }
}

run();
