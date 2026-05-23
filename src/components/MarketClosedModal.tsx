import { X, Trophy, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export function MarketClosedModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // v2: updated content after market close
    const dismissed = localStorage.getItem("market-closed-dismissed-v2");
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-app-card rounded-xl border border-app-gold/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-gold/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-app-gold" />
            <h2 className="text-base font-bold text-app-gold">戛纳主竞赛股市 圆满结束</h2>
          </div>
          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closed-dismissed-v2", "1");
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
            <p className="text-base font-medium text-foreground">
              感谢各位玩家的参与和支持！
            </p>
          </div>

          <div className="rounded-lg bg-app-bg border border-app-border p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-app-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-app-gold">1</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                请<strong className="text-app-gold">前十名</strong>玩家在财富排行榜中填写微信号，方便领奖联系。
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-app-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-app-gold">2</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                欢迎大家的支持和玩耍！任何意见和建议可以在<strong className="text-app-gold">讨论区</strong>留言。
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-app-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-app-gold">3</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                明年戛纳八十周年再见！
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Heart className="h-3 w-3 text-app-red" />
            <span>希望大家不要因为在戛纳股市赚了钱就去尝试A股</span>
            <Heart className="h-3 w-3 text-app-red" />
          </div>

          <button
            onClick={() => {
              setShow(false);
              localStorage.setItem("market-closed-dismissed-v2", "1");
            }}
            className="w-full py-2.5 rounded-lg bg-app-gold text-app-bg font-bold text-sm hover:bg-app-gold/90 transition-colors"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
