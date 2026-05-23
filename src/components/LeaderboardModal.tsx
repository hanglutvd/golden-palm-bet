import { useState } from 'react';
import { RefreshCw, Trophy, Medal, X, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from './GameCoin';

interface LeaderboardModalProps {
  open: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [wechatForm, setWechatForm] = useState<Record<number, string>>({});
  
  const utils = trpc.useUtils();

  const updateWechatMutation = trpc.auth.updateWechatId.useMutation({
    onSuccess: () => {
      utils.leaderboard.list.invalidate();
    },
  });

  const { data: entries, isLoading, refetch } = trpc.leaderboard.list.useQuery(undefined, {
    enabled: open,
  });

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl max-h-[85vh] bg-app-card rounded-xl border border-app-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-app-gold" />
            <h2 className="text-lg font-bold text-foreground">财富排行</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-app-hover transition-colors"
              title="刷新"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-app-hover transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Top 3 Podium */}
          {entries && entries.length >= 3 && (
            <div className="flex items-end justify-center gap-4 py-4">
              {/* 2nd place */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-400/20 border-2 border-slate-400/50 flex items-center justify-center">
                    <Medal className="h-6 w-6 text-slate-400" />
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">{entries[1].username}</span>
                <span className="text-xs font-semibold text-app-gold tabular-nums">
                  <GameCoin amount={entries[1].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                </span>
              </div>

              {/* 1st place */}
              <div className="flex flex-col items-center gap-2 -mt-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-yellow-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-yellow-500/30 border border-yellow-500/50 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-yellow-600">1</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-app-gold">{entries[0].username}</span>
                <span className="text-sm font-bold text-app-gold tabular-nums">
                  <GameCoin amount={entries[0].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                </span>
              </div>

              {/* 3rd place */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-amber-700/20 border-2 border-amber-700/50 flex items-center justify-center">
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
                    <div key={entry.rank}>
                      <div
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
                      
                      {/* WeChat ID input for top 10 users */}
                      {entry.rank <= 10 && isAuthenticated && isMe && (
                        <div className="px-4 pb-2 bg-app-gold/5">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-3.5 w-3.5 text-app-gold flex-shrink-0" />
                            {entry.wechatId && wechatForm[entry.rank] === undefined ? (
                              <span className="text-xs text-muted-foreground">
                                微信号: <span className="text-app-gold">{entry.wechatId}</span>
                                <button
                                  onClick={() => setWechatForm((prev) => ({ ...prev, [entry.rank]: entry.wechatId || '' }))}
                                  className="ml-2 text-xs text-app-gold hover:underline"
                                >
                                  修改
                                </button>
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={wechatForm[entry.rank] || ''}
                                  onChange={(e) => setWechatForm((prev) => ({ ...prev, [entry.rank]: e.target.value }))}
                                  placeholder="请填写微信号（用于领奖联系）"
                                  className="flex-1 bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-app-gold/50"
                                />
                                <button
                                  onClick={() => {
                                    const value = wechatForm[entry.rank]?.trim();
                                    if (!value) return;
                                    updateWechatMutation.mutate({ wechatId: value });
                                  }}
                                  disabled={updateWechatMutation.isPending || !wechatForm[entry.rank]?.trim()}
                                  className="px-2 py-1 rounded bg-app-gold/20 text-app-gold text-xs hover:bg-app-gold/30 transition-colors disabled:opacity-50"
                                >
                                  {updateWechatMutation.isPending ? '提交中...' : '提交'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-app-border flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            共 {entries?.length || 0} 位玩家
          </span>
          <span className="text-xs text-muted-foreground">
            更新于 {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
