import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const movieData = [
  { name: '盒子里的羊', director: '是枝裕和' },
  { name: '平行故事', director: '阿斯加·法哈蒂' },
  { name: '苦涩的圣诞节', director: '佩德罗·阿莫多瓦' },
  { name: '峡湾', director: '克里斯蒂安·蒙吉' },
  { name: '希望', director: '罗泓轸' },
  { name: '突如其来', director: '滨口龙介' },
  { name: '故土', director: '帕维乌·帕夫利科夫斯基' },
  { name: '弥诺陶洛斯', director: '安德烈·兹维亚金采夫' },
  { name: '所爱之人', director: '罗德里戈·索罗戈延' },
  { name: '黑球', director: '哈维尔·安布罗希 / 哈维尔·卡尔沃' },
  { name: '我爱的男人', director: '艾拉·萨克斯' },
  { name: '纸老虎', director: '詹姆斯·格雷' },
  { name: '温柔的怪物', director: '玛丽·克鲁泽' },
  { name: '穆朗', director: '拉斯洛·奈迈施' },
  { name: '凪日记', director: '深田晃司' },
  { name: '夜之寓言', director: '蕾雅·梅西斯' },
  { name: '懦夫', director: '卢卡斯·德霍特' },
  { name: '向往的冒险', director: '瓦莱斯卡·格里策巴赫' },
  { name: '嘉朗丝', director: '让娜·埃里' },
  { name: '我们的救赎', director: '伊曼努尔·马雷' },
  { name: '未知', director: '亚瑟·阿拉里' },
  { name: '一个女人的生活', director: '夏琳·布儒瓦-塔凯' },
];

async function seed() {
  const conn = await mysql.createConnection(DATABASE_URL);
  try {
    const [existing] = await conn.execute('SELECT COUNT(*) as count FROM movies');
    if (existing[0].count > 0) {
      console.log('✅ Movies already seeded');
      return;
    }

    for (const m of movieData) {
      await conn.execute(
        'INSERT INTO movies (name, director, current_price, base_price, total_volume) VALUES (?, ?, 100.00, 100.00, 0)',
        [m.name, m.director]
      );
    }
    console.log(`✅ ${movieData.length} movies seeded`);
  } catch (err) {
    console.error('❌ Error:', err.sqlMessage || err.message);
  } finally {
    await conn.end();
  }
}

seed();
