import { BarChart3, ArrowRight } from 'lucide-react';
import { publicUrl } from '@/lib/publicUrl';

interface MarketPreviewProps {
  onOpenFull: () => void;
}

export function MarketPreview({ onOpenFull }: MarketPreviewProps) {
  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-app-gold" />
          <h2 className="text-base font-bold text-app-gold">行情中心</h2>
        </div>
        <button
          onClick={onOpenFull}
          className="flex items-center gap-1 text-xs text-app-gold hover:text-app-gold/80 transition-colors"
        >
          查看详情
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Preview Image */}
      <div
        onClick={onOpenFull}
        className="group cursor-pointer px-4 py-3"
      >
        <div className="relative w-full h-32 rounded-md overflow-hidden bg-app-bg border border-app-border/60">
          <img
            src={publicUrl("market-chart.png")}
            alt="场刊评分表"
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* Overlay hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="text-xs text-white font-medium px-3 py-1.5 rounded-md bg-app-gold/80">
              点击查看完整行情
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          每日更新场刊评分表，查看昨日首映影片的媒体口碑
        </p>
      </div>
    </div>
  );
}
