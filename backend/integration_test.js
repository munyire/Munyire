/**
 * Integration Tests for Munyire API
 * Tests all major endpoints with authentication and authorization
 * 
 * Run with: node integration_test.js
 * Make sure the server is running before executing tests
 */

const http = require('http');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: Date.now(),
};

// Store tokens and IDs for subsequent tests
const testData = {
  adminToken: null,
  managerToken: null,
  dolgozoToken: null,
  adminId: null,
  dolgozoId: null,
  managerId: null,
  ruhaId: null,
  skuRuhaId: null,
  ruhaKiBeId: null,
  rendelesId: null,
};

/**
 * Make HTTP request
 */
function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(TEST_TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Assert helper
 */
function assert(condition, message) {
  results.total++;
  if (condition) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    return true;
  } else {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    return false;
  }
}

/**
 * Log section header
 */
function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Log test group
 */
function logGroup(title) {
  console.log(`\n${colors.blue}► ${title}${colors.reset}`);
}

/**
 * Log sub-group
 */
function logSubGroup(title) {
  console.log(`  ${colors.magenta}› ${title}${colors.reset}`);
}

// ============================================================================
// AUTHENTICATION TESTS
// ============================================================================

async function testHealthCheck() {
  logGroup('Health Check');
  try {
    const res = await request('GET', '/health');
    assert(res.status === 200, 'Health check returns 200');
    assert(res.data.status === 'ok', 'Health check returns status OK');
  } catch (error) {
    assert(false, `Health check failed: ${error.message}`);
  }
}

async function testAuthLogin() {
  logGroup('Authentication - Login Tests');

  // Test 1: Admin login
  logSubGroup('Admin login');
  try {
    const res = await request('POST', '/api/auth/login', {
      username: process.env.ADMIN_USER || 'admin',
      password: process.env.ADMIN_PASS || 'alma',
    });

    if (res.status !== 200) {
      console.log(`${colors.yellow}Login response:${colors.reset}`, JSON.stringify(res.data, null, 2));
    }
    assert(res.status === 200, 'Admin login returns 200');
    assert(res.data.token, 'Admin login returns token');
    assert(res.data.user, 'Admin login returns user data');
    assert(res.data.user.role === 'Admin', 'Admin has correct role');

    if (res.data.token) {
      testData.adminToken = res.data.token;
      testData.adminId = res.data.user.id;
    }
  } catch (error) {
    assert(false, `Admin login failed: ${error.message}`);
  }

  // Test 2: Invalid credentials
  logSubGroup('Invalid credentials');
  try {
    const res = await request('POST', '/api/auth/login', {
      username: 'nonexistent',
      password: 'wrongpassword',
    });
    assert(res.status === 401, 'Invalid login returns 401');
  } catch (error) {
    assert(false, `Invalid login test failed: ${error.message}`);
  }

  // Test 3: Missing credentials
  logSubGroup('Missing credentials');
  try {
    const res = await request('POST', '/api/auth/login', {});
    assert(res.status === 400 || res.status === 401, 'Missing credentials returns error');
  } catch (error) {
    assert(false, `Missing credentials test failed: ${error.message}`);
  }
}

async function testAuthRegister() {
  logGroup('Authentication - Registration Tests');

  // Test 1: Register Manager (as Admin)
  logSubGroup('Register Manager as Admin');
  const timestamp = Date.now();
  const newManager = {
    name: 'Test Manager',
    email: `manager${timestamp}@test.com`,
    username: `manager${timestamp}`,
    password: 'Manager123!',
    role: 'Manager',
  };

  try {
    const res = await request('POST', '/api/auth/register', newManager, testData.adminToken);
    assert(res.status === 201, 'Manager registration returns 201');
    assert(res.data.id, 'Manager registration returns user ID');

    // Login with the new manager
    const loginRes = await request('POST', '/api/auth/login', {
      username: newManager.username,
      password: newManager.password,
    });

    assert(loginRes.status === 200, 'New manager can login');
    assert(loginRes.data.user.role === 'Manager', 'New user has Manager role');
    
    if (loginRes.data.token) {
      testData.managerToken = loginRes.data.token;
      testData.managerId = res.data.id;
    }
  } catch (error) {
    assert(false, `Manager registration failed: ${error.message}`);
  }

  // Test 2: Register Dolgozo (as Admin)
  logSubGroup('Register Dolgozo as Admin');
  const dolgozoTimestamp = Date.now();
  const newDolgozo = {
    name: 'Test Dolgozó',
    email: `dolgozo${dolgozoTimestamp}@test.com`,
    username: `dolgozo${dolgozoTimestamp}`,
    password: 'Dolgozo123!',
    role: 'Dolgozo',
  };

  try {
    const res = await request('POST', '/api/auth/register', newDolgozo, testData.adminToken);
    assert(res.status === 201, 'Employee registration returns 201');

    if (res.data.id) {
      testData.dolgozoId = res.data.id;
    }

    // Login with the new employee
    const loginRes = await request('POST', '/api/auth/login', {
      username: newDolgozo.username,
      password: newDolgozo.password,
    });

    assert(loginRes.status === 200, 'New employee can login');
    assert(loginRes.data.user.role === 'Dolgozo', 'New user has Dolgozo role');
    
    if (loginRes.data.token) {
      testData.dolgozoToken = loginRes.data.token;
    }
  } catch (error) {
    assert(false, `Employee registration failed: ${error.message}`);
  }

  // Test 3: Unauthorized registration (without token)
  logSubGroup('Unauthorized registration (no token)');
  try {
    const res = await request('POST', '/api/auth/register', {
      name: 'Unauthorized User',
      email: 'unauth@test.com',
      username: 'unauth',
      password: 'Test123!',
    });
    assert(res.status === 401, 'Registration without token returns 401');
  } catch (error) {
    assert(false, `Unauthorized registration test failed: ${error.message}`);
  }

  // Test 4: Duplicate username
  logSubGroup('Duplicate username prevention');
  try {
    const res = await request('POST', '/api/auth/register', {
      name: 'Duplicate User',
      email: `dup${Date.now()}@test.com`,
      username: 'admin', // existing username
      password: 'Test123!',
      role: 'Dolgozo',
    }, testData.adminToken);
    assert(res.status === 409, 'Duplicate username returns 409');
  } catch (error) {
    assert(false, `Duplicate username test failed: ${error.message}`);
  }

  // Test 5: Registration as Manager (should fail - only Admin can register)
  logSubGroup('Manager cannot register new users');
  try {
    const res = await request('POST', '/api/auth/register', {
      name: 'Should Fail',
      email: `fail${Date.now()}@test.com`,
      username: `fail${Date.now()}`,
      password: 'Test123!',
      role: 'Dolgozo',
    }, testData.managerToken);
    assert(res.status === 403, 'Manager registration attempt returns 403');
  } catch (error) {
    assert(false, `Manager registration restriction test failed: ${error.message}`);
  }
}

