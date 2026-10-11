const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('--- Database Seeding Started ---');

    // 1. Create table schema
    const schemaSql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // 2. Check if table already has records
    const countRes = await client.query('SELECT COUNT(*) FROM hotels');
    const count = parseInt(countRes.rows[0].count, 10);

    if (count > 0) {
      console.log(`✓ Database already seeded with ${count} hotels. Skipping insert.`);
      return;
    }

    // 3. Read seed data from src/data/hotels.js
    const hotelsFilePath = path.join(__dirname, '../../src/data/hotels.js');
    const rawContent = fs.readFileSync(hotelsFilePath, 'utf8');

    // Extract JSON-like array string from file content
    const jsonStr = rawContent
      .replace(/const initialHotels =/, '')
      .replace(/export default initialHotels;/, '')
      .trim()
      .replace(/;\s*$/, '');

    // Safely evaluate JS object array
    const hotels = eval(`(${jsonStr})`);

    console.log(`Seeding ${hotels.length} hotels...`);

    await client.query('BEGIN');

    // Create seed.sql content
    let seedSqlContent = '-- Seed data for hotels table\n';

    for (const h of hotels) {
      const insertQuery = `
        INSERT INTO hotels (title, description, latitude, longitude, price, rating, reviews, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const values = [
        h.title,
        h.description,
        h.latitude,
        h.longitude,
        h.price,
        h.rating,
        h.reviews,
        h.image
      ];
      await client.query(insertQuery, values);

      // Escape single quotes for sql file generator
      const escape = (str) => String(str).replace(/'/g, "''");
      seedSqlContent += `INSERT INTO hotels (title, description, latitude, longitude, price, rating, reviews, image) VALUES ('${escape(h.title)}', '${escape(h.description)}', ${h.latitude}, ${h.longitude}, ${h.price}, ${h.rating}, ${h.reviews}, '${escape(h.image)}');\n`;
    }

    await client.query('COMMIT');

    // Write server/sql/seed.sql
    fs.writeFileSync(path.join(__dirname, '../sql/seed.sql'), seedSqlContent, 'utf8');
    console.log('✓ seed.sql written successfully.');
    console.log(`✓ Successfully seeded ${hotels.length} hotels into PostgreSQL.`);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
