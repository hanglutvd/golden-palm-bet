import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function addColumn() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    const [columns] = await conn.execute('DESCRIBE users');
    const hasPassword = columns.some((col) => col.Field === 'password_hash');
    
    if (!hasPassword) {
      await conn.execute(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT ''
      `);
      console.log('✅ password_hash column added');
    } else {
      console.log('✅ password_hash column already exists');
    }
  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

addColumn();
