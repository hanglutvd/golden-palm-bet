import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    const [rows] = await conn.execute("DESCRIBE users");
    const balanceCol = rows.find((r) => r.Field === 'balance');
    console.log('Current balance column:', balanceCol);

    await conn.execute("ALTER TABLE users MODIFY balance DECIMAL(12,2) NOT NULL DEFAULT 300.00");
    console.log('✅ Default balance changed to 300.00');

    const [rows2] = await conn.execute("DESCRIBE users");
    const updatedCol = rows2.find((r) => r.Field === 'balance');
    console.log('Updated balance column:', updatedCol);
  } catch (err) {
    console.error('❌ Migration failed:', err.sqlMessage || err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

migrate();
