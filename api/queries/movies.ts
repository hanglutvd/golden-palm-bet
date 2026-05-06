import { getDb } from "./connection.js";
import { movies } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { getBeijingDateStr, getBeijingHour } from "../../contracts/market.js";

export async function findAllMovies() {
  return getDb().query.movies.findMany({
    orderBy: desc(movies.currentPrice),
  });
}

export async function findMovieById(id: number) {
  return getDb().query.movies.findFirst({
    where: eq(movies.id, id),
  });
}

export async function updateMoviePrice(id: number, newPrice: number) {
  await getDb()
    .update(movies)
    .set({
      currentPrice: String(newPrice.toFixed(2)),
      totalVolume: String(Number((await findMovieById(id))?.totalVolume || 0) + 1),
      updatedAt: new Date(),
    })
    .where(eq(movies.id, id));
  return newPrice;
}

function getSettlementKey(today: string, session: string) {
  return `${today}-${session}`;
}

/**
 * Open the market for a single movie (lazy fallback):
 * - If current session has not been settled, apply accumulated dailyNetVolume
 * - Reset dailyNetVolume to 0
 * - Set lastOpenDate to current session key (YYYY-MM-DD-am/pm)
 */
export async function ensureMovieMarketOpen(movie: typeof movies.$inferSelect) {
  const today = getBeijingDateStr();
  const session = getBeijingHour() < 15 ? "am" : "pm";
  const settlementKey = getSettlementKey(today, session);

  // Exact match: if lastOpenDate equals expected session key, already settled
  if (movie.lastOpenDate === settlementKey) return movie;

  const netVolume = Number(movie.dailyNetVolume);
  let newPrice = Number(movie.currentPrice);

  if (netVolume !== 0) {
    // Apply net volume impact: +0.2% per net share
    newPrice = newPrice * (1 + netVolume * 0.002);
    if (newPrice < 1) newPrice = 1; // floor at 1
  }

  await getDb()
    .update(movies)
    .set({
      currentPrice: String(newPrice.toFixed(2)),
      dailyNetVolume: 0,
      lastOpenDate: settlementKey,
      updatedAt: new Date(),
    })
    .where(eq(movies.id, movie.id));

  return {
    ...movie,
    currentPrice: String(newPrice.toFixed(2)),
    dailyNetVolume: 0,
    lastOpenDate: settlementKey,
  };
}

/**
 * Batch settlement for all movies (cron-triggered at 12:00 and 18:00):
 * - 12:00 结算上午交易，标记为 YYYY-MM-DD-am，15:00 开盘时展示新价格
 * - 18:00 结算下午交易，标记为 YYYY-MM-DD-pm，次日 09:00 开盘时展示新价格
 */
export async function openMarketForAll(session?: "am" | "pm") {
  const today = getBeijingDateStr();
  const nowHour = getBeijingHour();
  const sessionKey = session || (nowHour < 15 ? "am" : "pm");
  const settlementKey = getSettlementKey(today, sessionKey);

  const all = await findAllMovies();

  for (const movie of all) {
    if (movie.lastOpenDate === settlementKey) continue; // already settled for this session

    const netVolume = Number(movie.dailyNetVolume);
    let newPrice = Number(movie.currentPrice);

    if (netVolume !== 0) {
      newPrice = newPrice * (1 + netVolume * 0.002);
      if (newPrice < 1) newPrice = 1;
    }

    await getDb()
      .update(movies)
      .set({
        currentPrice: String(newPrice.toFixed(2)),
        dailyNetVolume: 0,
        lastOpenDate: settlementKey,
        updatedAt: new Date(),
      })
      .where(eq(movies.id, movie.id));
  }
}

/**
 * Increment daily net volume for a movie
 * positive = net buy, negative = net sell
 */
export async function incrementDailyNetVolume(movieId: number, delta: number) {
  let movie = await findMovieById(movieId);
  if (!movie) return;

  // Ensure market is open first (so we're writing to today's counter)
  await ensureMovieMarketOpen(movie);

  // Re-fetch after potential market open (dailyNetVolume may have been reset)
  movie = await findMovieById(movieId);
  if (!movie) return;

  await getDb()
    .update(movies)
    .set({
      dailyNetVolume: Number(movie.dailyNetVolume) + delta,
      updatedAt: new Date(),
    })
    .where(eq(movies.id, movieId));
}

export async function seedMovies() {
  const existing = await getDb().query.movies.findMany();
  if (existing.length > 0) return;

  const movieData = [
    { name: '盒子里的羊', director: '是枝裕和', premiereDate: '待定' },
    { name: '平行故事', director: '阿斯加·法哈蒂', premiereDate: '待定' },
    { name: '苦涩的圣诞节', director: '佩德罗·阿莫多瓦', premiereDate: '待定' },
    { name: '峡湾', director: '克里斯蒂安·蒙吉', premiereDate: '待定' },
    { name: '希望', director: '罗泓轸', premiereDate: '待定' },
    { name: '突如其来', director: '滨口龙介', premiereDate: '待定' },
    { name: '故土', director: '帕维乌·帕夫利科夫斯基', premiereDate: '待定' },
    { name: '弥诺陶洛斯', director: '安德烈·兹维亚金采夫', premiereDate: '待定' },
    { name: '所爱之人', director: '罗德里戈·索罗戈延', premiereDate: '待定' },
    { name: '黑球', director: '哈维尔·安布罗希 / 哈维尔·卡尔沃', premiereDate: '待定' },
    { name: '我爱的男人', director: '艾拉·萨克斯', premiereDate: '待定' },
    { name: '纸老虎', director: '詹姆斯·格雷', premiereDate: '待定' },
    { name: '温柔的怪物', director: '玛丽·克鲁泽', premiereDate: '待定' },
    { name: '穆朗', director: '拉斯洛·奈迈施', premiereDate: '待定' },
    { name: '凪日记', director: '深田晃司', premiereDate: '待定' },
    { name: '夜之寓言', director: '蕾雅·梅西斯', premiereDate: '待定' },
    { name: '懦夫', director: '卢卡斯·德霍特', premiereDate: '待定' },
    { name: '向往的冒险', director: '瓦莱斯卡·格里策巴赫', premiereDate: '待定' },
    { name: '嘉朗丝', director: '让娜·埃里', premiereDate: '待定' },
    { name: '我们的救赎', director: '伊曼努尔·马雷', premiereDate: '待定' },
    { name: '未知', director: '亚瑟·阿拉里', premiereDate: '待定' },
    { name: '一个女人的生活', director: '夏琳·布儒瓦-塔凯', premiereDate: '待定' },
  ];

  for (const m of movieData) {
    await getDb().insert(movies).values({
      name: m.name,
      director: m.director,
      currentPrice: "100.00",
      basePrice: "100.00",
      totalVolume: "0",
      dailyNetVolume: 0,
      lastOpenDate: getSettlementKey(getBeijingDateStr(), "am"),
      premiereDate: m.premiereDate,
    });
  }
}
