import { Trophy } from 'lucide-react';

const awardsList = [
  { name: '金棕榈奖', dividend: 500.00 },
  { name: '评审团大奖', dividend: 200.00 },
  { name: '最佳导演', dividend: 150.00 },
  { name: '最佳男演员 / 最佳女演员', dividend: 100.00 },
  { name: '最佳编剧', dividend: 100.00 },
  { name: '评审团奖', dividend: 100.00 },
  { name: '特别奖（若有）', dividend: 50.00 },
];

export function AwardResults() {
  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-app-border">
        <Trophy className="h-4 w-4 text-app-gold" />
        <h2 className="text-base font-bold text-app-gold">分红结果</h2>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr,auto] gap-4 px-4 py-2 border-b border-app-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          奖项 / 获奖影片
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
          每股分红
        </span>
      </div>

      {/* Award List */}
      <div className="divide-y divide-app-border/60">
        {awardsList.map((award, index) => (
          <div
            key={index}
            className="group relative flex items-start justify-between px-4 py-3 transition-colors duration-200 hover:bg-app-hover"
          >
            {/* Hover indicator line */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-app-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-3">
              <span className="text-sm font-medium text-foreground">
                {award.name}
              </span>
              <span className="text-xs text-muted-foreground">
                待揭晓
              </span>
            </div>
            <span
              className={`text-sm font-semibold tabular-nums flex-shrink-0 mt-0.5 ${
                award.dividend >= 300 ? 'text-app-gold' : 'text-foreground'
              }`}
            >
              {award.dividend.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t border-app-border bg-app-bg/40">
        <p className="text-xs text-muted-foreground text-center">
          电影节将于2026年5月12日至23日举行，开奖后此处将更新实际获奖名单
        </p>
      </div>
    </div>
  );
}
