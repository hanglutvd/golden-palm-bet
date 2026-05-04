import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function createTables() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    // Create movies table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS movies (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        director VARCHAR(100) NOT NULL,
        current_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        base_price DECIMAL(10,2) NOT NULL DEFAULT 100.00,
        total_volume DECIMAL(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX name_idx (name)
      )
    `);
    console.log('✅ movies table created');

    // Create holdings table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS holdings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        movie_id BIGINT UNSIGNED NOT NULL,
        quantity BIGINT UNSIGNED NOT NULL DEFAULT 0,
        avg_buy_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX user_movie_idx (user_id, movie_id)
      )
    `);
    console.log('✅ holdings table created');

    // Create transactions table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        movie_id BIGINT UNSIGNED NOT NULL,
        type ENUM('buy','sell') NOT NULL,
        quantity BIGINT UNSIGNED NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX user_idx (user_id),
        INDEX movie_idx (movie_id)
      )
    `);
    console.log('✅ transactions table created');

    // Update users.balance default
    await conn.execute(`
      ALTER TABLE users MODIFY balance DECIMAL(12,2) NOT NULL DEFAULT 2000.00
    `);
    console.log('✅ users.balance default updated to 2000.00');

  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

createTables();
