import { X, Lock, Clock, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

export function MarketClosedModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if market is closed based on Beijing time
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);
    const month = beijing.getMonth() + 1;
    const date = beijing.getDate();
    const hour = beijing.getHours();
    
    // Close at 12:00 on May 23, 2026
    const isClosed = (month === 5 && date === 23 && hour >= 12) || (month === 5 && date > 23) || month > 5;
    
    if (isClosed) {
      // Check if user has already dismissed the modal
      const dismissed = localStorage.getItem("market-closed-dismissed");
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-app-card rounded-xl border border-app-red/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-red/10">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-app-red" />
            <h2 className="text-base font-bold text-app-red">股市已永久闭市</h2>
          </div>
          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closed-dismissed", "1");
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-app-gold mx-auto mb-3" />
            <p className="text-base font-medium text-foreground mb-1">
              戛纳主竞赛股市已正式闭市
            </p>
            <p className="text-sm text-muted-foreground">
              北京时间 5月23日（周六）中午12:00 永久闭市
            </p>
          </div>

          <div className="rounded-lg bg-app-bg border border-app-border p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-4 w-4 text-app-gold flex-shrink-0" />
              <span>交易已停止，不可再买入或卖出</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Trophy className="h-4 w-4 text-app-gold flex-shrink-0" />
              <span>分红将在电影节颁奖后统一结算</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Lock className="h-4 w-4 text-app-gold flex-shrink-0" />
              <span>排行榜和资产数据将保留</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            感谢各位玩家的参与！最终排名和分红结果将在颁奖后公布。
          </p>

          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closed-dismissed", "1");
            }}
            className="w-full py-2.5 rounded-lg bg-app-gold/20 text-app-gold font-medium text-sm hover:bg-app-gold/30 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
