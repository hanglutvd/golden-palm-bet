import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from '@/components/GameCoin';

interface UserPortfolioPreviewProps {
  onOpenFull: () => void;
}

export function UserPortfolioPreview({ onOpenFull }: UserPortfolioPreviewProps) {
  const { user } = useAuth();
  const { data: portfolio, isLoading } = trpc.trading.portfolio.useQuery(undefined, {
    enabled: !!user,
  });
  const [expanded, setExpanded] = useState(false);

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="rounded-lg bg-app-card border border-app-border p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-app-border/40 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 bg-app-border/40 rounded" />
            <div className="h-10 bg-app-border/40 rounded" />
            <div className="h-10 bg-app-border/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const hasHoldings = portfolio && portfolio.holdings.length > 0;
  const totalPnl = portfolio?.totalPnl ?? 0;

  return (
    <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-app-gold" />
          <h2 className="text-base font-bold text-foreground">我的持仓</h2>
        </div>
        <button
          onClick={onOpenFull}
          className="text-xs text-app-gold hover:text-app-gold/80 transition-colors"
        >
          查看详情
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="rounded-md bg-app-bg/60 border border-app-border/40 px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">余额</p>
          <p className="text-sm font-bold text-app-gold tabular-nums mt-0.5">
            <GameCoin amount={portfolio?.balance ?? 0} iconClassName="h-3 w-3" />
          </p>
        </div>
        <div className="rounded-md bg-app-bg/60 border border-app-border/40 px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">市值</p>
          <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">
            <GameCoin amount={portfolio?.totalMarketValue ?? 0} iconClassName="h-3 w-3" />
          </p>
        </div>
        <div className="rounded-md bg-app-bg/60 border border-app-border/40 px-2 py-2 text-center">
          <p className="text-[10px] text-muted-foreground">总资产</p>
          <p className="text-sm font-bold text-app-gold tabular-nums mt-0.5">
            <GameCoin amount={portfolio?.totalAssets ?? 0} iconClassName="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* P/L summary */}
      {totalPnl !== 0 && (
        <div className={`mx-3 mb-2 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 ${totalPnl >= 0 ? 'bg-app-green/5' : 'bg-app-red/5'}`}>
          {totalPnl >= 0 ? <TrendingUp className="h-3 w-3 text-app-green" /> : <TrendingDown className="h-3 w-3 text-app-red" />}
          <span className="text-xs">
            盈亏 <span className={`font-bold ${totalPnl >= 0 ? 'text-app-green' : 'text-app-red'}`}>{totalPnl >= 0 ? '+' : ''}<GameCoin amount={totalPnl.toFixed(2)} iconClassName="h-3 w-3" /></span>
          </span>
        </div>
      )}

      {/* Holdings preview */}
      {hasHoldings && (
        <div className="border-t border-app-border/40">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Package className="h-3 w-3" />
              持仓 {portfolio?.holdings.length} 支
            </span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <div className="px-3 pb-3 space-y-1.5">
              {portfolio?.holdings.map((h) => (
                <div
                  key={h.movieId}
                  className="flex items-center justify-between rounded-md bg-app-bg/40 px-2.5 py-1.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{h.movieName}</p>
                    <p className="text-[10px] text-muted-foreground">{h.quantity} 股 @ {h.avgBuyPrice.toFixed(0)}</p>
                  </div>
                  <div className={`text-right ${h.pnl >= 0 ? 'text-app-green' : 'text-app-red'}`}>
                    <p className="text-xs font-medium tabular-nums">{h.pnl >= 0 ? '+' : ''}{h.pnl.toFixed(0)}</p>
                    <p className="text-[10px] tabular-nums">{h.pnl >= 0 ? '+' : ''}{h.pnlPercent.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasHoldings && (
        <div className="px-4 pb-3 text-center">
          <p className="text-xs text-muted-foreground">暂无持仓，去行情页买入电影股票吧</p>
        </div>
      )}
    </div>
  );
}
