import { RefreshCw, Trophy, Medal, Award, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/providers/trpc';
import { GameCoin } from './GameCoin';

interface LeaderboardProps {
  onOpenFull: () => void;
}

export function Leaderboard({ onOpenFull }: LeaderboardProps) {
  const { data: entries, isLoading } = trpc.leaderboard.list.useQuery();

  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-app-gold" />
          <h2 className="text-base font-bold text-app-gold">财富排行</h2>
        </div>
        <button
          onClick={onOpenFull}
          className="flex items-center gap-1 text-xs text-app-gold hover:text-app-gold/80 transition-colors"
        >
          查看详情
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[40px_1fr_1fr] gap-3 px-4 py-2 border-b border-app-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">用户</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">总资产</span>
      </div>

      {/* Entries */}
      <div className="divide-y divide-app-border/60">
        {isLoading ? (
          <div className="px-4 py-6 text-center">
            <div className="animate-spin h-5 w-5 border-2 border-app-gold border-t-transparent rounded-full mx-auto" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            暂无数据
          </div>
        ) : (
          entries.slice(0, 10).map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.rank}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-app-hover ${
                  isTop3 ? 'bg-app-gold/[0.03]' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-6 flex-shrink-0 flex justify-center">
                  {entry.rank === 1 ? (
                    <Medal className="h-4 w-4 text-yellow-500" />
                  ) : entry.rank === 2 ? (
                    <Medal className="h-4 w-4 text-slate-400" />
                  ) : entry.rank === 3 ? (
                    <Medal className="h-4 w-4 text-amber-700" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Username */}
                <span className="text-sm text-foreground truncate flex-1 min-w-0">
                  {entry.username}
                </span>

                {/* Total Assets */}
                <span className="text-sm font-medium text-app-gold tabular-nums text-right">
                  <GameCoin amount={entry.totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {entries && entries.length > 0 && (
        <div className="px-4 py-2 border-t border-app-border bg-app-bg/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>共 {entries.length} 位投资者</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-app-gold transition-colors">
                    <Info className="h-3 w-3" />
                    <span>排行规则</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-app-card border-app-border max-w-[200px]">
                  <p className="text-xs text-muted-foreground">
                    按总资产排序（余额 + 持仓市值）。每日交易时段结束后自动更新。
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
}
