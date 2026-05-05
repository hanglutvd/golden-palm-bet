import { BarChart3, ArrowRight } from 'lucide-react';
import { trpc } from '@/providers/trpc';

interface MarketPreviewProps {
  onOpenFull: () => void;
}

export function MarketPreview({ onOpenFull }: MarketPreviewProps) {
  const { data: images } = trpc.config.getMarketImages.useQuery();
  const validImages = images?.filter(Boolean) || [];
  const hasImages = validImages.length > 0;

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

      {/* Preview Images */}
      <div
        onClick={onOpenFull}
        className="group cursor-pointer px-4 py-3"
      >
        {hasImages ? (
          <div className="relative w-full h-32 rounded-md overflow-hidden bg-app-bg border border-app-border/60">
            <img
              src={validImages[0]}
              alt="场刊评分表"
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              loading="lazy"
            />
            {validImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                共 {validImages.length} 张
              </div>
            )}
            {/* Overlay hint */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-xs text-white font-medium px-3 py-1.5 rounded-md bg-app-gold/80">
                点击查看完整行情
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-32 rounded-md bg-app-bg flex flex-col items-center justify-center border border-app-border/60 gap-2">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">暂无行情图片</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          每日更新场刊评分表，查看昨日首映影片的媒体口碑
        </p>
      </div>
    </div>
  );
}
