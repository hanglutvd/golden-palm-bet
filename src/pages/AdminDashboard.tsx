import { useState } from 'react';
import {
  Users, Film, BookOpen, ArrowUpRight, ArrowDownRight,
  RefreshCw, AlertTriangle
} from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { GameCoin } from '@/components/GameCoin';

export function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: movieList } = trpc.movie.list.useQuery();

  const [confirming, setConfirming] = useState(false);
  const utils = trpc.useUtils();

  const resetMutation = trpc.admin.resetPrices.useMutation({
    onSuccess: () => {
      utils.invalidate();
      setConfirming(false);
      alert('内测数据已重置：\n- 所有用户余额恢复为 ¥3000\n- 所有电影价格恢复为 100\n- 所有持仓和交易记录已清空');
    },
  });

  const topMovie = movieList?.[0];
  const bottomMovie = movieList?.[movieList.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">概览</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-app-card border border-app-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-app-gold" />
            <span className="text-xs text-muted-foreground">注册用户</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.userCount ?? 0}</p>
        </div>
        <div className="rounded-lg bg-app-card border border-app-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Film className="h-4 w-4 text-app-green" />
            <span className="text-xs text-muted-foreground">电影数量</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.movieCount ?? 0}</p>
        </div>
        <div className="rounded-lg bg-app-card border border-app-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-app-gold" />
            <span className="text-xs text-muted-foreground">每日分析</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats?.diaryCount ?? 0}</p>
        </div>
      </div>

      {/* Market summary */}
      <div className="rounded-lg bg-app-card border border-app-border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">市场行情</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-md bg-app-bg/60 border border-app-border/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-app-green" />
              <span className="text-xs text-muted-foreground">最高价</span>
            </div>
            <p className="text-lg font-bold text-app-green">{topMovie?.name ?? '-'}</p>
            <p className="text-sm text-muted-foreground"><GameCoin amount={topMovie?.price.toFixed(2) ?? '-'} /></p>
          </div>
          <div className="rounded-md bg-app-bg/60 border border-app-border/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-app-red" />
              <span className="text-xs text-muted-foreground">最低价</span>
            </div>
            <p className="text-lg font-bold text-app-red">{bottomMovie?.name ?? '-'}</p>
            <p className="text-sm text-muted-foreground"><GameCoin amount={bottomMovie?.price.toFixed(2) ?? '-'} /></p>
          </div>
        </div>
      </div>

      {/* Reset button */}
      <div className="rounded-lg bg-app-card border border-app-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-app-red" />
            <span className="text-sm font-medium text-foreground">内测数据重置</span>
          </div>
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-app-red">确认重置？余额、价格、持仓和交易记录将全部清空</span>
              <button
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="px-3 py-1 rounded-md bg-app-red text-white text-xs font-medium hover:bg-red-400 transition-colors disabled:opacity-50"
              >
                {resetMutation.isPending ? '重置中...' : '确认'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1 rounded-md border border-app-border text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-border text-xs text-muted-foreground hover:text-app-red hover:border-app-red transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              重置内测数据
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