// ============================================================================
// DOLGOZÓK TESTS
// ============================================================================

async function testDolgozok() {
  logGroup('Dolgozók - List All');
  try {
    const res = await request('GET', '/api/dolgozok', null, testData.managerToken);
    assert(res.status === 200, 'List employees returns 200');
    assert(Array.isArray(res.data), 'List employees returns array');
    if (res.data.length > 0) {
      assert(res.data[0].DolgozoID !== undefined, 'Employee has DolgozoID');
      assert(res.data[0].JelszoHash === undefined, 'Password hash is NOT exposed');
    }
  } catch (error) {
    assert(false, `List employees failed: ${error.message}`);
  }

  // Test: List names (dropdown)
  logGroup('Dolgozók - List Names (Dropdown)');
  try {
    const res = await request('GET', '/api/dolgozok/names', null, testData.managerToken);
    assert(res.status === 200, 'List names returns 200');
    assert(Array.isArray(res.data), 'List names returns array');
    if (res.data.length > 0) {
      assert(res.data[0].DNev !== undefined, 'Item has DNev');
      assert(res.data[0].DolgozoID !== undefined, 'Item has DolgozoID');
      assert(res.data[0].Jelszo === undefined, 'Item does NOT have Jelszo');
    }
  } catch (error) {
    assert(false, `List names failed: ${error.message}`);
  }

  // Test: Search
  logGroup('Dolgozók - Search');
  try {
    const res = await request('GET', '/api/dolgozok/search?q=test', null, testData.managerToken);
    assert(res.status === 200, 'Search employees returns 200');
    assert(Array.isArray(res.data), 'Search returns array');
  } catch (error) {
    assert(false, `Search employees failed: ${error.message}`);
  }

  // Test: Get specific employee
  if (testData.dolgozoId) {
    logGroup('Dolgozók - Get Specific');
    try {
      const res = await request('GET', `/api/dolgozok/${testData.dolgozoId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get employee returns 200');
      assert(res.data.DolgozoID === testData.dolgozoId, 'Returns correct employee');
      assert(res.data.JelszoHash === undefined, 'Password hash is NOT exposed');
    } catch (error) {
      assert(false, `Get employee failed: ${error.message}`);
    }
  }

  // Test: Create employee (as Admin)
  logGroup('Dolgozók - Create (Admin)');
  const createTimestamp = Date.now();
  let createdDolgozoId = null;
  try {
    const res = await request('POST', '/api/dolgozok', {
      DNev: 'Create Test Dolgozó',
      Email: `create${createTimestamp}@test.com`,
      FelhasznaloNev: `createdolgozo${createTimestamp}`,
      password: 'Password123!',
      Szerepkor: 'Dolgozo',
      Nem: 'Férfi',
      Telefonszam: '+36201234567',
      Munkakor: 'Tesztelő',
    }, testData.adminToken);

    assert(res.status === 201, 'Create employee returns 201');
    assert(res.data.DolgozoID, 'Created employee has ID');
    createdDolgozoId = res.data.DolgozoID;
  } catch (error) {
    assert(false, `Create employee failed: ${error.message}`);
  }

  // Test: Manager cannot create employee directly
  logGroup('Dolgozók - Manager Cannot Create (Authorization)');
  try {
    const res = await request('POST', '/api/dolgozok', {
      DNev: 'Should Fail',
      Email: `fail${Date.now()}@test.com`,
      FelhasznaloNev: `fail${Date.now()}`,
      password: 'Password123!',
      Szerepkor: 'Dolgozo',
    }, testData.managerToken);
    assert(res.status === 403, 'Manager creating employee returns 403');
  } catch (error) {
    assert(false, `Manager create restriction test failed: ${error.message}`);
  }

  // Test: Update employee
  if (createdDolgozoId) {
    logGroup('Dolgozók - Update');
    try {
      const res = await request('PATCH', `/api/dolgozok/${createdDolgozoId}`, {
        Telefonszam: '+36309999999',
        Munkakor: 'Frissített Munkakör',
      }, testData.adminToken);

      assert(res.status === 200, 'Update employee returns 200');
    } catch (error) {
      assert(false, `Update employee failed: ${error.message}`);
    }

    // Test: Manager cannot update employee
    logSubGroup('Manager cannot update');
    try {
      const res = await request('PATCH', `/api/dolgozok/${createdDolgozoId}`, {
        Telefonszam: '+36308888888',
      }, testData.managerToken);
      assert(res.status === 403, 'Manager updating employee returns 403');
    } catch (error) {
      assert(false, `Manager update restriction test failed: ${error.message}`);
    }
  }

  // Test: Employee history and active items
  if (testData.dolgozoId) {
    logGroup('Dolgozók - History & Active Items');
    try {
      const res = await request('GET', `/api/dolgozok/${testData.dolgozoId}/ruhak`, null, testData.managerToken);
      assert(res.status === 200, 'Get employee history returns 200');
      assert(Array.isArray(res.data), 'History returns array');
    } catch (error) {
      assert(false, `Get employee history failed: ${error.message}`);
    }

    try {
      const res = await request('GET', `/api/dolgozok/${testData.dolgozoId}/ruhak/aktiv`, null, testData.managerToken);
      assert(res.status === 200, 'Get employee active items returns 200');
      assert(Array.isArray(res.data), 'Active items returns array');
    } catch (error) {
      assert(false, `Get employee active items failed: ${error.message}`);
    }
  }

  // Test: With active items
  logGroup('Dolgozók - With Active Items');
  try {
    const res = await request('GET', '/api/dolgozok/with-active-items', null, testData.managerToken);
    assert(res.status === 200, 'Get employees with active items returns 200');
    assert(Array.isArray(res.data), 'Returns array');
  } catch (error) {
    assert(false, `Get employees with active items failed: ${error.message}`);
  }

  // Test: Self access (Dolgozo viewing own data)
  logGroup('Dolgozók - Self Access Authorization');
  try {
    const res = await request('GET', `/api/dolgozok/${testData.dolgozoId}`, null, testData.dolgozoToken);
    assert(res.status === 200, 'Dolgozo can view own data');
  } catch (error) {
    assert(false, `Self access test failed: ${error.message}`);
  }

  // Test: Non-self access (Dolgozo viewing other's data)
  logSubGroup('Dolgozo cannot view other\'s data');
  try {
    const res = await request('GET', `/api/dolgozok/${testData.adminId}`, null, testData.dolgozoToken);
    assert(res.status === 403, 'Dolgozo viewing other data returns 403');
  } catch (error) {
    assert(false, `Non-self access restriction test failed: ${error.message}`);
  }

  // Cleanup: Delete created employee
  if (createdDolgozoId) {
    logGroup('Dolgozók - Delete');
    try {
      const res = await request('DELETE', `/api/dolgozok/${createdDolgozoId}`, null, testData.adminToken);
      assert(res.status === 204 || res.status === 200, 'Delete employee returns 204/200');
    } catch (error) {
      assert(false, `Delete employee failed: ${error.message}`);
    }
  }

  // Test: Non-existent employee
  logGroup('Dolgozók - Non-existent Employee (404)');
  try {
    const res = await request('GET', '/api/dolgozok/99999', null, testData.managerToken);
    assert(res.status === 404, 'Non-existent employee returns 404');
  } catch (error) {
    assert(false, `Non-existent employee test failed: ${error.message}`);
  }
}

// ============================================================================
// RUHÁK TESTS
// ============================================================================

async function testRuhak() {
  logGroup('Ruhák - Create with Auto-Generated Cikkszam');
  const newRuha = {
    Fajta: 'Munkaruha-Teszt',
    Szin: 'Kék',
    Meret: 'L',
    Minoseg: 'Új',
    Mennyiseg: 10,
    Ar: 5000,
  };

  try {
    const res = await request('POST', '/api/ruhak', newRuha, testData.adminToken);
    assert(res.status === 201, 'Create ruha returns 201');
    assert(res.data.Cikkszam, 'Create ruha returns Cikkszam');
    assert(Number.isInteger(res.data.Cikkszam), 'Cikkszam is integer');
    assert(res.data.Cikkszam >= 1000000, 'Cikkszam >= 1000000');

    if (res.data.Cikkszam) {
      testData.ruhaId = res.data.Cikkszam;
    }
  } catch (error) {
    assert(false, `Create ruha failed: ${error.message}`);
  }

  // Test: Create with duplicate (should fail)
  logSubGroup('Duplicate prevention');
  try {
    const res = await request('POST', '/api/ruhak', newRuha, testData.adminToken);
    assert(res.status === 409, 'Duplicate ruha returns 409');
  } catch (error) {
    assert(false, `Duplicate ruha test failed: ${error.message}`);
  }

  // Test: Manager cannot create ruha
  logSubGroup('Manager cannot create (Authorization)');
  try {
    const res = await request('POST', '/api/ruhak', {
      Fajta: 'Should Fail',
      Szin: 'Red',
      Meret: 'M',
      Minoseg: 'Új',
      Mennyiseg: 5,
    }, testData.managerToken);
    assert(res.status === 403, 'Manager creating ruha returns 403');
  } catch (error) {
    assert(false, `Manager create restriction test failed: ${error.message}`);
  }

  logGroup('Ruhák - List All');
  try {
    const res = await request('GET', '/api/ruhak', null, testData.managerToken);
    assert(res.status === 200, 'List ruhak returns 200');
    assert(Array.isArray(res.data), 'List ruhak returns array');
    if (res.data.length > 0) {
      assert(res.data[0].Cikkszam !== undefined, 'Ruha has Cikkszam');
      assert(res.data[0].Raktars !== undefined, 'Ruha has Raktars (inventory)');
    }
  } catch (error) {
    assert(false, `List ruhak failed: ${error.message}`);
  }

  // Test: Get specific ruha
  if (testData.ruhaId) {
    logGroup('Ruhák - Get Specific');
    try {
      const res = await request('GET', `/api/ruhak/${testData.ruhaId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get ruha returns 200');
      assert(res.data.Cikkszam === testData.ruhaId, 'Returns correct ruha Cikkszam');
      assert(res.data.Raktars && Array.isArray(res.data.Raktars), 'Returns Raktar inventory info');
    } catch (error) {
      assert(false, `Get ruha failed: ${error.message}`);
    }

    // Test: Get by Cikkszam (alternative endpoint)
    logSubGroup('Get by Cikkszam (alternative endpoint)');
    try {
      const res = await request('GET', `/api/ruhak/by-cikkszam/${testData.ruhaId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get by cikkszam returns 200');
      assert(res.data.Cikkszam === testData.ruhaId, 'Returns correct ruha');
    } catch (error) {
      assert(false, `Get by cikkszam failed: ${error.message}`);
    }
  }

  // Test: Search
  logGroup('Ruhák - Search');
  try {
    const res = await request('GET', `/api/ruhak/search?q=Munkaruha`, null, testData.managerToken);
    assert(res.status === 200, 'Search ruhak returns 200');
    assert(Array.isArray(res.data), 'Search returns array');
  } catch (error) {
    assert(false, `Search ruhak failed: ${error.message}`);
  }

  // Test: Search no results
  logSubGroup('Search with no results');
  try {
    const res = await request('GET', `/api/ruhak/search?q=NONEXISTENTXYZ123`, null, testData.managerToken);
    assert(res.status === 200, 'Search no results returns 200');
    assert(Array.isArray(res.data) && res.data.length === 0, 'Empty array for no results');
  } catch (error) {
    assert(false, `Search no results test failed: ${error.message}`);
  }

  // Test: Metadata options
  logGroup('Ruhák - Metadata Options');
  try {
    const res = await request('GET', '/api/ruhak/options', null, testData.managerToken);
    assert(res.status === 200, 'Get options returns 200');
    assert(Array.isArray(res.data.types), 'Options contains types array');
    assert(Array.isArray(res.data.colors), 'Options contains colors array');
    assert(Array.isArray(res.data.sizes), 'Options contains sizes array');
  } catch (error) {
    assert(false, `Get options failed: ${error.message}`);
  }

  // Test: History and Active items
  if (testData.ruhaId) {
    logGroup('Ruhák - History & Active Items');
    try {
      const res = await request('GET', `/api/ruhak/${testData.ruhaId}/history`, null, testData.managerToken);
      assert(res.status === 200, 'Get ruha history returns 200');
      assert(Array.isArray(res.data), 'History returns array');
    } catch (error) {
      assert(false, `Get ruha history failed: ${error.message}`);
    }

    try {
      const res = await request('GET', `/api/ruhak/${testData.ruhaId}/active`, null, testData.managerToken);
      assert(res.status === 200, 'Get ruha active items returns 200');
      assert(Array.isArray(res.data), 'Active items returns array');
    } catch (error) {
      assert(false, `Get ruha active items failed: ${error.message}`);
    }
  }

  // Test: Update ruha
  if (testData.ruhaId) {
    logGroup('Ruhák - Update');
    try {
      const res = await request('PATCH', `/api/ruhak/${testData.ruhaId}`, {
        Ar: 6000,
      }, testData.adminToken);

      assert(res.status === 200, 'Update ruha returns 200');
    } catch (error) {
      assert(false, `Update ruha failed: ${error.message}`);
    }

    // Test: Manager cannot update
    logSubGroup('Manager cannot update');
    try {
      const res = await request('PATCH', `/api/ruhak/${testData.ruhaId}`, {
        Ar: 7000,
      }, testData.managerToken);
      assert(res.status === 403, 'Manager updating ruha returns 403');
    } catch (error) {
      assert(false, `Manager update restriction test failed: ${error.message}`);
    }
  }

  // Test: Non-existent ruha (404)
  logGroup('Ruhák - Non-existent (404)');
  try {
    const res = await request('GET', '/api/ruhak/9999999', null, testData.managerToken);
    assert(res.status === 404, 'Non-existent ruha returns 404');
  } catch (error) {
    assert(false, `Non-existent ruha test failed: ${error.message}`);
  }
}

// ============================================================================
// SKU & VARIANTS TESTS
// ============================================================================

async function testSkuAndVariants() {
  logGroup('SKU - Generate Multiple');
  
  const baseRuha = {
    Fajta: 'TESZT-Póló-Variant',
    Szin: 'Fehér',
    Meret: 'XL',
    Minoseg: 'Új',
    Mennyiseg: 5,
  };

  let firstSku = null;
  try {
    const res = await request('POST', '/api/ruhak', baseRuha, testData.adminToken);
    assert(res.status === 201, 'Create auto-SKU Item 1 returns 201');
    assert(Number.isInteger(res.data.Cikkszam), 'Generated SKU is Integer');
    assert(res.data.Cikkszam >= 1000000, 'Generated SKU is >= 1000000');

    firstSku = res.data.Cikkszam;
    if (res.data.Cikkszam) {
      testData.skuRuhaId = res.data.Cikkszam;
    }
  } catch (error) {
    assert(false, `Auto-SKU Item 1 failed: ${error.message}`);
  }

  // Create variant with same attributes but different cikkszam (should fail - duplicate)
  logSubGroup('Duplicate prevention');
  try {
    const res = await request('POST', '/api/ruhak', baseRuha, testData.adminToken);
    assert(res.status === 409, 'Duplicate creation returns 409 Conflict');
  } catch (error) {
    assert(false, `Duplicate check failed: ${error.message}`);
  }

  // Test: Delete variant
  if (testData.skuRuhaId) {
    logGroup('Ruhák - Variant Management');
    
    // First add a variant with different quality
    try {
      const res = await request('PATCH', `/api/ruhak/${testData.skuRuhaId}`, {
        Mennyiseg: 3,
        Minoseg: 'Jó',
      }, testData.adminToken);
      assert(res.status === 200, 'Add variant returns 200');
    } catch (error) {
      assert(false, `Add variant failed: ${error.message}`);
    }

    // Delete variant
    logSubGroup('Delete variant');
    try {
      const res = await request('DELETE', `/api/ruhak/${testData.skuRuhaId}/variants/Jó`, null, testData.adminToken);
      assert(res.status === 204 || res.status === 200, 'Delete variant returns 204/200');
    } catch (error) {
      assert(false, `Delete variant failed: ${error.message}`);
    }
  }
}

// ============================================================================
// RUHAKIBE TESTS
// ============================================================================

async function testRuhaKiBe() {
  if (!testData.dolgozoId || !testData.ruhaId) {
    console.log(`${colors.yellow}⚠ Skipping RuhaKiBe tests (missing dolgozoId or ruhaId)${colors.reset}`);
    return;
  }

  logGroup('RuhaKiBe - Issue Item (Kiadás)');
  const newKiadas = {
    DolgozoID: testData.dolgozoId,
    RuhaID: testData.ruhaId,
    Mennyiseg: 2,
    Indok: 'Teszt kiadás',
  };

  try {
    const res = await request('POST', '/api/ruhakibe', newKiadas, testData.managerToken);
    assert(res.status === 201, 'Issue item returns 201');
    assert(res.data.RuhaKiBeID, 'Issue returns transaction ID');
    assert(res.data.DolgozoID === testData.dolgozoId, 'Transaction has correct DolgozoID');

    if (res.data.RuhaKiBeID) {
      testData.ruhaKiBeId = res.data.RuhaKiBeID;
    }
  } catch (error) {
    assert(false, `Issue item failed: ${error.message}`);
  }

  // Test: Dolgozo cannot issue items
  logSubGroup('Dolgozo cannot issue (Authorization)');
  try {
    const res = await request('POST', '/api/ruhakibe', {
      DolgozoID: testData.dolgozoId,
      RuhaID: testData.ruhaId,
      Mennyiseg: 1,
    }, testData.dolgozoToken);
    assert(res.status === 403, 'Dolgozo issuing returns 403');
  } catch (error) {
    assert(false, `Dolgozo issue restriction test failed: ${error.message}`);
  }

  // Test: Insufficient stock
  logSubGroup('Insufficient stock handling');
  try {
    const res = await request('POST', '/api/ruhakibe', {
      DolgozoID: testData.dolgozoId,
      RuhaID: testData.ruhaId,
      Mennyiseg: 99999, // Way too much
    }, testData.managerToken);
    assert(res.status === 400 || res.status === 409 || res.status === 422, 'Insufficient stock returns error');
  } catch (error) {
    assert(false, `Insufficient stock test failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - List All');
  try {
    const res = await request('GET', '/api/ruhakibe', null, testData.managerToken);
    assert(res.status === 200, 'List transactions returns 200');
    assert(Array.isArray(res.data), 'List transactions returns array');
  } catch (error) {
    assert(false, `List transactions failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - Active Items');
  try {
    const res = await request('GET', '/api/ruhakibe/active', null, testData.managerToken);
    assert(res.status === 200, 'List active items returns 200');
    assert(Array.isArray(res.data), 'Active items returns array');
  } catch (error) {
    assert(false, `List active items failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - Returned Items');
  try {
    const res = await request('GET', '/api/ruhakibe/returned', null, testData.managerToken);
    assert(res.status === 200, 'List returned items returns 200');
    assert(Array.isArray(res.data), 'Returned items returns array');
  } catch (error) {
    assert(false, `List returned items failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - My Items (Mine endpoint)');
  try {
    // Dolgozo viewing own items
    const res = await request('GET', '/api/ruhakibe/mine', null, testData.dolgozoToken);
    assert(res.status === 200, 'Get my items returns 200');
    assert(Array.isArray(res.data), 'My items returns array');
  } catch (error) {
    assert(false, `Get my items failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - By Date Filter');
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/ruhakibe/by-date?from=${today}&to=${today}`, null, testData.managerToken);
    assert(res.status === 200, 'Get items by date returns 200');
    assert(Array.isArray(res.data), 'Items by date returns array');
  } catch (error) {
    assert(false, `Get items by date failed: ${error.message}`);
  }

  logGroup('RuhaKiBe - Statistics');
  try {
    const res = await request('GET', '/api/ruhakibe/stats', null, testData.managerToken);
    assert(res.status === 200, 'Statistics returns 200');
    assert(res.data.totalIssued !== undefined || res.data.activeCount !== undefined, 'Statistics contains data');
  } catch (error) {
    assert(false, `Statistics failed: ${error.message}`);
  }

  // Test: Get specific transaction
  if (testData.ruhaKiBeId) {
    logGroup('RuhaKiBe - Get Specific Transaction');
    try {
      const res = await request('GET', `/api/ruhakibe/${testData.ruhaKiBeId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get specific transaction returns 200');
      assert(res.data.RuhaKiBeID === testData.ruhaKiBeId, 'Correct transaction ID');
    } catch (error) {
      assert(false, `Get specific transaction failed: ${error.message}`);
    }

    // Test: Return item
    logGroup('RuhaKiBe - Return Item (Visszavétel)');
    try {
      const res = await request('PATCH', `/api/ruhakibe/${testData.ruhaKiBeId}`, {
        VisszaDatum: new Date().toISOString().split('T')[0],
        RuhaMinoseg: 'Használt',
      }, testData.managerToken);

      assert(res.status === 200, 'Return item returns 200');
    } catch (error) {
      assert(false, `Return item failed: ${error.message}`);
    }

    // Test: Dolgozo cannot return items
    logSubGroup('Dolgozo cannot return (Authorization)');
    try {
      const res = await request('PATCH', `/api/ruhakibe/${testData.ruhaKiBeId}`, {
        VisszaDatum: new Date().toISOString().split('T')[0],
      }, testData.dolgozoToken);
      assert(res.status === 403, 'Dolgozo returning returns 403');
    } catch (error) {
      assert(false, `Dolgozo return restriction test failed: ${error.message}`);
    }
  }

  // Test: Non-existent transaction (404)
  logGroup('RuhaKiBe - Non-existent Transaction (404)');
  try {
    const res = await request('GET', '/api/ruhakibe/99999', null, testData.managerToken);
    assert(res.status === 404, 'Non-existent transaction returns 404');
  } catch (error) {
    assert(false, `Non-existent transaction test failed: ${error.message}`);
  }
}

// ============================================================================
// RENDELÉSEK TESTS
// ============================================================================

async function testRendelesek() {
  if (!testData.ruhaId) {
    console.log(`${colors.yellow}⚠ Skipping Rendelések tests (missing ruhaId)${colors.reset}`);
    return;
  }

  logGroup('Rendelések - Create');
  const newRendeles = {
    Cikkszam: testData.ruhaId,
    Mennyiseg: 5,
    Szallito: 'Teszt Szállító',
    Megjegyzes: 'Teszt rendelés',
  };

  try {
    const res = await request('POST', '/api/rendelesek', newRendeles, testData.managerToken);
    assert(res.status === 201, 'Create order returns 201');
    assert(res.data.RendelesID, 'Create order returns ID');
    assert(res.data.Statusz === 'Leadva', 'New order has status Leadva');

    if (res.data.RendelesID) {
      testData.rendelesId = res.data.RendelesID;
    }
  } catch (error) {
    assert(false, `Create order failed: ${error.message}`);
  }

  // Test: Dolgozo cannot create orders
  logSubGroup('Dolgozo cannot create (Authorization)');
  try {
    const res = await request('POST', '/api/rendelesek', {
      RuhaID: testData.ruhaId,
      Mennyiseg: 1,
    }, testData.dolgozoToken);
    assert(res.status === 403, 'Dolgozo creating order returns 403');
  } catch (error) {
    assert(false, `Dolgozo create restriction test failed: ${error.message}`);
  }

  logGroup('Rendelések - List All');
  try {
    const res = await request('GET', '/api/rendelesek', null, testData.managerToken);
    assert(res.status === 200, 'List orders returns 200');
    assert(Array.isArray(res.data), 'List orders returns array');
  } catch (error) {
    assert(false, `List orders failed: ${error.message}`);
  }

  logGroup('Rendelések - Pending Orders');
  try {
    const res = await request('GET', '/api/rendelesek/pending', null, testData.managerToken);
    assert(res.status === 200, 'Pending orders returns 200');
    assert(Array.isArray(res.data), 'Pending orders returns array');
  } catch (error) {
    assert(false, `Pending orders failed: ${error.message}`);
  }

  logGroup('Rendelések - By Status');
  try {
    const res = await request('GET', `/api/rendelesek/by-status/${encodeURIComponent('Leadva')}`, null, testData.managerToken);
    assert(res.status === 200, 'Get orders by status returns 200');
    assert(Array.isArray(res.data), 'Orders by status returns array');
  } catch (error) {
    assert(false, `Get orders by status failed: ${error.message}`);
  }

  // Test: Get by Ruha
  logGroup('Rendelések - By Ruha');
  try {
    const res = await request('GET', `/api/rendelesek/by-ruha/${testData.ruhaId}`, null, testData.managerToken);
    assert(res.status === 200, 'Get orders by ruha returns 200');
    assert(Array.isArray(res.data), 'Orders by ruha returns array');
  } catch (error) {
    assert(false, `Get orders by ruha failed: ${error.message}`);
  }

  // Test: Get specific order
  if (testData.rendelesId) {
    logGroup('Rendelések - Get Specific');
    try {
      const res = await request('GET', `/api/rendelesek/${testData.rendelesId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get specific order returns 200');
      assert(res.data.RendelesID === testData.rendelesId, 'Correct order ID');
    } catch (error) {
      assert(false, `Get specific order failed: ${error.message}`);
    }

    // Test: Update order
    logSubGroup('Update order');
    try {
      const res = await request('PATCH', `/api/rendelesek/${testData.rendelesId}`, {
        Megjegyzes: 'Updated comment',
      }, testData.managerToken);
      assert(res.status === 200, 'Update order returns 200');
    } catch (error) {
      assert(false, `Update order failed: ${error.message}`);
    }

    // Test: Complete order (Admin only)
    logGroup('Rendelések - Complete Order (Admin)');
    try {
      const res = await request('PATCH', `/api/rendelesek/${testData.rendelesId}/complete`, {}, testData.adminToken);
      assert(res.status === 200, 'Complete order returns 200');
    } catch (error) {
      assert(false, `Complete order failed: ${error.message}`);
    }

    // Test: Manager cannot complete
    logSubGroup('Manager cannot complete');
    // Create another order for this test
    const anotherRes = await request('POST', '/api/rendelesek', {
      RuhaID: testData.ruhaId,
      Mennyiseg: 1,
    }, testData.managerToken);
    
    if (anotherRes.status === 201 && anotherRes.data.RendelesID) {
      try {
        const res = await request('PATCH', `/api/rendelesek/${anotherRes.data.RendelesID}/complete`, {}, testData.managerToken);
        assert(res.status === 403, 'Manager completing order returns 403');
        // Cleanup
        await request('DELETE', `/api/rendelesek/${anotherRes.data.RendelesID}`, null, testData.adminToken);
      } catch (error) {
        assert(false, `Manager complete restriction test failed: ${error.message}`);
      }
    }
  }

  // Test: Non-existent order (404)
  logGroup('Rendelések - Non-existent Order (404)');
  try {
    const res = await request('GET', '/api/rendelesek/99999', null, testData.managerToken);
    assert(res.status === 404, 'Non-existent order returns 404');
  } catch (error) {
    assert(false, `Non-existent order test failed: ${error.message}`);
  }
}

// ============================================================================
// DASHBOARD TESTS
// ============================================================================

async function testDashboard() {
  logGroup('Dashboard - Statistics');
  try {
    const res = await request('GET', '/api/dashboard/stats', null, testData.managerToken);
    assert(res.status === 200, 'Dashboard stats returns 200');
    assert(res.data.totalWorkers !== undefined || res.data.dolgozoCount !== undefined, 'Stats contain employee count');
    assert(res.data.totalClothes !== undefined, 'Stats contain clothes count');
  } catch (error) {
    assert(false, `Dashboard stats failed: ${error.message}`);
  }

  // Test: Dolgozo cannot access dashboard
  logSubGroup('Dolgozo cannot access dashboard');
  try {
    const res = await request('GET', '/api/dashboard/stats', null, testData.dolgozoToken);
    assert(res.status === 403, 'Dolgozo accessing dashboard returns 403');
  } catch (error) {
    assert(false, `Dolgozo dashboard restriction test failed: ${error.message}`);
  }

  logGroup('Dashboard - Low Stock');
  try {
    const res = await request('GET', '/api/dashboard/low-stock', null, testData.managerToken);
    assert(res.status === 200, 'Low stock returns 200');
    assert(Array.isArray(res.data), 'Low stock returns array');
  } catch (error) {
    assert(false, `Low stock failed: ${error.message}`);
  }

  logGroup('Dashboard - Recent Activity');
  try {
    const res = await request('GET', '/api/dashboard/recent-activity', null, testData.managerToken);
    assert(res.status === 200, 'Recent activity returns 200');
    assert(res.data.recentKibe !== undefined || Array.isArray(res.data), 'Recent activity returns data');
  } catch (error) {
    assert(false, `Recent activity failed: ${error.message}`);
  }
}

// ============================================================================
// REPORTS TESTS
// ============================================================================

async function testReports() {
  logGroup('Reports - Inventory Report');
  try {
    const res = await request('GET', '/api/reports/inventory', null, testData.managerToken);
    assert(res.status === 200, 'Inventory report returns 200');
    assert(Array.isArray(res.data), 'Inventory report returns array');
  } catch (error) {
    assert(false, `Inventory report failed: ${error.message}`);
  }

  logGroup('Reports - Employee Summary');
  try {
    const res = await request('GET', '/api/reports/employee-summary', null, testData.managerToken);
    assert(res.status === 200, 'Employee summary returns 200');
    assert(Array.isArray(res.data) || typeof res.data === 'object', 'Employee summary returns data');
  } catch (error) {
    assert(false, `Employee summary failed: ${error.message}`);
  }

  logGroup('Reports - Monthly Report');
  try {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const res = await request('GET', `/api/reports/monthly?year=${year}&month=${month}`, null, testData.managerToken);
    assert(res.status === 200, 'Monthly report returns 200');
  } catch (error) {
    assert(false, `Monthly report failed: ${error.message}`);
  }

  logGroup('Reports - Quality Summary (Admin Only)');
  try {
    const res = await request('GET', '/api/reports/quality-summary', null, testData.adminToken);
    assert(res.status === 200, 'Quality summary returns 200');
  } catch (error) {
    assert(false, `Quality summary failed: ${error.message}`);
  }

  // Test: Manager cannot access quality summary
  logSubGroup('Manager cannot access quality summary');
  try {
    const res = await request('GET', '/api/reports/quality-summary', null, testData.managerToken);
    assert(res.status === 403, 'Manager accessing quality summary returns 403');
  } catch (error) {
    assert(false, `Manager quality summary restriction test failed: ${error.message}`);
  }

  // Test: Dolgozo cannot access any reports
  logSubGroup('Dolgozo cannot access reports');
  try {
    const res = await request('GET', '/api/reports/inventory', null, testData.dolgozoToken);
    assert(res.status === 403, 'Dolgozo accessing reports returns 403');
  } catch (error) {
    assert(false, `Dolgozo reports restriction test failed: ${error.message}`);
  }
}

// ============================================================================
// AUTHORIZATION & EDGE CASE TESTS
// ============================================================================

async function testAuthorizationAndEdgeCases() {
  logSection('AUTHORIZATION & EDGE CASE TESTS');

  logGroup('Protected Endpoints Without Token');
  try {
    const endpoints = [
      { method: 'GET', path: '/api/dolgozok' },
      { method: 'GET', path: '/api/ruhak' },
      { method: 'GET', path: '/api/ruhakibe' },
      { method: 'GET', path: '/api/rendelesek' },
      { method: 'GET', path: '/api/dashboard/stats' },
    ];

    for (const endpoint of endpoints) {
      const res = await request(endpoint.method, endpoint.path);
      assert(res.status === 401, `${endpoint.method} ${endpoint.path} without token returns 401`);
    }
  } catch (error) {
    assert(false, `Protected endpoints test failed: ${error.message}`);
  }

  logGroup('Invalid Token');
  try {
    const res = await request('GET', '/api/dolgozok', null, 'invalid_token_here');
    assert(res.status === 401, 'Request with invalid token returns 401');
  } catch (error) {
    assert(false, `Invalid token test failed: ${error.message}`);
  }

  logGroup('Method Not Allowed (implicit)');
  // Most endpoints don't explicitly handle this, but we can test general behavior
  try {
    // Try to POST to a GET-only endpoint (if it behaves unexpectedly)
    const res = await request('POST', '/api/ruhak/options', {}, testData.managerToken);
    // This might return 404 (route not found) or 405 (method not allowed)
    assert(res.status === 404 || res.status === 405, 'Invalid method handled appropriately');
  } catch (error) {
    // Expected to potentially fail, that's fine
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

async function cleanup() {
  logSection('CLEANUP');

  // 1. Delete Order
  if (testData.rendelesId) {
    try {
      const res = await request('DELETE', `/api/rendelesek/${testData.rendelesId}`, null, testData.adminToken);
      if (res.status === 204 || res.status === 200) {
        console.log(`${colors.green}✓${colors.reset} Order deleted`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Failed to delete order: ${res.status}`);
      }
    } catch (e) {
      console.log(`${colors.red}✗${colors.reset} Error deleting order: ${e.message}`);
    }
  }

  // 2. Delete Transaction
  if (testData.ruhaKiBeId) {
    try {
      const res = await request('DELETE', `/api/ruhakibe/${testData.ruhaKiBeId}`, null, testData.adminToken);
      if (res.status === 204 || res.status === 200) {
        console.log(`${colors.green}✓${colors.reset} Transaction deleted`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Failed to delete transaction: ${res.status}`);
      }
    } catch (e) {
      console.log(`${colors.red}✗${colors.reset} Error deleting transaction: ${e.message}`);
    }
  }

  // 3. Delete Clothes
  const clothesToDelete = [testData.ruhaId, testData.skuRuhaId].filter(id => id);
  for (const id of clothesToDelete) {
    try {
      const res = await request('DELETE', `/api/ruhak/${id}`, null, testData.adminToken);
      if (res.status === 204 || res.status === 200) {
        console.log(`${colors.green}✓${colors.reset} Clothing item ${id} deleted`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Failed to delete clothing ${id}: ${res.status}`);
      }
    } catch (e) {
      console.log(`${colors.red}✗${colors.reset} Error deleting clothing ${id}: ${e.message}`);
    }
  }

  // 4. Delete Users
  const usersToDelete = [testData.dolgozoId, testData.managerId].filter(id => id);
  for (const id of usersToDelete) {
    try {
      const res = await request('DELETE', `/api/dolgozok/${id}`, null, testData.adminToken);
      if (res.status === 204 || res.status === 200) {
        console.log(`${colors.green}✓${colors.reset} User ${id} deleted`);
      } else {
        console.log(`${colors.red}✗${colors.reset} Failed to delete user ${id}: ${res.status}`);
      }
    } catch (e) {
      console.log(`${colors.red}✗${colors.reset} Error deleting user ${id}: ${e.message}`);
    }
  }
}

// ============================================================================
// RESULTS & MAIN
// ============================================================================

function printResults() {
  const duration = ((Date.now() - results.startTime) / 1000).toFixed(2);

  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}TEST RESULTS${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Duration: ${duration}s`);

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`Success Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed${colors.reset}\n`);
  }
}

async function runTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              MUNYIRE INTEGRATION TESTS                    ║
║                                                           ║
║  Comprehensive API Testing Suite                          ║
║  Authentication • Authorization • CRUD • Edge Cases      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(`Testing API at: ${colors.blue}${BASE_URL}${colors.reset}\n`);

  try {
    // Run all tests in sequence
    await testHealthCheck();

    logSection('AUTHENTICATION TESTS');
    await testAuthLogin();
    await testAuthRegister();

    logSection('DOLGOZÓK (EMPLOYEES) TESTS');
    await testDolgozok();

    logSection('RUHÁK (CLOTHING) TESTS');
    await testRuhak();
    await testSkuAndVariants();

    logSection('RUHAKIBE (TRANSACTIONS) TESTS');
    await testRuhaKiBe();

    logSection('RENDELÉSEK (ORDERS) TESTS');
    await testRendelesek();

    logSection('DASHBOARD TESTS');
    await testDashboard();

    logSection('REPORTS TESTS');
    await testReports();

    logSection('AUTHORIZATION & EDGE CASE TESTS');
    await testAuthorizationAndEdgeCases();

  } catch (error) {
    console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error);
  } finally {
    await cleanup();
  }

  printResults();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests();
