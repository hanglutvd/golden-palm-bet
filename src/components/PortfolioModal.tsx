import { X, Wallet, TrendingUp, TrendingDown, Package, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { GameCoin } from "@/components/GameCoin";

interface PortfolioModalProps {
  open: boolean;
  onClose: () => void;
}

export function PortfolioModal({ open, onClose }: PortfolioModalProps) {
  const { user } = useAuth();
  const { data: portfolio, isLoading } = trpc.trading.portfolio.useQuery(undefined, {
    enabled: open,
  });
  const { data: transactions } = trpc.trading.myTransactions.useQuery(undefined, {
    enabled: open,
  });

  if (!open) return null;

  const hasHoldings = portfolio && portfolio.holdings.length > 0;
  const hasTransactions = transactions && transactions.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Wider modal: max-w-4xl instead of max-w-2xl */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-app-gold" />
            <div>
              <h2 className="text-base font-bold text-foreground">我的持仓</h2>
              <p className="text-xs text-muted-foreground">{user?.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Asset Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-app-bg/60 border border-app-border/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">账户余额</p>
              <p className="text-lg font-bold text-app-gold tabular-nums">
                <GameCoin amount={portfolio?.balance ?? 0} />
              </p>
            </div>
            <div className="rounded-lg bg-app-bg/60 border border-app-border/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">持仓市值</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                <GameCoin amount={portfolio?.totalMarketValue ?? 0} />
              </p>
            </div>
            <div className="rounded-lg bg-app-bg/60 border border-app-border/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">总资产</p>
              <p className="text-lg font-bold text-app-gold tabular-nums">
                <GameCoin amount={portfolio?.totalAssets ?? 0} />
              </p>
            </div>
          </div>

          {/* P/L summary */}
          {portfolio && portfolio.totalPnl !== 0 && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 border ${portfolio.totalPnl >= 0 ? "bg-app-red/5 border-app-red/20" : "bg-app-green/5 border-app-green/20"}`}>
              {portfolio.totalPnl >= 0 ? <TrendingUp className="h-4 w-4 text-app-red" /> : <TrendingDown className="h-4 w-4 text-app-green" />}
              <span className="text-sm">
                持仓盈亏：
                <span className={`font-bold ${portfolio.totalPnl >= 0 ? "text-app-red" : "text-app-green"}`}>
                  {portfolio.totalPnl >= 0 ? "+" : ""}<GameCoin amount={portfolio.totalPnl.toFixed(2)} />
                </span>
              </span>
            </div>
          )}

          {/* Holdings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">当前持仓</h3>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">加载中...</p>
            ) : !hasHoldings ? (
              <div className="rounded-lg bg-app-bg/40 border border-app-border/40 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">暂无持仓</p>
                <p className="text-xs text-muted-foreground mt-1">在股市行情买入电影股票即可开始投资</p>
              </div>
            ) : (
              <div className="rounded-lg border border-app-border overflow-x-auto">
                <div className="min-w-[480px]">
                {/* Fixed column widths for proper alignment */}
                <div className="grid grid-cols-[1.5fr_60px_80px_80px_120px] gap-x-4 gap-y-0 px-4 py-2 bg-app-bg/60 border-b border-app-border">
                  <span className="text-xs font-semibold text-muted-foreground">电影</span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">持股</span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">成本价</span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">现价</span>
                  <span className="text-xs font-semibold text-muted-foreground text-right">盈亏</span>
                </div>
                <div className="divide-y divide-app-border/40">
                  {portfolio?.holdings.map((h) => (
                    <div key={h.movieId} className="grid grid-cols-[1.5fr_60px_80px_80px_120px] gap-x-4 gap-y-0 items-center px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{h.movieName}</p>
                        <p className="text-xs text-muted-foreground truncate">{h.director}</p>
                      </div>
                      <span className="text-sm text-foreground tabular-nums text-right">{h.quantity}</span>
                      <span className="text-sm text-muted-foreground tabular-nums text-right"><GameCoin amount={h.avgBuyPrice.toFixed(2)} iconClassName="h-3 w-3" /></span>
                      <span className="text-sm text-foreground tabular-nums text-right"><GameCoin amount={h.currentPrice.toFixed(2)} iconClassName="h-3 w-3" /></span>
                      <div className={`text-right min-w-0 ${h.pnl >= 0 ? "text-app-red" : "text-app-green"}`}>
                        <span className="text-sm font-medium tabular-nums inline-flex items-center gap-0.5">{h.pnl >= 0 ? "+" : ""}<GameCoin amount={h.pnl.toFixed(2)} iconClassName="h-3 w-3" /></span>
                        <span className="text-xs tabular-nums ml-0.5">({h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">交易记录</h3>
            </div>

            {!hasTransactions ? (
              <div className="rounded-lg bg-app-bg/40 border border-app-border/40 px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">暂无交易记录</p>
              </div>
            ) : (
              <div className="rounded-lg border border-app-border overflow-x-auto">
                <div className="min-w-0">
                  <div className="grid grid-cols-[48px_1fr_48px_72px_72px] sm:grid-cols-[80px_1fr_60px_90px_100px] gap-x-2 sm:gap-x-4 gap-y-0 px-3 sm:px-4 py-2 bg-app-bg/60 border-b border-app-border">
                    <span className="text-xs font-semibold text-muted-foreground">类型</span>
                    <span className="text-xs font-semibold text-muted-foreground">电影</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">股数</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">价格</span>
                    <span className="text-xs font-semibold text-muted-foreground text-right">金额</span>
                  </div>
                  <div className="divide-y divide-app-border/40 max-h-64 overflow-y-auto">
                    {transactions?.map((tx) => (
                      <div key={tx.id} className="grid grid-cols-[48px_1fr_48px_72px_72px] sm:grid-cols-[80px_1fr_60px_90px_100px] gap-x-2 sm:gap-x-4 gap-y-0 items-center px-3 sm:px-4 py-2">
                        <div className={`flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[10px] sm:text-xs font-medium w-fit ${tx.type === "buy" ? "bg-app-green/10 text-app-green" : "bg-app-red/10 text-app-red"}`}>
                          {tx.type === "buy" ? <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" /> : <ArrowDownRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />}
                          <span className="whitespace-nowrap">{tx.type === "buy" ? "买" : "卖"}</span>
                        </div>
                        <span className="text-sm text-foreground truncate">{tx.movieName}</span>
                        <span className="text-sm text-foreground tabular-nums text-right">{tx.quantity}</span>
                        <span className="text-sm text-muted-foreground tabular-nums text-right"><GameCoin amount={tx.price.toFixed(2)} iconClassName="h-3 w-3" /></span>
                        <span className={`text-sm font-medium tabular-nums text-right whitespace-nowrap ${tx.type === "buy" ? "text-app-red" : "text-app-green"}`}>
                          {tx.type === "buy" ? "-" : "+"}<GameCoin amount={tx.totalAmount.toFixed(2)} iconClassName="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
