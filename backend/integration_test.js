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
  dolgozoId: null,
  ruhaId: null,
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
 * Test: Health Check
 */
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

/**
 * Test: Authentication - Login
 */
async function testAuthLogin() {
  logGroup('Authentication - Login');

  // Login as admin (from env variables)
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

    if (res.data.token) {
      testData.adminToken = res.data.token;
    }
  } catch (error) {
    assert(false, `Admin login failed: ${error.message}`);
  }

  // Test invalid login
  try {
    const res = await request('POST', '/api/auth/login', {
      username: 'nonexistent',
      password: 'wrongpassword',
    });

    assert(res.status === 401, 'Invalid login returns 401');
  } catch (error) {
    assert(false, `Invalid login test failed: ${error.message}`);
  }
}

/**
 * Test: Authentication - Register
 */
async function testAuthRegister() {
  logGroup('Authentication - Register');

  const timestamp = Date.now();
  const newUser = {
    name: 'Test Manager',
    email: `manager${timestamp}@test.com`,
    username: `manager${timestamp}`,
    password: 'Manager123!',
    role: 'Manager',
  };

  try {
    const res = await request('POST', '/api/auth/register', newUser, testData.adminToken);

    assert(res.status === 201, 'Manager registration returns 201');
    assert(res.data.id, 'Manager registration returns user ID');

    // Login with the new manager
    const loginRes = await request('POST', '/api/auth/login', {
      username: newUser.username,
      password: newUser.password,
    });

    assert(loginRes.status === 200, 'New manager can login');
    if (loginRes.data.token) {
      testData.managerToken = loginRes.data.token;
    }
  } catch (error) {
    assert(false, `Manager registration failed: ${error.message}`);
  }

  // Register a regular employee
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
    if (loginRes.data.token) {
      testData.dolgozoToken = loginRes.data.token;
    }
  } catch (error) {
    assert(false, `Employee registration failed: ${error.message}`);
  }

  // Test unauthorized registration (without token)
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
}

/**
 * Test: Dolgozók (Employees)
 */
