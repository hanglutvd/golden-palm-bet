import { useState } from 'react';
import { Trophy, CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const AWARD_CONFIG = [
  { name: '金棕榈奖', dividend: 500 },
  { name: '评审团大奖', dividend: 200 },
  { name: '最佳导演', dividend: 150 },
  { name: '最佳男演员', dividend: 100 },
  { name: '最佳女演员', dividend: 100 },
  { name: '最佳编剧', dividend: 100 },
  { name: '评审团奖', dividend: 100 },
  { name: '特别奖（若有）', dividend: 50 },
];

export function AdminAwards() {
  const [winners, setWinners] = useState<Record<string, number[]>>({});
  const [confirming, setConfirming] = useState(false);

  const utils = trpc.useUtils();
  const { data: movies } = trpc.movie.list.useQuery();

  const setWinnersMutation = trpc.admin.setWinners.useMutation({
    onSuccess: (data) => {
      utils.invalidate();
      setConfirming(false);
      const totalAwards = data.results.length;
      const totalMovies = data.results.reduce((sum, r) => sum + (r.movieIds?.length || 0), 0);
      alert(`开奖完成！共 ${totalAwards} 个奖项，${totalMovies} 部获奖影片，分红已发放。`);
    },
  });

  const addMovieToAward = (awardName: string, movieId: number) => {
    setWinners((prev) => {
      const current = prev[awardName] || [];
      if (current.includes(movieId)) return prev;
      return { ...prev, [awardName]: [...current, movieId] };
    });
  };

  const removeMovieFromAward = (awardName: string, index: number) => {
    setWinners((prev) => {
      const current = [...(prev[awardName] || [])];
      current.splice(index, 1);
      if (current.length === 0) {
        const next = { ...prev };
        delete next[awardName];
        return next;
      }
      return { ...prev, [awardName]: current };
    });
  };

  const handleSetWinners = () => {
    const payload = Object.entries(winners)
      .filter(([_, movieIds]) => movieIds.length > 0)
      .map(([awardName, movieIds]) => {
        const config = AWARD_CONFIG.find((a) => a.name === awardName);
        return {
          awardName,
          movieIds,
          dividend: config?.dividend || 100,
        };
      });

    if (payload.length === 0) {
      alert('请至少选择一个获奖影片');
      return;
    }

    setWinnersMutation.mutate({ winners: payload });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">开奖管理</h1>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg bg-app-red/5 border border-app-red/20 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-app-red flex-shrink-0 mt-0.5" />
        <p className="text-xs text-app-red leading-relaxed">
          <strong>警告：</strong>开奖后系统将自动向获奖影片的持股用户发放分红。此操作不可逆，请确认所有获奖名单准确无误后再执行。
        </p>
      </div>

      {/* Award selection */}
      <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
        <div className="grid grid-cols-[1fr,1.5fr,auto] gap-4 px-4 py-2.5 border-b border-app-border bg-app-bg/60">
          <span className="text-xs font-semibold uppercase text-muted-foreground">奖项</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">获奖影片（可多选）</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">每股分红</span>
        </div>
        <div className="divide-y divide-app-border/40">
          {AWARD_CONFIG.map((award) => {
            const selectedMovies = winners[award.name] || [];
            return (
              <div key={award.name} className="grid grid-cols-[1fr,1.5fr,auto] gap-4 items-start px-4 py-3">
                <div className="flex items-center gap-2 pt-1">
                  <Trophy className="h-4 w-4 text-app-gold" />
                  <span className="text-sm font-medium text-foreground">{award.name}</span>
                </div>

                <div className="space-y-1.5">
                  {/* Selected movie tags */}
                  {selectedMovies.map((movieId, idx) => {
                    const movie = movies?.find((m) => m.id === movieId);
                    return (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-app-gold/10 text-app-gold px-2 py-1 text-xs">
                          {movie?.name || '未知影片'}
                          <button
                            onClick={() => removeMovieFromAward(award.name, idx)}
                            className="hover:text-app-red transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    );
                  })}

                  {/* Add movie selector */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value=""
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (id > 0) {
                          addMovieToAward(award.name, id);
                          e.target.value = '';
                        }
                      }}
                      className="rounded-md border border-app-border bg-app-bg px-2 py-1.5 text-sm text-foreground focus:border-app-gold focus:outline-none"
                    >
                      <option value="">+ 添加获奖影片</option>
                      {movies?.map((m) => (
                        <option key={m.id} value={m.id} disabled={selectedMovies.includes(m.id)}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <span className="text-sm font-semibold tabular-nums text-app-gold text-right pt-1">
                  {award.dividend}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-app-gold text-app-bg text-sm font-bold hover:bg-app-gold/90 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            确认开奖
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-app-red">确定开奖？分红将自动发放</span>
            <button
              onClick={handleSetWinners}
              disabled={setWinnersMutation.isPending}
              className="px-4 py-2 rounded-md bg-app-red text-white text-sm font-medium hover:bg-red-400 transition-colors disabled:opacity-50"
            >
              {setWinnersMutation.isPending ? '处理中...' : '确认开奖'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-md border border-app-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
