const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway.internal')
    ? false
    : { rejectUnauthorized: false },
});

// Create the users table if it doesn't exist yet (runs once on startup)
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      password TEXT NOT NULL,
      reset_token TEXT,
      reset_token_expires TIMESTAMP,
      plan TEXT DEFAULT 'free',
      plan_updated_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Safe no-ops if these already exist from a previous version of the table
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP;`);

  console.log('Database ready: users table checked/created');
}

module.exports = { pool, initDb };