import { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const awardsList = [
  { name: '金棕榈奖', dividend: 500.00 },
  { name: '评审团大奖', dividend: 200.00 },
  { name: '最佳导演', dividend: 150.00 },
  { name: '最佳女演员', dividend: 100.00 },
  { name: '最佳男演员', dividend: 100.00 },
  { name: '最佳编剧', dividend: 100.00 },
  { name: '评审团奖', dividend: 100.00 },
  { name: '特别奖（若有）', dividend: 50.00 },
];

export function AwardResults() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Collapsed Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-app-card border border-app-border hover:bg-app-hover transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-app-gold" />
          <span className="text-sm font-medium text-foreground">分红结果</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">待揭晓</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-app-gold transition-colors" />
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-app-gold" />
                  <div>
                    <h2 className="text-lg font-bold text-app-gold">分红结果</h2>
                    <p className="text-xs text-muted-foreground">电影节闭幕后公布</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr,auto] gap-4 px-2 py-2 border-b border-app-border">
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
                      className="group relative flex items-start justify-between px-2 py-3 transition-colors duration-200 hover:bg-app-hover rounded-md"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-app-gold opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-l-md" />

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
                <div className="rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5">
                  <p className="text-xs text-app-gold text-center">
                    电影节将于2026年5月12日至23日举行，开奖后此处将更新实际获奖名单
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
