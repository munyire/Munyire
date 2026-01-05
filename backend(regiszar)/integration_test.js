const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Teszt adatok
const adminUser = {
  DNev: "Test Admin",
  Email: `admin${Date.now()}@test.com`,
  Telefonszam: "123456789",
  Nem: "Férfi",
  Munkakor: "Admin",
  Szerepkor: "Admin",
  FelhasznaloNev: `admin${Date.now()}`,
  Jelszo: "password123"
};

const managerUser = {
  DNev: "Test Manager",
  Email: `manager${Date.now()}@test.com`,
  Telefonszam: "987654321",
  Nem: "Nő",
  Munkakor: "Manager",
  Szerepkor: "Manager",
  FelhasznaloNev: `manager${Date.now()}`,
  Jelszo: "password123"
};

let adminToken = '';
let managerToken = '';
let createdDolgozoID = null;
let createdRuhaID = null;
let createdRendelesID = null;
let createdRuhaKiBeID = null;

let passedTests = 0;
let failedTests = 0;

const log = (message, data = '') => {
  console.log(`\n✓ ${message}`);
  if (data && typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else if (data) {
    console.log(data);
  }
};

const logError = (message, error) => {
  console.error(`\n✗ ${message}`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Data:`, error.response.data);
  } else {
    console.error(error.message);
  }
};

const runTest = async (testName, testFn) => {
  try {
    await testFn();
    passedTests++;
    log(testName);
    return true;
  } catch (error) {
    failedTests++;
    logError(testName, error);
    return false;
  }
};

const main = async () => {
  console.log('\n========================================');
  console.log('Munyire Backend Integration Tests');
  console.log('========================================\n');

  // 0. Ellenőrizzük, hogy van-e már admin (ha igen, próbáljuk meg bejelentkezni)
  let existingAdmin = null;
  try {
    // Próbáljuk meg bejelentkezni egy lehetséges adminnal
    const testLogin = await axios.post(`${API_URL}/auth/login`, {
      FelhasznaloNev: adminUser.FelhasznaloNev,
      Jelszo: adminUser.Jelszo
    });
    if (testLogin.data.token) {
      existingAdmin = { token: testLogin.data.token };
      log('Found existing admin, using it for tests');
    }
  } catch (e) {
    // Nincs még admin, folytatjuk a regisztrációval
  }

  // 1. Authentication
  await runTest('1.1. Register Admin User', async () => {
    if (existingAdmin) {
      log('Admin already exists, skipping registration');
      // Próbáljuk meg bejelentkezni
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: adminUser.FelhasznaloNev,
        Jelszo: adminUser.Jelszo
      });
      adminToken = loginRes.data.token;
      if (!adminToken) throw new Error('Failed to login with existing admin');
      return;
    }
    const res = await axios.post(`${API_URL}/auth/register`, adminUser);
    if (res.status !== 201) throw new Error('Admin registration failed');
    log('Admin registered', { DolgozoID: res.data.DolgozoID });
  });

  await runTest('1.2. Login Admin User', async () => {
    const res = await axios.post(`${API_URL}/auth/login`, {
      FelhasznaloNev: adminUser.FelhasznaloNev,
      Jelszo: adminUser.Jelszo
    });
    adminToken = res.data.token;
    if (!adminToken) throw new Error('Admin login failed');
    log('Admin logged in, token acquired');
  });

  const adminAxios = axios.create({
    headers: { 'x-auth-token': adminToken }
  });

  // 2. Dolgozok CRUD
  await runTest('2.1. Admin creates a new employee (Manager)', async () => {
    // Manager regisztrálása az auth/register endpoint-on keresztül
    const res = await adminAxios.post(`${API_URL}/auth/register`, managerUser);
    createdDolgozoID = res.data.DolgozoID;
    if (res.status !== 201 || !createdDolgozoID) throw new Error('Failed to create manager');
    log('Manager user created', { DolgozoID: createdDolgozoID });
  });

  await runTest('2.2. Admin gets all employees', async () => {
    const res = await adminAxios.get(`${API_URL}/dolgozok`);
    if (!Array.isArray(res.data) || res.data.length < 2) {
      throw new Error('Expected at least two employees');
    }
    log(`Found ${res.data.length} employees`);
  });

  await runTest('2.3. Admin gets employee by ID', async () => {
    const res = await adminAxios.get(`${API_URL}/dolgozok/${createdDolgozoID}`);
    if (res.data.DolgozoID !== createdDolgozoID) {
      throw new Error('Fetched wrong employee');
    }
    log('Employee fetched successfully');
  });

  await runTest('2.4. Admin updates an employee', async () => {
    const res = await adminAxios.patch(`${API_URL}/dolgozok/${createdDolgozoID}`, {
      Munkakor: 'Senior Manager'
    });
    if (res.data.Munkakor !== 'Senior Manager') {
      throw new Error('Failed to update employee');
    }
    log('Employee updated successfully');
  });

  // 3. Ruhak CRUD
  await runTest('3.1. Admin creates a new clothing item', async () => {
    const ruha = {
      Cikkszam: `TEST-${Date.now()}`,
      Fajta: 'Póló',
      Szin: 'Kék',
      Meret: 'L',
      Mennyiseg: 100,
      Minoseg: 'Uj'
    };
    const res = await adminAxios.post(`${API_URL}/ruhak`, ruha);
    createdRuhaID = res.data.RuhaID;
    if (res.status !== 201 || !createdRuhaID) {
      throw new Error('Failed to create clothing item');
    }
    if (res.data.Minoseg !== 'Uj') {
      throw new Error('Incorrect clothing quality');
    }
    log('Clothing item created', { RuhaID: createdRuhaID, Cikkszam: res.data.Cikkszam });
  });

  await runTest('3.2. Admin gets a single clothing item', async () => {
    const res = await adminAxios.get(`${API_URL}/ruhak/${createdRuhaID}`);
    if (res.data.RuhaID !== createdRuhaID) {
      throw new Error('Fetched wrong clothing item');
    }
    log('Single clothing item fetched');
  });

  await runTest('3.3. Admin searches clothing items', async () => {
    const res = await adminAxios.get(`${API_URL}/ruhak/search?q=Póló`);
    if (!Array.isArray(res.data)) {
      throw new Error('Search should return an array');
    }
    log(`Search found ${res.data.length} items`);
  });

  await runTest('3.4. Admin updates a clothing item', async () => {
    const res = await adminAxios.patch(`${API_URL}/ruhak/${createdRuhaID}`, {
      Minoseg: 'Jo'
    });
    if (res.data.Minoseg !== 'Jo') {
      throw new Error('Failed to update clothing item');
    }
    log('Clothing item updated');
  });

  // 4. RuhaKiBe - Kiadás/Visszavétel
  await runTest('4.1. Manager creates a new issue (kiadás)', async () => {
    // Manager login
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      FelhasznaloNev: managerUser.FelhasznaloNev,
      Jelszo: managerUser.Jelszo
    });
    managerToken = loginRes.data.token;
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });

    const kiadas = {
      DolgozoID: createdDolgozoID,
      RuhaID: createdRuhaID,
      KiadasDatum: new Date().toISOString(),
      Mennyiseg: 5,
      Indok: 'Új belépő felszerelés'
    };
    const res = await managerAxios.post(`${API_URL}/ruhakibe`, kiadas);
    createdRuhaKiBeID = res.data.RuhaKiBeID;
    if (res.status !== 201 || !createdRuhaKiBeID) {
      throw new Error('Failed to create issue');
    }
    log('Issue created', { RuhaKiBeID: createdRuhaKiBeID });
  });

  await runTest('4.2. Verify stock decreased after issue', async () => {
    const res = await adminAxios.get(`${API_URL}/ruhak/${createdRuhaID}`);
    if (res.data.Mennyiseg !== 95) { // 100 - 5 = 95
      throw new Error(`Expected stock 95, got ${res.data.Mennyiseg}`);
    }
    log(`Stock correctly decreased to ${res.data.Mennyiseg}`);
  });

  await runTest('4.3. Manager gets active issues', async () => {
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/ruhakibe/active`);
    if (!Array.isArray(res.data)) {
      throw new Error('Should return an array');
    }
    log(`Found ${res.data.length} active issues`);
  });

  await runTest('4.4. Manager creates return (visszavétel)', async () => {
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.patch(`${API_URL}/ruhakibe/${createdRuhaKiBeID}`, {
      VisszaDatum: new Date().toISOString(),
      RuhaMinoseg: 'Jo'
    });
    if (!res.data.VisszaDatum) {
      throw new Error('Return date not set');
    }
    log('Return created successfully');
  });

  await runTest('4.5. Verify stock increased after return', async () => {
    const res = await adminAxios.get(`${API_URL}/ruhak/${createdRuhaID}`);
    if (res.data.Mennyiseg !== 100) { // 95 + 5 = 100
      throw new Error(`Expected stock 100, got ${res.data.Mennyiseg}`);
    }
    log(`Stock correctly increased to ${res.data.Mennyiseg}`);
  });

  // 5. Rendelesek CRUD
  await runTest('5.1. Manager creates a new order', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const rendeles = {
      RuhaID: createdRuhaID,
      RDatum: new Date().toISOString(),
      Mennyiseg: 20,
      Statusz: 'Leadva'
    };
    const res = await managerAxios.post(`${API_URL}/rendelesek`, rendeles);
    createdRendelesID = res.data.RendelesID;
    if (res.status !== 201 || !createdRendelesID) {
      throw new Error('Failed to create order');
    }
    if (res.data.Statusz !== 'Leadva') {
      throw new Error('Incorrect order status');
    }
    log('Order created', { RendelesID: createdRendelesID });
  });

  await runTest('5.2. Manager gets pending orders', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/rendelesek/pending`);
    if (!Array.isArray(res.data)) {
      throw new Error('Should return an array');
    }
    log(`Found ${res.data.length} pending orders`);
  });

  await runTest('5.3. Admin completes order (increases stock)', async () => {
    const res = await adminAxios.patch(`${API_URL}/rendelesek/${createdRendelesID}/complete`);
    if (res.data.hozzaadottMennyiseg !== 20) {
      throw new Error('Incorrect added quantity');
    }
    log('Order completed', { 
      hozzaadottMennyiseg: res.data.hozzaadottMennyiseg,
      ujKeszlet: res.data.ujKeszlet
    });
  });

  await runTest('5.4. Verify stock increased after order completion', async () => {
    const res = await adminAxios.get(`${API_URL}/ruhak/${createdRuhaID}`);
    if (res.data.Mennyiseg !== 120) { // 100 + 20 = 120
      throw new Error(`Expected stock 120, got ${res.data.Mennyiseg}`);
    }
    log(`Stock correctly increased to ${res.data.Mennyiseg}`);
  });

  // 6. Dashboard
  await runTest('6.1. Manager gets dashboard stats', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/dashboard/stats`);
    if (!res.data.osszesRuhaTipus && res.data.osszesRuhaTipus !== 0) {
      throw new Error('Invalid stats response');
    }
    log('Dashboard stats fetched', res.data);
  });

  await runTest('6.2. Manager gets low stock items', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/dashboard/low-stock`);
    if (!Array.isArray(res.data)) {
      throw new Error('Should return an array');
    }
    log(`Found ${res.data.length} low stock items`);
  });

  // 7. Reports
  await runTest('7.1. Manager gets inventory report', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/reports/inventory`);
    if (!res.data.osszesites) {
      throw new Error('Invalid inventory report');
    }
    log('Inventory report fetched');
  });

  await runTest('7.2. Manager gets employee summary', async () => {
    if (!managerToken) {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        FelhasznaloNev: managerUser.FelhasznaloNev,
        Jelszo: managerUser.Jelszo
      });
      managerToken = loginRes.data.token;
    }
    const managerAxios = axios.create({
      headers: { 'x-auth-token': managerToken }
    });
    const res = await managerAxios.get(`${API_URL}/reports/employee-summary`);
    if (!Array.isArray(res.data)) {
      throw new Error('Should return an array');
    }
    log(`Found ${res.data.length} employees in summary`);
  });

  // Summary
  console.log('\n========================================');
  console.log('Test Summary');
  console.log('========================================');
  console.log(`✓ Passed: ${passedTests}`);
  console.log(`✗ Failed: ${failedTests}`);
  console.log(`Total: ${passedTests + failedTests}`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
};

// Futtatás
main().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});

