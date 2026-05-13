import { getDb } from "./connection.js";
import { movies } from "../../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { getBeijingDateStr, getBeijingHour, isPreLaunch } from "../../contracts/market.js";

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

function getSettlementKey(today: string, session: string) {
  return `${today}-${session}`;
}

/**
 * ensureMovieMarketOpen: called before first trade of a session
 * - prevPrice = currentPrice (price at session start / last settlement)
 * - Apply netVolume to get newPrice
 * - basePrice = prevPrice (baseline for this session's change%)
 * - currentPrice = newPrice
 * - reset dailyNetVolume
 */
export async function ensureMovieMarketOpen(movie: typeof movies.$inferSelect) {
  // Pre-launch: skip all settlement, let netVolume accumulate until first open
  if (isPreLaunch()) return movie;

  const today = getBeijingDateStr();
  const session = getBeijingHour() < 15 ? "am" : "pm";
  const settlementKey = getSettlementKey(today, session);

  if (movie.lastOpenDate?.startsWith(settlementKey)) return movie;

  const prevPrice = Number(movie.currentPrice);
  const netVolume = Number(movie.dailyNetVolume);

  if (netVolume !== 0) {
    let newPrice = prevPrice * (1 + netVolume * 0.005);
    if (newPrice < 1) newPrice = 1;

    await getDb()
      .update(movies)
      .set({
        currentPrice: String(newPrice.toFixed(2)),
        basePrice: String(prevPrice.toFixed(2)),
        dailyNetVolume: 0,
        lastOpenDate: settlementKey,
        updatedAt: new Date(),
      })
      .where(eq(movies.id, movie.id));

    return { ...movie, currentPrice: String(newPrice.toFixed(2)), basePrice: String(prevPrice.toFixed(2)), dailyNetVolume: 0, lastOpenDate: settlementKey };
  } else {
    // No trades: only update lastOpenDate
    await getDb()
      .update(movies)
      .set({
        lastOpenDate: settlementKey,
        updatedAt: new Date(),
      })
      .where(eq(movies.id, movie.id));

    return { ...movie, lastOpenDate: settlementKey };
  }
}

/**
 * openMarketForAll: called every 10 minutes during trading hours
 * - prevPrice = currentPrice (price before this settlement)
 * - Apply netVolume to get newPrice
 * - basePrice = prevPrice (change% tracks 10-min movement)
 * - currentPrice = newPrice
 * - reset dailyNetVolume
 */
export async function openMarketForAll(session?: "am" | "pm", force?: boolean) {
  // Pre-launch: skip all settlement (netVolume accumulates until first open)
  if (isPreLaunch()) return;

  const today = getBeijingDateStr();
  const nowHour = getBeijingHour();
  const nowMinute = new Date().getMinutes();
  const sessionKey = session || (nowHour < 15 ? "am" : "pm");
  const settlementKey = `${today}-${sessionKey}-${nowHour}:${nowMinute}`;

  const all = await findAllMovies();

  for (const movie of all) {
    if (!force && movie.lastOpenDate === settlementKey) continue;

    const prevPrice = Number(movie.currentPrice);
    const netVolume = Number(movie.dailyNetVolume);

    if (netVolume !== 0) {
      // Has trades: update price and basePrice
      let newPrice = prevPrice * (1 + netVolume * 0.005);
      if (newPrice < 1) newPrice = 1;

      await getDb()
        .update(movies)
        .set({
          currentPrice: String(newPrice.toFixed(2)),
          basePrice: String(prevPrice.toFixed(2)),
          dailyNetVolume: 0,
          lastOpenDate: settlementKey,
          updatedAt: new Date(),
        })
        .where(eq(movies.id, movie.id));
    } else {
      // No trades: keep price and basePrice unchanged
      // Only update lastOpenDate to prevent repeated settlement
      await getDb()
        .update(movies)
        .set({
          lastOpenDate: settlementKey,
          updatedAt: new Date(),
        })
        .where(eq(movies.id, movie.id));
    }
  }
}

export async function incrementDailyNetVolume(movieId: number, delta: number) {
  const movie = await findMovieById(movieId);
  if (!movie) return;
  await ensureMovieMarketOpen(movie);
  // Use SQL atomic update to prevent race conditions under concurrent trades
  await getDb()
    .update(movies)
    .set({ dailyNetVolume: sql`cast(daily_net_volume as real) + ${delta}`, updatedAt: new Date() })
    .where(eq(movies.id, movieId));
}

export async function seedMovies() {
  const existing = await getDb().query.movies.findMany();
  if (existing.length > 0) return;

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

  for (const m of movieData) {
    await getDb().insert(movies).values({
      name: m.name, director: m.director, currentPrice: "100.00", basePrice: "100.00",
      totalVolume: "0", dailyNetVolume: 0, lastOpenDate: "", premiereDate: "待定",
    });
  }
}
