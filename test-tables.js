// Simulates the exact payload the frontend sends
async function testAddTable() {
  const payload = {
    data: 'eyJ0YWJsZV9kZXRhaWxzIjp7ImlkIjoiMTc3NDc5OTM0NTY2MSIsIm5hbWUiOiIxIn19'
  };

  // Decode to verify what's inside
  const decoded = JSON.parse(Buffer.from(payload.data, 'base64').toString('utf-8'));
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

  console.log('\n--- Testing POST /api/tables/add ---');
  const response = await fetch('http://localhost:5000/api/tables/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(result, null, 2));

  console.log('\n--- Testing GET /api/tables ---');
  const tablesRes = await fetch('http://localhost:5000/api/tables');
  const tables = await tablesRes.json();
  console.log('Tables:', JSON.stringify(tables, null, 2));
}

testAddTable();
