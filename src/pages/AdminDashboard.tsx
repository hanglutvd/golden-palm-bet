import { useState } from 'react';
import {
  Users, Film, BookOpen, ArrowUpRight, ArrowDownRight,
  RefreshCw, AlertTriangle, Play, Star, TrendingUp, TrendingDown,
  Zap, Trash2, Plus
} from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { GameCoin } from '@/components/GameCoin';

export function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: movieList } = trpc.movie.list.useQuery();

  const [confirming, setConfirming] = useState(false);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const utils = trpc.useUtils();

  const resetMutation = trpc.admin.resetPrices.useMutation({
    onSuccess: () => {
      utils.invalidate();
      setConfirming(false);
      alert('内测数据已重置：\n- 所有用户余额恢复为 3,000\n- 所有电影价格恢复为 100\n- 所有持仓和交易记录已清空');
    },
  });

  const fixMutation = trpc.admin.fixBasePrice.useMutation({
    onSuccess: (data) => {
      alert(data.message);
    },
    onError: (err) => {
      alert(err.message || '修复失败');
    },
  });

  const [eventForm, setEventForm] = useState<{ movieId: number; impactPercent: string; cycles: string }>({
    movieId: 0, impactPercent: '', cycles: '',
  });

  const { data: activeEvents } = trpc.admin.listRatingEvents.useQuery(undefined, {
    enabled: isAdmin,
  });

  const createEventMutation = trpc.admin.createRatingEvent.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      utils.invalidate();
      setEventForm({ movieId: 0, impactPercent: '', cycles: '' });
    },
    onError: (err) => alert(err.message || '创建失败'),
  });

  const deleteEventMutation = trpc.admin.deleteRatingEvent.useMutation({
    onSuccess: () => {
      utils.invalidate();
    },
    onError: (err) => alert(err.message || '删除失败'),
  });

  const updateRatingsMutation = trpc.admin.updateRatings.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      const adjusted = data.results.filter((r: any) => r.adjusted);
      if (adjusted.length === 0) {
        alert('评分未变化，无价格调整');
        return;
      }
      const msg = adjusted.map((r: any) =>
        `${r.name}: ${r.oldRating}→${r.newRating} | 价格 ${r.oldPrice}→${r.newPrice} (${r.changePercent >= 0 ? '+' : ''}${r.changePercent}%)`
      ).join('\n');
      alert(`评分更新完成，${adjusted.length} 部电影价格已调整：\n\n${msg}`);
    },
    onError: (err) => {
      alert(err.message || '评分更新失败');
    },
  });

  const settleMutation = trpc.admin.forceSettlement.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      alert(data.message);
    },
    onError: (err) => {
      alert(err.message || '结算失败');
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

      {/* Force Settlement */}
      <div className="rounded-lg bg-app-card border border-app-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-4 w-4 text-app-gold" />
            <span className="text-sm font-medium text-foreground">立即结算</span>
          </div>
          <button
            onClick={() => settleMutation.mutate({})}
            disabled={settleMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-gold/30 text-xs text-app-gold hover:bg-app-gold/10 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {settleMutation.isPending ? '结算中...' : '执行结算'}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => fixMutation.mutate()}
            disabled={fixMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-red/30 text-xs text-app-red hover:bg-app-red/10 transition-colors disabled:opacity-50"
          >
            {fixMutation.isPending ? '修复中...' : '修复涨跌幅'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          交易时段（09:00-12:00 / 15:00-18:00）内每 10 分钟自动结算一次。价格实时跳动，涨跌幅跟随变动。收盘后冻结。点击可手动触发一次结算。
        </p>

        {/* Settlement diagnostics */}
        {settleMutation.data?.diagnostics && (
          <div className="mt-3 rounded-md border border-app-border overflow-hidden">
            <div className="px-3 py-1.5 bg-app-bg/60 border-b border-app-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">结算诊断</p>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {settleMutation.data.diagnostics.map((d: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 px-3 py-1 text-[10px] border-b border-app-border/30 last:border-0">
                  <span className="text-foreground truncate">{d.name}</span>
                  <span className="tabular-nums text-muted-foreground">价:{d.currentPrice}</span>
                  <span className="tabular-nums text-app-gold">基:{d.basePrice}</span>
                  <span className={`tabular-nums ${d.changePercent >= 0 ? 'text-app-red' : 'text-app-green'}`}>
                    {d.changePercent >= 0 ? '+' : ''}{d.changePercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Events: Word-of-Mouth Price Impacts */}
      <div className="rounded-lg bg-app-card border border-app-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-app-gold" />
            <span className="text-sm font-medium text-foreground">口碑事件管理</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          为电影设置口碑事件，直接影响股价。负值=口碑崩了（跌），正值=口碑爆发（涨）。每个结算周期（10分钟）衰减一次，持续多个周期后自动消失。
        </p>

        {/* Create event form */}
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-md border border-app-border/60 bg-app-bg/40">
          <select
            value={eventForm.movieId}
            onChange={(e) => setEventForm((prev) => ({ ...prev, movieId: Number(e.target.value) }))}
            className="min-w-[140px] bg-app-bg border border-app-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-app-gold/50"
          >
            <option value={0}>选择电影</option>
            {movieList?.map((m: any) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={eventForm.impactPercent}
              onChange={(e) => setEventForm((prev) => ({ ...prev, impactPercent: e.target.value }))}
              placeholder="-30"
              min={-99}
              max={99}
              className="w-16 bg-app-bg border border-app-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-app-gold/50"
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={eventForm.cycles}
              onChange={(e) => setEventForm((prev) => ({ ...prev, cycles: e.target.value }))}
              placeholder="3"
              min={1}
              max={100}
              className="w-14 bg-app-bg border border-app-border rounded-md px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-app-gold/50"
            />
            <span className="text-xs text-muted-foreground">周期</span>
          </div>
          <button
            onClick={() => {
              if (!eventForm.movieId || !eventForm.impactPercent || !eventForm.cycles) {
                alert('请填写完整');
                return;
              }
              createEventMutation.mutate({
                movieId: eventForm.movieId,
                impactPercent: Number(eventForm.impactPercent),
                cycles: Number(eventForm.cycles),
              });
            }}
            disabled={createEventMutation.isPending}
            className="px-3 py-1.5 rounded-md bg-app-gold/20 text-app-gold text-sm hover:bg-app-gold/30 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            创建
          </button>
        </div>

        {/* Active events list */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {activeEvents && activeEvents.length > 0 ? (
            activeEvents.map((ev: any) => (
              <div key={ev.id} className="flex items-center justify-between px-3 py-2 rounded-md border border-app-border/40 bg-app-bg/30">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-foreground truncate">{ev.movieName}</span>
                  <span className={`text-sm font-bold tabular-nums ${ev.impactPercent >= 0 ? 'text-app-red' : 'text-app-green'}`}>
                    {ev.impactPercent > 0 ? '+' : ''}{ev.impactPercent}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    剩余 {ev.remainingCycles}/{ev.totalCycles} 周期
                  </span>
                  <div className="w-16 h-1.5 bg-app-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ev.impactPercent >= 0 ? 'bg-app-red' : 'bg-app-green'}`}
                      style={{ width: `${(ev.remainingCycles / ev.totalCycles) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`删除「${ev.movieName}」的口碑事件？`)) {
                      deleteEventMutation.mutate({ eventId: ev.id });
                    }
                  }}
                  className="p-1 rounded text-muted-foreground hover:text-app-red transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-3">暂无活跃事件</p>
          )}
        </div>
      </div>

      {/* Rating Management */}
      <div className="rounded-lg bg-app-card border border-app-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-app-gold" />
            <span className="text-sm font-medium text-foreground">口碑评分管理</span>
          </div>
          <button
            onClick={() => {
              if (!movieList) return;
              const payload = movieList
                .filter((m: any) => ratings[m.id] !== undefined && ratings[m.id] !== m.rating)
                .map((m: any) => ({ movieId: m.id, rating: ratings[m.id] }));
              if (payload.length === 0) {
                alert('没有评分变化，无需更新');
                return;
              }
              updateRatingsMutation.mutate({ ratings: payload });
            }}
            disabled={updateRatingsMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-app-gold/30 text-xs text-app-gold hover:bg-app-gold/10 transition-colors disabled:opacity-50"
          >
            {updateRatingsMutation.isPending ? '更新中...' : '应用评分调整'}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          根据首映口碑、场刊评分和媒体评价，为每部电影打分（1-10）。评分变化会直接驱动价格涨跌——评分上升则价格上涨，评分下降则价格下跌。
        </p>

        {/* Movie rating grid */}
        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
          {movieList?.map((movie: any) => {
            const currentRating = ratings[movie.id] !== undefined ? ratings[movie.id] : movie.rating;
            const hasChanged = ratings[movie.id] !== undefined && ratings[movie.id] !== movie.rating;
            return (
              <div key={movie.id} className={`flex items-center justify-between px-3 py-2 rounded-md border ${hasChanged ? 'border-app-gold/50 bg-app-gold/5' : 'border-app-border/60'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-foreground truncate">{movie.name}</span>
                  <span className="text-xs text-muted-foreground">{movie.director}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{Number(movie.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      onClick={() => setRatings((prev) => ({ ...prev, [movie.id]: score }))}
                      className={`w-6 h-6 rounded text-[10px] font-medium transition-colors ${
                        score <= currentRating
                          ? 'bg-app-gold text-black'
                          : 'bg-app-border/30 text-muted-foreground hover:bg-app-border/60'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
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