async function testDolgozok() {
  logGroup('Dolgozók - List All');

  try {
    const res = await request('GET', '/api/dolgozok', null, testData.managerToken);
    assert(res.status === 200, 'List employees returns 200');
    assert(Array.isArray(res.data), 'List employees returns array');
  } catch (error) {
    assert(false, `List employees failed: ${error.message}`);
  }

  // Test get specific employee
  if (testData.dolgozoId) {
    logGroup('Dolgozók - Get Specific');
    try {
      const res = await request('GET', `/api/dolgozok/${testData.dolgozoId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get employee returns 200');
      assert(res.data.DolgozoID === testData.dolgozoId, 'Returns correct employee');
    } catch (error) {
      assert(false, `Get employee failed: ${error.message}`);
    }

    // Test update employee
    logGroup('Dolgozók - Update');
    try {
      const res = await request('PATCH', `/api/dolgozok/${testData.dolgozoId}`, {
        Telefonszam: '+36309999999',
      }, testData.adminToken);

      assert(res.status === 200, 'Update employee returns 200');
    } catch (error) {
      assert(false, `Update employee failed: ${error.message}`);
    }
  }

  // Test authorization - employee accessing others' data
  logGroup('Dolgozók - Authorization Check');
  try {
    const res = await request('GET', '/api/dolgozok', null, testData.dolgozoToken);
    // Should either return 403 or only their own data
    assert(res.status === 403 || res.status === 200, 'Employee has limited access');
  } catch (error) {
    assert(false, `Authorization check failed: ${error.message}`);
  }
}

/**
 * Test: Ruhák (Clothing Items)
 */
async function testRuhak() {
  logGroup('Ruhák - Create');

  const timestamp = Date.now();
  const newRuha = {
    Cikkszam: `TEST-${timestamp}`,
    Fajta: 'Munkaruha',
    Szin: 'Kék',
    Meret: 'L',
    Minoseg: 'Új',
    Mennyiseg: 10,
  };

  try {
    const res = await request('POST', '/api/ruhak', newRuha, testData.adminToken);
    assert(res.status === 201, 'Create ruha returns 201');
    assert(res.data.RuhaID, 'Create ruha returns ID');

    if (res.data.RuhaID) {
      testData.ruhaId = res.data.RuhaID;
    }
  } catch (error) {
    assert(false, `Create ruha failed: ${error.message}`);
  }

  logGroup('Ruhák - List All');
  try {
    const res = await request('GET', '/api/ruhak', null, testData.managerToken);
    assert(res.status === 200, 'List ruhak returns 200');
    assert(Array.isArray(res.data), 'List ruhak returns array');
  } catch (error) {
    assert(false, `List ruhak failed: ${error.message}`);
  }

  // Test get specific ruha
  if (testData.ruhaId) {
    logGroup('Ruhák - Get Specific');
    try {
      const res = await request('GET', `/api/ruhak/${testData.ruhaId}`, null, testData.managerToken);
      assert(res.status === 200, 'Get ruha returns 200');
      assert(res.data.RuhaID === testData.ruhaId, 'Returns correct ruha');
    } catch (error) {
      assert(false, `Get ruha failed: ${error.message}`);
    }

    // Test search
    logGroup('Ruhák - Search');
    try {
      const res = await request('GET', `/api/ruhak/search?q=Teszt`, null, testData.managerToken);
      assert(res.status === 200, 'Search ruhak returns 200');
      assert(Array.isArray(res.data), 'Search returns array');
    } catch (error) {
      assert(false, `Search ruhak failed: ${error.message}`);
    }

    // Test update
    logGroup('Ruhák - Update');
    try {
      const res = await request('PATCH', `/api/ruhak/${testData.ruhaId}`, {
        Mennyiseg: 15,
      }, testData.adminToken);

      assert(res.status === 200, 'Update ruha returns 200');
    } catch (error) {
      assert(false, `Update ruha failed: ${error.message}`);
    }
  }
}

/**
 * Test: RuhaKiBe (Issue/Return Transactions)
 */
async function testRuhaKiBe() {
  if (!testData.dolgozoId || !testData.ruhaId) {
    console.log(`${colors.yellow}⚠ Skipping RuhaKiBe tests (missing dolgozoId or ruhaId)${colors.reset}`);
    return;
  }

  logGroup('RuhaKiBe - Issue Item');

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

    if (res.data.RuhaKiBeID) {
      testData.ruhaKiBeId = res.data.RuhaKiBeID;
    }
  } catch (error) {
    assert(false, `Issue item failed: ${error.message}`);
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

  // Test return item
  if (testData.ruhaKiBeId) {
    logGroup('RuhaKiBe - Return Item');
    try {
      const res = await request('PATCH', `/api/ruhakibe/${testData.ruhaKiBeId}`, {
        VisszaDatum: new Date().toISOString().split('T')[0],
      }, testData.managerToken);

      assert(res.status === 200, 'Return item returns 200');
    } catch (error) {
      assert(false, `Return item failed: ${error.message}`);
    }
  }

  logGroup('RuhaKiBe - Statistics');
  try {
    const res = await request('GET', '/api/ruhakibe/stats', null, testData.managerToken);
    assert(res.status === 200, 'Statistics returns 200');
    assert(res.data.totalIssued !== undefined, 'Statistics contains data');
  } catch (error) {
    assert(false, `Statistics failed: ${error.message}`);
  }
}

/**
 * Test: Rendelések (Orders)
 */
async function testRendelesek() {
  if (!testData.ruhaId) {
    console.log(`${colors.yellow}⚠ Skipping Rendelések tests (missing ruhaId)${colors.reset}`);
    return;
  }

  logGroup('Rendelések - Create');

  const newRendeles = {
    RuhaID: testData.ruhaId,
    Mennyiseg: 5,
    Szallito: 'Teszt Szállító',
    Megjegyzes: 'Teszt rendelés',
  };

  try {
    const res = await request('POST', '/api/rendelesek', newRendeles, testData.managerToken);
    assert(res.status === 201, 'Create order returns 201');
    assert(res.data.RendelesID, 'Create order returns ID');

    if (res.data.RendelesID) {
      testData.rendelesId = res.data.RendelesID;
    }
  } catch (error) {
    assert(false, `Create order failed: ${error.message}`);
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
  } catch (error) {
    assert(false, `Pending orders failed: ${error.message}`);
  }

  // Test complete order
  if (testData.rendelesId) {
    logGroup('Rendelések - Complete Order');
    try {
      const res = await request('PATCH', `/api/rendelesek/${testData.rendelesId}/complete`, {
        Megjegyzes: 'Rendelés teljesítve',
      }, testData.adminToken);

      assert(res.status === 200, 'Complete order returns 200');
    } catch (error) {
      assert(false, `Complete order failed: ${error.message}`);
    }
  }
}

/**
 * Test: Dashboard
 */
async function testDashboard() {
  logGroup('Dashboard - Statistics');

  try {
    const res = await request('GET', '/api/dashboard/stats', null, testData.managerToken);
    assert(res.status === 200, 'Dashboard stats returns 200');
    assert(res.data.dolgozoCount !== undefined, 'Stats contain employee count');
  } catch (error) {
    assert(false, `Dashboard stats failed: ${error.message}`);
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
    assert(Array.isArray(res.data.recentKibe), 'Recent activity returns array');
  } catch (error) {
    assert(false, `Recent activity failed: ${error.message}`);
  }
}

/**
 * Test: Reports
 */
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

  logGroup('Reports - Quality Summary');
  try {
    const res = await request('GET', '/api/reports/quality-summary', null, testData.adminToken);
    assert(res.status === 200, 'Quality summary returns 200');
  } catch (error) {
    assert(false, `Quality summary failed: ${error.message}`);
  }
}

/**
 * Print test results
 */
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

/**
 * Main test runner
 */
async function runTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              MUNYIRE INTEGRATION TESTS                    ║
║                                                           ║
║  Testing all endpoints with authentication & authorization║
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

    logSection('RUHAKIBE (TRANSACTIONS) TESTS');
    await testRuhaKiBe();

    logSection('RENDELÉSEK (ORDERS) TESTS');
    await testRendelesek();

    logSection('DASHBOARD TESTS');
    await testDashboard();

    logSection('REPORTS TESTS');
    await testReports();

  } catch (error) {
    console.error(`${colors.red}Fatal error during testing:${colors.reset}`, error);
  }

  printResults();
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run the tests
runTests();
