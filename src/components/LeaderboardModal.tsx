import { useState } from 'react';
import { RefreshCw, Trophy, Medal, Award, X, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
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

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 font-bold';
    if (rank === 2) return 'text-gray-300 font-bold';
    if (rank === 3) return 'text-amber-600 font-bold';
    return 'text-muted-foreground';
  };

  const displayEntries = entries || [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-app-gold" />
            <h2 className="text-lg font-bold text-app-gold">财富排行</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin-once' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              加载中...
            </div>
          ) : displayEntries.length === 0 ? (
            <div className="py-12 text-center">
              <Info className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                暂无玩家数据
              </p>
              <p className="text-xs text-muted-foreground">
                快来注册参与竞猜，抢占排行榜首位！
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Table Header */}
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 px-2 py-2 border-b border-app-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-10">
                  排名
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  玩家
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                  资产
                </span>
              </div>

              {/* List */}
              <div className="divide-y divide-app-border/40">
                {displayEntries.map((entry) => (
                  <div
                    key={entry.rank}
                    className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-2 py-2.5 transition-colors duration-200 hover:bg-app-hover rounded-md"
                  >
                    <span className={`text-sm tabular-nums w-10 ${getRankStyle(entry.rank)}`}>
                      {entry.rank}.
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {entry.username}
                      </span>
                      {getMedalIcon(entry.medal)}
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      <GameCoin amount={entry.balance} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
