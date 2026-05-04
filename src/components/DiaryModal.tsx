import { X, Calendar, ExternalLink, BookOpen, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/providers/trpc';

interface DiaryModalProps {
  open: boolean;
  onClose: () => void;
}

export function DiaryModal({ open, onClose }: DiaryModalProps) {
  const { data: diaries, isLoading } = trpc.diary.list.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });

  if (!open) return null;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-app-gold" />
                        <h2 className="text-lg font-bold text-app-gold">每日分析</h2>
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
          {/* Description */}
          <div className="flex items-start gap-2 rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5 mb-5">
            <BookOpen className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-app-gold leading-relaxed">
              电影节期间每日更新的市场分析。记录市场动态、热门影片走势和投资机会。
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              加载中...
            </div>
          ) : !diaries || diaries.length === 0 ? (
            <div className="py-12 text-center">
              <ImageOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                暂无每日分析
              </p>
              <p className="text-xs text-muted-foreground">
                电影节开幕后将在此更新每日分析
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {diaries.map((diary) => (
                <div
                  key={diary.id}
                  className="group flex gap-4 rounded-lg border border-app-border/60 bg-app-bg/40 p-4 transition-all duration-200 hover:bg-app-hover hover:border-app-border"
                >
                  {/* Cover Image */}
                  {diary.coverImage ? (
                    <div className="flex-shrink-0 w-24 h-16 rounded-md overflow-hidden bg-app-card">
                      <img
                        src={diary.coverImage}
                        alt={diary.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-16 rounded-md bg-app-card flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(diary.publishDate)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-app-gold transition-colors truncate">
                      {diary.title}
                    </h3>
                    {diary.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {diary.summary}
                      </p>
                    )}
                  </div>

                  {/* Link */}
                  {diary.externalUrl && (
                    <a
                      href={diary.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-app-gold hover:text-app-gold/80 transition-colors self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="hidden sm:inline">阅读</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
