import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function updateBalance() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    // Update default value
    await conn.execute(`
      ALTER TABLE users MODIFY balance DECIMAL(12,2) NOT NULL DEFAULT 3000.00
    `);
    console.log('✅ Default balance changed to 3000.00');

    // Update existing users if they have the old default
    const [users] = await conn.execute(`
      SELECT id, balance FROM users WHERE balance = 2000.00 OR balance = 1000.00 OR balance = 10000.00
    `);
    
    if (users.length > 0) {
      for (const u of users) {
        await conn.execute(
          'UPDATE users SET balance = ? WHERE id = ?',
          [3000.00, u.id]
        );
      }
      console.log(`✅ Updated ${users.length} existing users to 3000.00`);
    } else {
      console.log('✅ No existing users need updating');
    }
  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

updateBalance();
