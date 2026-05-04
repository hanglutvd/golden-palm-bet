import { X, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { publicUrl } from '@/lib/publicUrl';

interface MarketModalProps {
  open: boolean;
  onClose: () => void;
}

export function MarketModal({ open, onClose }: MarketModalProps) {
  if (!open) return null;

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
            <h2 className="text-lg font-bold text-app-gold">行情中心</h2>
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
          {/* Placeholder for table image */}
          <div className="rounded-lg border border-app-border bg-app-bg/40 overflow-hidden">
            <img
              src={publicUrl("market-chart.png")}
              alt="场刊评分表"
              className="w-full h-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20 gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <p class="text-sm text-muted-foreground">暂无行情表格数据</p>
                      <p class="text-xs text-muted-foreground">管理员可在后台上传表格图片</p>
                    </div>
                  `;
                }
              }}
            />
          </div>

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
