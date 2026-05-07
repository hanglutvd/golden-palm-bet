import { X, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { trpc } from '@/providers/trpc';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
}

export function MarketModal({ open, onClose }: MarketModalProps) {
  const { data: images, isLoading } = trpc.config.getMarketImages.useQuery(undefined, {
    enabled: open,
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open) return null;

  const validImages = images?.filter(Boolean) || [];
  const hasImages = validImages.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-app-gold" />
            <div>
              <h2 className="text-lg font-bold text-app-gold">口碑中心</h2>
              <p className="text-xs text-muted-foreground">
                {validImages.length > 0 ? `共 ${validImages.length} 张评分表` : '场刊评分表每日更新'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">加载中...</div>
          ) : !hasImages ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <p className="text-sm text-muted-foreground">暂无行情表格数据</p>
              <p className="text-xs text-muted-foreground">管理员可在后台上传表格图片</p>
            </div>
          ) : (
            <>
              {/* Image viewer */}
              <div className="rounded-lg border border-app-border bg-app-bg/40 overflow-hidden relative">
                <img
                  src={validImages[currentIndex]}
                  alt={`场刊评分表 ${currentIndex + 1}`}
                  className="w-full h-auto"
                />
                {validImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex((i) => (i - 1 + validImages.length) % validImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setCurrentIndex((i) => (i + 1) % validImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {validImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === currentIndex ? 'bg-app-gold' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Image tabs */}
              {validImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {validImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`flex-shrink-0 rounded-md border overflow-hidden w-24 h-16 ${
                        i === currentIndex ? 'border-app-gold' : 'border-app-border/40'
                      }`}
                    >
                      <img src={img} alt={`评分表 ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Note */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5">
            <BarChart3 className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-app-gold leading-relaxed">
              场刊评分每日更新。前一天首映的电影将汇总国际主流媒体评分，供玩家参考口碑走势、调整投资策略。评分表来自：Screen Daily场刊、华语媒体评分表、陀螺电影评分表。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
