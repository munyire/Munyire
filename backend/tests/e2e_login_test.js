const http = require('http');
const assert = require('assert');

// Simple E2E test without browser: log in via backend and fetch a protected endpoint
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: body ? JSON.parse(body) : {}, headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, data: body, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  try {
    console.log('E2E: Logging in...');
    const loginRes = await request('POST', '/api/auth/login', { username: process.env.ADMIN_USER || 'admin', password: process.env.ADMIN_PASS || 'alma' });
    assert.strictEqual(loginRes.status, 200, 'Login should return 200');
    console.log('E2E: Login OK, token present:', !!loginRes.data.token);

    const token = loginRes.data.token;

    console.log('E2E: Fetching dashboard stats (protected)...');
    const statsRes = await request('GET', '/api/dashboard/stats', null, token);
    assert.strictEqual(statsRes.status, 200, 'Dashboard stats should return 200');
    console.log('E2E: Dashboard stats OK:', statsRes.data);

    console.log('E2E: All checks passed');
    process.exit(0);
  } catch (err) {
    console.error('E2E failed:', err && err.message || err);
    process.exit(2);
  }
})();