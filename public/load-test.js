/**
 * 过载测试脚本 - 浏览器控制台版
 * 
 * 使用方法：
 * 1. 登录网站
 * 2. 按 F12 打开开发者工具
 * 3. 切换到 Console（控制台）标签
 * 4. 复制粘贴以下全部代码，按回车执行
 * 5. 查看输出结果
 */

(async function loadTest() {
  console.clear();
  console.log("========================================");
  console.log("       戛纳主竞赛股市 - 过载测试");
  console.log("========================================");

  // 获取认证 token
  const cookies = document.cookie;
  const tokenMatch = cookies.match(/auth-token=([^;]+)/);
  if (!tokenMatch) {
    console.error("❌ 未登录！请先登录后再运行测试。");
    return;
  }
  const token = tokenMatch[1];

  // 先获取电影列表
  console.log("📡 获取电影列表...");
  let movies = [];
  try {
    const res = await fetch("/api/trpc/movie.list", {
      headers: { "cookie": `auth-token=${token}` }
    });
    const data = await res.json();
    movies = data.result.data.json;
    console.log(`✅ 获取到 ${movies.length} 部电影`);
  } catch (e) {
    console.error("❌ 获取电影列表失败:", e.message);
    return;
  }

  // 获取当前余额
  console.log("📡 获取当前余额...");
  let balance = 0;
  try {
    const res = await fetch("/api/trpc/trading.portfolio", {
      headers: { "cookie": `auth-token=${token}` }
    });
    const data = await res.json();
    balance = data.result.data.json.balance;
    console.log(`✅ 当前余额: ${balance}`);
  } catch (e) {
    console.warn("⚠️ 获取余额失败，使用默认值");
  }

  // 测试参数
  const CONCURRENT_REQUESTS = 20;  // 并发请求数（每次同时发多少个请求）
  const BATCHES = 5;               // 批次数（总共发多少批）
  const QUANTITY = 1;              // 每次买入股数

  console.log("");
  console.log("📋 测试计划:");
  console.log(`   - 并发请求数: ${CONCURRENT_REQUESTS}`);
  console.log(`   - 批次数: ${BATCHES}`);
  console.log(`   - 每批买入: ${CONCURRENT_REQUESTS} 部电影 × ${QUANTITY} 股`);
  console.log(`   - 总计: ${CONCURRENT_REQUESTS * BATCHES} 次买入请求`);
  console.log("");

  const results = {
    success: 0,
    failed: 0,
    totalTime: 0,
    avgResponseTime: 0,
    errors: [],
    pricesAfter: {},
  };

  // 并发买入函数
  async function buyMovie(movieId, quantity) {
    const start = performance.now();
    try {
      const res = await fetch("/api/trpc/trading.buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "cookie": `auth-token=${token}`
        },
        body: JSON.stringify({
          "0": {
            "json": { movieId, quantity }
          }
        })
      });
      const data = await res.json();
      const elapsed = performance.now() - start;

      if (data.error) {
        return { success: false, error: data.error.message, time: elapsed };
      }
      return { success: true, data: data.result?.data?.json, time: elapsed };
    } catch (e) {
      const elapsed = performance.now() - start;
      return { success: false, error: e.message, time: elapsed };
    }
  }

  // 执行并发测试
  for (let batch = 0; batch < BATCHES; batch++) {
    console.log(`🚀 第 ${batch + 1}/${BATCHES} 批并发请求...`);
    
    // 随机选择电影（不重复）
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(CONCURRENT_REQUESTS, shuffled.length));
    
    const batchStart = performance.now();
    
    // 同时发起所有请求
    const promises = selected.map((movie, i) => 
      buyMovie(movie.id, QUANTITY).then(result => ({ ...result, movieName: movie.name, index: i }))
    );
    
    const batchResults = await Promise.all(promises);
    const batchTime = performance.now() - batchStart;
    
    // 统计结果
    const batchSuccess = batchResults.filter(r => r.success).length;
    const batchFailed = batchResults.filter(r => !r.success).length;
    results.success += batchSuccess;
    results.failed += batchFailed;
    results.totalTime += batchTime;
    
    // 收集错误
    batchResults.filter(r => !r.success).forEach(r => {
      results.errors.push({ movie: r.movieName, error: r.error });
    });
    
    console.log(`   ✅ 成功: ${batchSuccess} | ❌ 失败: ${batchFailed} | ⏱️ 耗时: ${batchTime.toFixed(0)}ms`);
    
    // 显示失败详情
    batchResults.filter(r => !r.success).slice(0, 3).forEach(r => {
      console.log(`      ❌ ${r.movieName}: ${r.error}`);
    });
    
    // 批次间延迟 500ms
    if (batch < BATCHES - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // 最终统计
  results.avgResponseTime = results.totalTime / (results.success + results.failed);
  
  console.log("");
  console.log("========================================");
  console.log("           📊 测试结果汇总");
  console.log("========================================");
  console.log(`总请求数: ${results.success + results.failed}`);
  console.log(`✅ 成功: ${results.success}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`成功率: ${((results.success / (results.success + results.failed)) * 100).toFixed(1)}%`);
  console.log(`总耗时: ${results.totalTime.toFixed(0)}ms`);
  console.log(`平均每批耗时: ${(results.totalTime / BATCHES).toFixed(0)}ms`);
  
  if (results.errors.length > 0) {
    console.log("");
    console.log("📋 错误详情 (前10条):");
    results.errors.slice(0, 10).forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.movie}: ${e.error}`);
    });
  }

  // 测试后的价格诊断
  console.log("");
  console.log("📡 刷新电影列表，获取最新价格...");
  try {
    const res = await fetch("/api/trpc/movie.list", {
      headers: { "cookie": `auth-token=${token}` }
    });
    const data = await res.json();
    const updatedMovies = data.result.data.json;
    
    console.log("");
    console.log("📊 交易后价格诊断:");
    console.log("电影名称 | 当前价 | basePrice | 涨跌幅");
    console.log("---------|--------|-----------|--------");
    updatedMovies.forEach(m => {
      const change = m.changePercent !== undefined ? `${m.changePercent.toFixed(2)}%` : '-';
      console.log(`${m.name.padEnd(8)} | ${m.price.toFixed(2)} | ${m.basePrice.toFixed(2)} | ${change}`);
    });
  } catch (e) {
    console.error("获取最新价格失败:", e.message);
  }

  console.log("");
  console.log("========================================");
  console.log("提示: 到后台点击「立即结算」，观察涨跌幅是否正确更新。");
  console.log("========================================");

})();
