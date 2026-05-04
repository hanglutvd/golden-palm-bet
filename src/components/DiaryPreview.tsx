import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { trpc } from '@/providers/trpc';

interface DiaryPreviewProps {
  onOpenFull: () => void;
}

export function DiaryPreview({ onOpenFull }: DiaryPreviewProps) {
  const { data: diaries, isLoading } = trpc.diary.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const latest = diaries?.[0];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-app-gold" />
          <h2 className="text-base font-bold text-app-gold">每日分析</h2>
        </div>
        <button
          onClick={onOpenFull}
          className="flex items-center gap-1 text-xs text-app-gold hover:text-app-gold/80 transition-colors"
        >
          查看全部
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {isLoading ? (
          <div className="text-center py-4 text-xs text-muted-foreground">
            加载中...
          </div>
        ) : !latest ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              电影节期间将更新每日市场分析
            </p>
          </div>
        ) : (
          <div
            onClick={onOpenFull}
            className="group cursor-pointer"
          >
            {/* Cover Image */}
            {latest.coverImage ? (
              <div className="w-full h-28 rounded-md overflow-hidden bg-app-card mb-3">
                <img
                  src={latest.coverImage}
                  alt={latest.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="w-full h-28 rounded-md bg-app-bg flex items-center justify-center mb-3">
                <BookOpen className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}

            {/* Title & Date */}
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(latest.publishDate)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-foreground group-hover:text-app-gold transition-colors line-clamp-2">
              {latest.title}
            </h3>
            {latest.summary && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {latest.summary}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
