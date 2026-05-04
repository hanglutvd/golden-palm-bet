import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function createTable() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS diaries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        summary VARCHAR(500),
        cover_image VARCHAR(500),
        external_url VARCHAR(500),
        wechat_article_id VARCHAR(100),
        publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        INDEX date_idx (publish_date)
      )
    `);
    console.log('✅ diaries table created');
  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

createTable();
