import { useState } from 'react';
import { RefreshCw, Trophy, Medal, Award, X, Info, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from './GameCoin';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const { data: entries, isLoading, refetch } = trpc.leaderboard.list.useQuery(undefined, {
    enabled: open,
  });
  const { user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-app-gold" />
            <div>
              <h2 className="text-lg font-bold text-app-gold">财富排行</h2>
              <p className="text-xs text-muted-foreground">总资产 = 余额 + 持仓市值</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-md text-muted-foreground hover:text-app-gold transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Top 3 Podium */}
          {entries && entries.length >= 3 && (
            <div className="flex items-end justify-center gap-6 pb-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-500/15 border-2 border-slate-400/30 flex items-center justify-center">
                    <Award className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-500/30 border border-slate-400/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-300">2</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{entries[1].username}</span>
                <span className="text-xs font-semibold text-app-gold tabular-nums">
                  <GameCoin amount={entries[1].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                </span>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center gap-2 pb-0">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/15 border-2 border-yellow-500/40 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500/30 border border-yellow-500/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-yellow-400">1</span>
                  </div>
                </div>
                <span className="text-base font-bold text-foreground">{entries[0].username}</span>
                <span className="text-sm font-bold text-app-gold tabular-nums">
                  <GameCoin amount={entries[0].totalAssets.toFixed(2)} iconClassName="h-3.5 w-3.5" />
                </span>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center gap-2 pb-2">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-amber-700/15 border-2 border-amber-700/30 flex items-center justify-center">
                    <Medal className="h-6 w-6 text-amber-700" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700/30 border border-amber-700/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-amber-600">3</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{entries[2].username}</span>
                <span className="text-xs font-semibold text-app-gold tabular-nums">
                  <GameCoin amount={entries[2].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                </span>
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="grid grid-cols-[40px_1fr_90px] md:grid-cols-[50px_1fr_80px_80px_100px] gap-2 md:gap-3 px-3 md:px-4 py-2 bg-app-bg/60 border-b border-app-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">排名</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">用户</span>
              <span className="hidden md:block text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">余额</span>
              <span className="hidden md:block text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">市值</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">总资产</span>
            </div>
            <div className="divide-y divide-app-border/40 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="animate-spin h-5 w-5 border-2 border-app-gold border-t-transparent rounded-full mx-auto" />
                </div>
              ) : !entries || entries.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  暂无数据
                </div>
              ) : (
                entries.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  const isMe = user && entry.username === user.username;
                  return (
                    <div
                      key={entry.rank}
                      className={`grid grid-cols-[40px_1fr_90px] md:grid-cols-[50px_1fr_80px_80px_100px] gap-2 md:gap-3 items-center px-3 md:px-4 py-2.5 transition-colors hover:bg-app-hover ${
                        isMe ? 'bg-app-gold/15 border-l-2 border-app-gold' : isTop3 ? 'bg-app-gold/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <Medal className="h-4 w-4 text-yellow-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="h-4 w-4 text-slate-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="h-4 w-4 text-amber-700" />
                        ) : (
                          <span className="text-xs text-muted-foreground tabular-nums">{entry.rank}</span>
                        )}
                      </div>
                      <span className={`text-sm truncate min-w-0 flex items-center gap-1 ${isMe ? 'font-bold text-app-gold' : 'text-foreground'}`}>
                        {entry.username}
                        {isMe && <User className="h-3 w-3 text-app-gold flex-shrink-0" />}
                      </span>
                      <span className="hidden md:block text-xs text-muted-foreground tabular-nums text-right">
                        <GameCoin amount={entry.balance.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                      <span className="hidden md:block text-xs text-muted-foreground tabular-nums text-right">
                        <GameCoin amount={entry.marketValue.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                      <span className="text-sm font-medium text-app-gold tabular-nums text-right">
                        <GameCoin amount={entry.totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5">
            <Info className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-app-gold leading-relaxed">
              排行按<strong>总资产</strong>排序（余额 + 持仓市值）。买入股票后余额减少但市值增加，总资产才是真实财富。
              每日交易时段结束后自动更新。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
