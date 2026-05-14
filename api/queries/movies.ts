import { getDb } from "./connection.js";
import { movies, ratingEvents, priceHistory } from "../../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { getBeijingDateStr, getBeijingHour, isPreLaunch, getPriceSensitivity } from "../../contracts/market.js";

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

export async function getPriceHistory(movieId: number, limit: number = 30) {
  return getDb()
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.movieId, movieId))
    .orderBy(desc(priceHistory.createdAt))
    .limit(limit);
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

  // Step 1: Trading volume impact
  let newPrice = prevPrice;
  if (netVolume !== 0) {
    const sensitivity = getPriceSensitivity(prevPrice);
    newPrice = prevPrice * (1 + netVolume * sensitivity);
  }

  // Step 2: Apply active rating events (same as openMarketForAll)
  const activeEvents = await getDb()
    .select()
    .from(ratingEvents)
    .where(eq(ratingEvents.movieId, movie.id));

  let totalEventImpact = 0;
  for (const ev of activeEvents) {
    const decayFactor = ev.remainingCycles / ev.totalCycles;
    const cycleImpact = (ev.impactPercent / 100) * decayFactor;
    totalEventImpact += cycleImpact;

    if (ev.remainingCycles <= 1) {
      await getDb().delete(ratingEvents).where(eq(ratingEvents.id, ev.id));
    } else {
      await getDb()
        .update(ratingEvents)
        .set({ remainingCycles: ev.remainingCycles - 1 })
        .where(eq(ratingEvents.id, ev.id));
    }
  }

  if (totalEventImpact !== 0) {
    newPrice = newPrice * (1 + totalEventImpact);
  }

  if (newPrice < 1) newPrice = 1;

  // Step 3: Only update price/basePrice if something actually changed
  const priceChanged = Math.abs(newPrice - prevPrice) > 0.001;
  if (priceChanged) {
    console.log(`[ensureMovieMarketOpen] ${movie.name}: prev=${prevPrice}, new=${newPrice.toFixed(2)}, base=${prevPrice.toFixed(2)}, netVolume=${netVolume}, events=${activeEvents.length}`);
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
    console.log(`[ensureMovieMarketOpen] ${movie.name}: NO CHANGE (prev=${prevPrice}, new=${newPrice.toFixed(2)}), base=${movie.basePrice}, netVolume=${netVolume}`);
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

    // Step 1: Trading volume impact
    let newPrice = prevPrice;
    if (netVolume !== 0) {
      const sensitivity = getPriceSensitivity(prevPrice);
      newPrice = prevPrice * (1 + netVolume * sensitivity);
    }

    // Step 2: Admin-set rating events (word-of-mouth impact)
    // Events apply on every settlement, decaying linearly over their duration
    const activeEvents = await getDb()
      .select()
      .from(ratingEvents)
      .where(eq(ratingEvents.movieId, movie.id));

    let totalEventImpact = 0;
    for (const ev of activeEvents) {
      // Linear decay: first cycle = full impact, last cycle = 1/N impact
      const decayFactor = ev.remainingCycles / ev.totalCycles;
      const cycleImpact = (ev.impactPercent / 100) * decayFactor;
      totalEventImpact += cycleImpact;

      // Decrement or delete exhausted events
      if (ev.remainingCycles <= 1) {
        await getDb().delete(ratingEvents).where(eq(ratingEvents.id, ev.id));
      } else {
        await getDb()
          .update(ratingEvents)
          .set({ remainingCycles: ev.remainingCycles - 1 })
          .where(eq(ratingEvents.id, ev.id));
      }
    }

    if (totalEventImpact !== 0) {
      newPrice = newPrice * (1 + totalEventImpact);
    }

    if (newPrice < 1) newPrice = 1;

    // Step 3: Only update price/basePrice if something actually changed
    const priceChanged = Math.abs(newPrice - prevPrice) > 0.001;
    if (priceChanged) {
      console.log(`[openMarketForAll] ${movie.name}: prev=${prevPrice}, new=${newPrice.toFixed(2)}, base=${prevPrice.toFixed(2)}, netVolume=${netVolume}, events=${activeEvents.length}`);
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
      
      // Record price history snapshot
      await getDb().insert(priceHistory).values({
        movieId: movie.id,
        price: String(newPrice.toFixed(2)),
        basePrice: String(prevPrice.toFixed(2)),
        settlementKey,
        netVolume,
      });
    } else {
      console.log(`[openMarketForAll] ${movie.name}: NO CHANGE (prev=${prevPrice}, new=${newPrice.toFixed(2)}), base=${movie.basePrice}, netVolume=${netVolume}`);
      // No price movement: only update lastOpenDate to prevent re-processing
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
