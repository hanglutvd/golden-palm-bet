import { useState } from 'react';
import { Info, Unlock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AwardResult {
  name: string;
  dividend: number;
  predictedWinners: string[];
  actualWinners?: string[];
}

const awardsData: AwardResult[] = [
  { name: '金棕榈奖', dividend: 2000.00, predictedWinners: ['盒子里的羊'] },
  { name: '评审团大奖', dividend: 1500.00, predictedWinners: ['平行故事'] },
  { name: '最佳导演', dividend: 1000.00, predictedWinners: ['是枝裕和'] },
  { name: '最佳男演员', dividend: 800.00, predictedWinners: ['塞巴斯蒂安·斯坦'] },
  { name: '最佳女演员', dividend: 800.00, predictedWinners: ['桑德拉·惠勒'] },
  { name: '最佳编剧', dividend: 800.00, predictedWinners: ['阿斯加·法哈蒂'] },
  { name: '评审团奖', dividend: 800.00, predictedWinners: ['苦涩的圣诞节'] },
  { name: '特别奖（若有）', dividend: 500.00, predictedWinners: ['待定'] },
];

export function AwardPredictions() {
  const [isRevealed, setIsRevealed] = useState(false);

  const formatWinners = (winners?: string[]) => {
    if (!winners || winners.length === 0) return '待开奖';
    if (winners.length === 1) return winners[0];
    return winners.join('、');
  };

  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-app-gold">
            {isRevealed ? '获奖名单' : '分红标准'}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-app-card border-app-border max-w-xs">
                <p className="text-xs text-muted-foreground">
                  {isRevealed
                    ? '第79届戛纳电影节各奖项正式获奖名单及每股分红。支持并列获奖。'
                    : '电影节闭幕、奖项颁布后，此处将公布实际获奖影片及对应分红金额。当前为预设分红标准。支持并列获奖。'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Toggle reveal button (demo/admin) */}
        <button
          onClick={() => setIsRevealed(!isRevealed)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 border border-app-border hover:border-app-gold hover:text-app-gold text-muted-foreground"
        >
          <Unlock className="h-3 w-3" />
          {isRevealed ? '隐藏结果' : '开奖'}
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr,auto] gap-4 px-4 py-2 border-b border-app-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {isRevealed ? '奖项 / 获奖影片' : '奖项'}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
          每股分红
        </span>
      </div>

      {/* Award List */}
      <div className="divide-y divide-app-border/60">
        {awardsData.map((award, index) => {
          const winners = isRevealed
            ? (award.actualWinners || award.predictedWinners)
            : undefined;
          const hasMultiple = winners && winners.length > 1;

          return (
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
                {isRevealed ? (
                  <span className="text-xs text-app-gold leading-relaxed">
                    {hasMultiple && (
                      <span className="inline-block rounded bg-app-gold/10 px-1 py-0.5 text-[10px] mr-1.5">并列</span>
                    )}
                    {formatWinners(winners)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    待开奖
                  </span>
                )}
              </div>
              <span
                className={`text-sm font-semibold tabular-nums flex-shrink-0 mt-0.5 ${
                  award.dividend >= 1000 ? 'text-app-gold' : 'text-foreground'
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
          {isRevealed
            ? '获奖结果已公布，分红将发放至持仓股东账户。如某奖项出现并列，所有获奖影片均按标准分红。'
            : '电影节将于2026年5月12日至23日举行，开奖后此处将更新实际获奖名单。奖项可能出现并列。'}
        </p>
      </div>
    </div>
  );
}
