import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { trpc } from '@/providers/trpc';

export function AdminDiaries() {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [externalUrl, setExternalUrl] = useState('');

  const utils = trpc.useUtils();
  const { data: diaries } = trpc.diary.list.useQuery();

  const createMutation = trpc.admin.createDiary.useMutation({
    onSuccess: () => {
      utils.diary.list.invalidate();
      utils.admin.stats.invalidate();
      setTitle('');
      setSummary('');
      setCoverImage('');
      setExternalUrl('');
    },
  });

  const deleteMutation = trpc.admin.deleteDiary.useMutation({
    onSuccess: () => utils.diary.list.invalidate(),
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">每日分析管理</h1>

      {/* Create form */}
      <div className="rounded-lg bg-app-card border border-app-border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">发布新文章</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题"
          className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
        />
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="摘要"
          rows={2}
          className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none resize-none"
        />
        <input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="封面图 URL（可选）"
          className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
        />
        <input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          placeholder="外部链接 URL（可选）"
          className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
        />
        <button
          onClick={() => {
            if (title.trim()) {
              createMutation.mutate({
                title: title.trim(),
                summary: summary.trim() || undefined,
                coverImage: coverImage.trim() || undefined,
                externalUrl: externalUrl.trim() || undefined,
              });
            }
          }}
          disabled={createMutation.isPending || !title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          发布
        </button>
      </div>

      {/* List */}
      <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
        <div className="grid grid-cols-[1fr,auto,auto] gap-3 px-4 py-2.5 border-b border-app-border bg-app-bg/60">
          <span className="text-xs font-semibold uppercase text-muted-foreground">标题</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">日期</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">操作</span>
        </div>
        <div className="divide-y divide-app-border/40">
          {diaries?.map((d) => (
            <div key={d.id} className="grid grid-cols-[1fr,auto,auto] gap-3 items-center px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                {d.summary && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.summary}</p>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(d.publishDate)}
              </div>
              <div className="flex items-center gap-1">
                {d.externalUrl && (
                  <a
                    href={d.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-app-gold hover:text-app-gold/80 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                <button
                  onClick={() => {
                    if (confirm('确定删除这篇文章吗？')) {
                      deleteMutation.mutate({ id: d.id });
                    }
                  }}
                  className="p-1 text-muted-foreground hover:text-app-red transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {!diaries?.length && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              暂无文章
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
