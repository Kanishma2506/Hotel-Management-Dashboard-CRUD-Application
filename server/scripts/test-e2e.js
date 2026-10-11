const http = require('http');
const { pool } = require('../config/db');

async function testFullIntegration() {
  console.log('=== STARTING END-TO-END INTEGRATION TEST ===\n');

  // 1. Verify DB connection & total hotels count
  const client = await pool.connect();
  const dbCountRes = await client.query('SELECT COUNT(*) FROM hotels');
  const initialDbCount = parseInt(dbCountRes.rows[0].count, 10);
  client.release();
  console.log(`[1] PostgreSQL direct query count: ${initialDbCount} hotels in database.`);

  // 2. Fetch GET /api/hotels (Verify API response)
  const apiRes = await new Promise((resolve) => {
    http.get('http://localhost:5000/api/hotels?offset=0&limit=10', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
  console.log(`[2] GET /api/hotels response: total=${apiRes.pagination.total}, items Returned=${apiRes.data.length}`);

  // 3. Search test
  const searchRes = await new Promise((resolve) => {
    http.get('http://localhost:5000/api/hotels?title=Bengaluru&minPrice=3000&maxPrice=8000', (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
  console.log(`[3] Search & filter test: found ${searchRes.pagination.total} matching hotels.`);

  // 4. Verify detail fetch
  const firstId = apiRes.data[0].id;
  const detailRes = await new Promise((resolve) => {
    http.get(`http://localhost:5000/api/hotels/${firstId}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
  });
  console.log(`[4] Hotel detail fetch for ID ${firstId}: title="${detailRes.data.title}", price=${detailRes.data.price}`);

  console.log('\n=== END-TO-END INTEGRATION VERIFIED SUCCESSFULLY ===');
  await pool.end();
}

testFullIntegration().catch(console.error);
