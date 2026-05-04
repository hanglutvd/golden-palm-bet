import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function addRoleColumn() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    // Check if role column exists
    const [columns] = await conn.execute('DESCRIBE users');
    const hasRole = columns.some((col) => col.Field === 'role');
    
    if (!hasRole) {
      await conn.execute(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
      `);
      console.log('✅ role column added');
      
      // Set the first registered user as admin
      const [firstUser] = await conn.execute(
        'SELECT id FROM users ORDER BY created_at ASC LIMIT 1'
      );
      if (firstUser.length > 0) {
        await conn.execute(
          'UPDATE users SET role = ? WHERE id = ?',
          ['admin', firstUser[0].id]
        );
        console.log(`✅ First user (id=${firstUser[0].id}) set as admin`);
      }
    } else {
      console.log('✅ role column already exists');
    }
  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

addRoleColumn();
