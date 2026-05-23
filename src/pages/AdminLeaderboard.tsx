import { useState } from 'react';
import { Trophy, Medal, Crown, MessageCircle, User, RefreshCw } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { GameCoin } from '@/components/GameCoin';

export function AdminLeaderboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { data: entries, isLoading, refetch } = trpc.admin.leaderboard.useQuery();

  const handleRefresh = async () => {
    await refetch();
    setLastUpdated(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">财富排行</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-border text-sm text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        共 {entries?.length || 0} 位玩家 · 更新于 {lastUpdated.toLocaleTimeString('zh-CN')}
      </p>

      {/* Top 3 Podium */}
      {entries && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-6 py-4">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-400/20 border-2 border-slate-400/50 flex items-center justify-center">
              <Medal className="h-6 w-6 text-slate-400" />
            </div>
            <span className="text-sm font-medium text-foreground">{entries[1].username}</span>
            <span className="text-xs font-semibold text-app-gold">
              <GameCoin amount={entries[1].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
            </span>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2 -mt-4">
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 flex items-center justify-center">
              <Crown className="h-7 w-7 text-yellow-500" />
            </div>
            <span className="text-sm font-bold text-app-gold">{entries[0].username}</span>
            <span className="text-sm font-bold text-app-gold">
              <GameCoin amount={entries[0].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
            </span>
          </div>
          {/* 3rd */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-amber-700/20 border-2 border-amber-700/50 flex items-center justify-center">
              <Medal className="h-6 w-6 text-amber-700" />
            </div>
            <span className="text-sm font-medium text-foreground">{entries[2].username}</span>
            <span className="text-xs font-semibold text-app-gold">
              <GameCoin amount={entries[2].totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
            </span>
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[50px_1fr_1fr_100px_100px_120px_100px] gap-3 px-4 py-2.5 border-b border-app-border bg-app-bg/60">
              <span className="text-xs font-semibold uppercase text-muted-foreground">排名</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground">用户名</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground">邮箱</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground text-right">余额</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground text-right">市值</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground text-right">总资产</span>
              <span className="text-xs font-semibold uppercase text-muted-foreground text-center">微信号</span>
            </div>
            <div className="divide-y divide-app-border/40 max-h-[600px] overflow-y-auto">
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
                  const isTop10 = entry.rank <= 10;
                  return (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-[50px_1fr_1fr_100px_100px_120px_100px] gap-3 items-center px-4 py-2.5 transition-colors hover:bg-app-hover ${
                        isTop10 ? 'bg-app-gold/[0.02]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {entry.rank === 1 ? (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="h-4 w-4 text-slate-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="h-4 w-4 text-amber-700" />
                        ) : (
                          <span className="text-xs text-muted-foreground tabular-nums">{entry.rank}</span>
                        )}
                      </div>
                      <span className="text-sm text-foreground flex items-center gap-1">
                        {entry.username}
                        {entry.role === 'admin' && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-app-gold/20 text-app-gold">管</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.email}</span>
                      <span className="text-xs text-muted-foreground tabular-nums text-right">
                        <GameCoin amount={entry.balance.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums text-right">
                        <GameCoin amount={entry.marketValue.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                      <span className="text-sm font-medium text-app-gold tabular-nums text-right">
                        <GameCoin amount={entry.totalAssets.toFixed(2)} iconClassName="h-3 w-3" />
                      </span>
                      <div className="flex items-center justify-center">
                        {isTop10 ? (
                          entry.wechatId ? (
                            <span className="inline-flex items-center gap-1 text-xs text-app-gold bg-app-gold/10 px-2 py-0.5 rounded">
                              <MessageCircle className="h-3 w-3" />
                              {entry.wechatId}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-app-red bg-app-red/10 px-2 py-0.5 rounded">
                              <MessageCircle className="h-3 w-3" />
                              未填写
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
