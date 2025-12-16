const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const adminUser = {
    DNev: "Test Admin",
    Email: `admin${Date.now()}@test.com`,
    Telefonszam: "123456789",
    Nem: "Férfi",
    Munkakor: "Admin",
    Admin: 1,
    FelhasznaloNev: `admin${Date.now()}`,
    Jelszo: "password123"
};

const managerUser = {
    DNev: "Test Manager",
    Email: `manager${Date.now()}@test.com`,
    Telefonszam: "987654321",
    Nem: "Nő",
    Munkakor: "Manager",
    Admin: 0,
    FelhasznaloNev: `manager${Date.now()}`,
    Jelszo: "password123"
};

let adminToken = '';
let managerToken = '';
let createdDolgozoID = null;
let createdRuhaID = null;
let createdRendelesID = null;
let createdRuhaKiBeID = null;

const log = (message, data = '') => console.log(`
--- ${message} ---
`, data);
const logError = (message, error) => console.error(`
--- ${message} ---
`, error.response ? error.response.data : error.message);

const runTest = async (description, testFn) => {
    try {
        console.log(`[RUNNING] ${description}`);
        await testFn();
        console.log(`[SUCCESS] ${description}`);
    } catch (error) {
        console.error(`[FAILED]  ${description}`);
        logError('Test failed with error:', error);
        process.exit(1); // Exit on first failure
    }
};

