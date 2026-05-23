import { Trophy, Crown } from 'lucide-react';

const awardsList = [
  { name: '金棕榈奖', dividend: 5000.00, icon: Crown },
  { name: '评审团大奖', dividend: 3000.00 },
  { name: '最佳导演', dividend: 2500.00 },
  { name: '最佳女演员', dividend: 2000.00 },
  { name: '最佳男演员', dividend: 2000.00 },
  { name: '最佳编剧', dividend: 2000.00 },
  { name: '评审团奖', dividend: 2000.00 },
  { name: '特别奖（若有）', dividend: 1500.00 },
];

export function AwardResults() {
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
        {awardsList.map((award, index) => {
          const Icon = award.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-app-hover/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-3.5 w-3.5 text-app-gold" />}
                <span className="text-sm text-foreground">{award.name}</span>
              </div>
              <span
                className={`text-sm font-bold tabular-nums ${
                  award.dividend >= 2500 ? 'text-app-gold' : 'text-foreground'
                }`}
              >
                {award.dividend.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2.5 border-t border-app-border bg-app-bg/40">
        <p className="text-xs text-muted-foreground text-center">
          颁奖后根据获奖影片统一结算分红
        </p>
      </div>
    </div>
  );
}
