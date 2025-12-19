const http = require('http');

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('Creating issue as admin...');
  const create = await request('/issues', 'POST', { title: 'Smoke Issue', description: 'smoke' }, { 'x-user-id': 'admin-1', 'x-organization-id': 'org-1', 'x-role': 'ADMIN' });
  console.log('Create ->', create);

  console.log('Listing issues for org-1...');
  const list = await request('/issues', 'GET', null, { 'x-user-id': 'admin-1', 'x-organization-id': 'org-1', 'x-role': 'ADMIN' });
  console.log('List ->', list);
})();
