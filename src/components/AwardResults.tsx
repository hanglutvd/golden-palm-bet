import { Trophy, Crown, Film } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const AWARD_ORDER = [
  '金棕榈奖',
  '评审团大奖',
  '最佳导演',
  '最佳男演员',
  '最佳女演员',
  '最佳编剧',
  '评审团奖',
  '特别奖（若有）',
];

const DEFAULT_DIVIDENDS: Record<string, number> = {
  '金棕榈奖': 5000,
  '评审团大奖': 3000,
  '最佳导演': 2500,
  '最佳男演员': 2000,
  '最佳女演员': 2000,
  '最佳编剧': 2000,
  '评审团奖': 2000,
  '特别奖（若有）': 1500,
};

export function AwardResults() {
  const { data: awardList } = trpc.admin.listAwardResults.useQuery();

  // Group award results by award name
  const grouped: Record<string, { movieNames: string[]; dividend: number }> = {};
  if (awardList) {
    for (const r of awardList) {
      if (!grouped[r.awardName]) {
        grouped[r.awardName] = { movieNames: [], dividend: r.dividend };
      }
      grouped[r.awardName].movieNames.push(r.movieName);
    }
  }

  const hasResults = awardList && awardList.length > 0;

  return (
    <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-app-card/80 border-b border-app-border">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-app-gold" />
          <h2 className="text-sm font-semibold text-foreground">分红结果</h2>
        </div>
        <span className="text-xs text-muted-foreground">每股分红</span>
      </div>

      {/* Award List */}
      <div className="divide-y divide-app-border/60">
        {hasResults ? (
          // Show actual award results with winning films
          AWARD_ORDER.map((awardName) => {
            const result = grouped[awardName];
            if (!result) return null;
            const isTop = result.dividend >= 2500;
            return (
              <div
                key={awardName}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-app-hover/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {awardName === '金棕榈奖' && <Crown className="h-3.5 w-3.5 text-app-gold flex-shrink-0" />}
                    <span className="text-sm text-foreground">{awardName}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Film className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">
                      {result.movieNames.map((name) => `《${name}》`).join('、')}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums flex-shrink-0 ml-3 ${
                    isTop ? 'text-app-gold' : 'text-foreground'
                  }`}
                >
                  {result.dividend.toFixed(2)}
                </span>
              </div>
            );
          })
        ) : (
          // Show default award list before results are set
          AWARD_ORDER.map((awardName) => {
            const dividend = DEFAULT_DIVIDENDS[awardName] || 0;
            const isTop = dividend >= 2500;
            return (
              <div
                key={awardName}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-app-hover/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {awardName === '金棕榈奖' && <Crown className="h-3.5 w-3.5 text-app-gold" />}
                  <span className="text-sm text-foreground">{awardName}</span>
                </div>
                <span
                  className={`text-sm font-bold tabular-nums ${
                    isTop ? 'text-app-gold' : 'text-foreground'
                  }`}
                >
                  {dividend.toFixed(2)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t border-app-border bg-app-bg/40">
        <p className="text-xs text-muted-foreground text-center">
          {hasResults ? '获奖结果已公布，分红已发放' : '颁奖后根据获奖影片统一结算分红'}
        </p>
      </div>
    </div>
  );
}
