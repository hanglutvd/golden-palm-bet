import { X, Clock, AlertTriangle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export function MarketClosingSoonModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if market is still open (before May 23, 2026 12:00 Beijing Time)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);
    const month = beijing.getMonth() + 1;
    const date = beijing.getDate();
    const hour = beijing.getHours();
    
    // Show if before May 23, 2026 12:00
    const isBeforeClose = (month === 5 && date < 23) || (month === 5 && date === 23 && hour < 12);
    
    if (isBeforeClose) {
      // Check if user has already dismissed the modal
      const dismissed = localStorage.getItem("market-closing-soon-dismissed");
      if (!dismissed) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-app-card rounded-xl border border-app-gold/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-gold/10">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-app-gold" />
            <h2 className="text-base font-bold text-app-gold">股市即将闭市</h2>
          </div>
          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closing-soon-dismissed", "1");
            }}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-app-gold mx-auto mb-3" />
            <p className="text-base font-medium text-foreground mb-1">
              戛纳主竞赛股市即将永久闭市
            </p>
            <p className="text-sm text-muted-foreground">
              请合理安排您的交易策略
            </p>
          </div>

          <div className="rounded-lg bg-app-bg border border-app-border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-app-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">闭市时间</p>
                <p className="text-lg font-bold text-app-gold">5月23日（周六）中午12:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-app-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">闭市后</p>
                <p className="text-sm text-muted-foreground">不可再买入或卖出股票</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-app-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">分红结算</p>
                <p className="text-sm text-muted-foreground">颁奖后统一结算分红</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            请在闭市前完成您的交易布局。闭市后排行榜和资产数据将保留，分红结果将在颁奖后公布。
          </p>

          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closing-soon-dismissed", "1");
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
