import { useState } from 'react';
import { RefreshCw, Trophy, Medal, Award, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/providers/trpc';

interface LeaderboardProps {
  onOpenFull?: () => void;
}

export function Leaderboard({ onOpenFull }: LeaderboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: entries, isLoading } = trpc.leaderboard.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const utils = trpc.useUtils();

  const handleRefresh = () => {
    setIsRefreshing(true);
    utils.leaderboard.list.invalidate();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const getMedalIcon = (medal?: string) => {
    switch (medal) {
      case 'gold':
        return <Trophy className="h-4 w-4 text-yellow-400" />;
      case 'silver':
        return <Medal className="h-4 w-4 text-gray-300" />;
      case 'bronze':
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const displayEntries = entries || [];

  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-app-gold">财富排行</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-app-card border-app-border max-w-xs">
                <p className="text-xs text-muted-foreground">
                  根据玩家当前虚拟资产总额排序，实时更新。
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <button
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin-once' : ''}`}
          />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[auto,1fr,auto] gap-3 px-4 py-2 border-b border-app-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-8">
          排名
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          玩家
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
          资产
        </span>
      </div>

      {/* Leaderboard List */}
      <div className="divide-y divide-app-border/60">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            加载中...
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            暂无玩家数据，快来注册参与竞猜吧！
          </div>
        ) : (
          displayEntries.map((entry) => (
            <div
              key={entry.rank}
              className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5 transition-colors duration-200 hover:bg-app-hover gold-sweep"
            >
              <span className="text-sm font-semibold text-muted-foreground tabular-nums w-8">
                {entry.rank}.
              </span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {entry.username}
                </span>
                {getMedalIcon(entry.medal)}
              </div>
              <span className="text-sm font-semibold tabular-nums text-app-gold">
                <GameCoin amount={entry.balance} />
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer link */}
      <div className="px-4 py-3 border-t border-app-border text-center">
        <button
          onClick={onOpenFull}
          className="text-sm text-app-gold transition-colors duration-150 hover:text-app-gold/80 hover:underline"
        >
          查看完整排行...
        </button>
      </div>
    </div>
  );
}
