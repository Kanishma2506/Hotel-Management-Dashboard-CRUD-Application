require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify DB connection
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL database.');
    client.release();

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Database connection failure:', err.message);
    process.exit(1);
  }
}

startServer();