const main = async () => {
    // 1. Authentication
    await runTest('Register Admin User', async () => {
        const res = await axios.post(`${API_URL}/auth/register`, adminUser);
        log('Admin registered', res.data);
        if (res.status !== 201) throw new Error('Admin registration failed');
    });

    await runTest('Login Admin User', async () => {
        const res = await axios.post(`${API_URL}/auth/login`, { FelhasznaloNev: adminUser.FelhasznaloNev, Jelszo: adminUser.Jelszo });
        adminToken = res.data.token;
        log('Admin logged in, token acquired.');
        if (!adminToken) throw new Error('Admin login failed');
    });
    
    // Set auth header for subsequent admin requests
    const adminAxios = axios.create({ headers: { 'x-auth-token': adminToken } });

    // 2. Dolgozok (Employees) CRUD
    await runTest('Admin creates a new employee (manager)', async () => {
        const res = await adminAxios.post(`${API_URL}/dolgozok`, managerUser);
        createdDolgozoID = res.data.data.DolgozoID; // Changed from DID
        log('Manager user created by admin', res.data);
        if (res.status !== 201 || !createdDolgozoID) throw new Error('Failed to create manager');
    });

    await runTest('Admin gets all employees', async () => {
        const res = await adminAxios.get(`${API_URL}/dolgozok`);
        log('All employees fetched');
        if (res.data.data.length < 2) throw new Error('Expected at least two employees');
    });
    
    await runTest('Admin updates an employee', async () => {
        const res = await adminAxios.patch(`${API_URL}/dolgozok/${createdDolgozoID}`, { Munkakor: 'Senior Manager' }); // Changed from createdDid
        log('Employee updated', res.data);
        if (res.data.changes !== 1) throw new Error('Failed to update employee');
    });

    // 3. Ruhak (Clothing) CRUD
    await runTest('Admin creates a new clothing item', async () => {
        const ruha = { Fajta: 'Póló', Szin: 'Kék', Meret: 'L', Mennyiseg: 100, Minoseg: 'Uj' }; // Added Minoseg
        const res = await adminAxios.post(`${API_URL}/ruhak`, ruha);
        createdRuhaID = res.data.data.RuhaID; // Changed from KID
        log('Clothing item created', res.data);
        if (res.status !== 201 || !createdRuhaID) throw new Error('Failed to create clothing item');
        if (res.data.data.Minoseg !== 'Uj') throw new Error('Incorrect clothing quality');
    });

    await runTest('Admin gets a single clothing item', async () => {
        const res = await adminAxios.get(`${API_URL}/ruhak/${createdRuhaID}`); // Changed from createdKid
        log('Single clothing item fetched', res.data);
        if (res.data.data.RuhaID !== createdRuhaID) throw new Error('Fetched wrong clothing item'); // Changed from KID
    });

    await runTest('Admin updates a clothing item quality', async () => {
        const res = await adminAxios.patch(`${API_URL}/ruhak/${createdRuhaID}`, { Minoseg: 'Jo' }); // Changed from createdKid
        log('Clothing item quality updated', res.data);
        if (res.data.changes !== 1) throw new Error('Failed to update clothing item quality');
    });

    // 4. Rendelesek (Orders) CRUD
    await runTest('Admin creates a new order', async () => {
        const rendeles = { RuhaID: createdRuhaID, RDatum: new Date().toISOString(), Mennyiseg: 20, Statusz: 'Leadva' }; // Changed from KID, Added Statusz
        const res = await adminAxios.post(`${API_URL}/rendelesek`, rendeles);
        createdRendelesID = res.data.data.RendelesID; // Changed from RID
        log('Order created', res.data);
        if (res.status !== 201 || !createdRendelesID) throw new Error('Failed to create order');
        if (res.data.data.Statusz !== 'Leadva') throw new Error('Incorrect order status');
    });

    await runTest('Admin updates an order status', async () => {
        const res = await adminAxios.patch(`${API_URL}/rendelesek/${createdRendelesID}`, { Statusz: 'Teljesitve' }); // Changed from createdRid
        log('Order status updated', res.data);
        if (res.data.changes !== 1) throw new Error('Failed to update order status');
    });

    // 5. RuhaKiBe (Check-in/out) CRUD
     await runTest('Admin creates a new check-out record', async () => {
        const kiadas = { DolgozoID: createdDolgozoID, RuhaID: createdRuhaID, KiadasDatum: new Date().toISOString(), Mennyiseg: 2 }; // Changed from DID, KID
        const res = await adminAxios.post(`${API_URL}/ruhakibe`, kiadas);
        createdRuhaKiBeID = res.data.data.RuhaKiBeID; // Changed from KiadasID
        log('Check-out record created', res.data);
        if (res.status !== 201 || !createdRuhaKiBeID) throw new Error('Failed to create check-out record');
    });

    await runTest('Admin updates a check-out record with return quality', async () => {
        const res = await adminAxios.patch(`${API_URL}/ruhakibe/${createdRuhaKiBeID}`, { VisszaDatum: new Date().toISOString(), RuhaMinoseg: 'Hasznalt' }); // Added RuhaMinoseg
        log('Check-out record updated with return quality', res.data);
        if (res.data.changes !== 1) throw new Error('Failed to update check-out record with return quality');
    });
    
    // 6. Deletion (Cleanup)
    await runTest('Admin deletes check-out record', async () => {
        const res = await adminAxios.delete(`${API_URL}/ruhakibe/${createdRuhaKiBeID}`); // Changed from createdKiadasId
        if(res.data.changes !== 1) throw new Error('Failed to delete check-out record');
        log('Check-out record deleted');
    });

    await runTest('Admin deletes order', async () => {
        const res = await adminAxios.delete(`${API_URL}/rendelesek/${createdRendelesID}`); // Changed from createdRid
        if(res.data.changes !== 1) throw new Error('Failed to delete order');
        log('Order deleted');
    });

    await runTest('Admin deletes clothing item', async () => {
        const res = await adminAxios.delete(`${API_URL}/ruhak/${createdRuhaID}`); // Changed from createdKid
        if(res.data.changes !== 1) throw new Error('Failed to delete clothing item');
        log('Clothing item deleted');
    });

    await runTest('Admin deletes manager employee', async () => {
        const res = await adminAxios.delete(`${API_URL}/dolgozok/${createdDolgozoID}`); // Changed from createdDid
        if(res.data.changes !== 1) throw new Error('Failed to delete employee');
        log('Manager employee deleted');
    });

    console.log('\n✅ ✅ ✅ ALL TESTS PASSED SUCCESSFULLY! ✅ ✅ ✅\n');
};

main().catch(err => {
    console.error('\n❌ ❌ ❌ A FATAL ERROR OCCURRED DURING TESTING ❌ ❌ ❌\n');
    logError('Fatal error:', err);
    process.exit(1);
});