import { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Trash2, Reply, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

const PAGE_SIZE = 20;
const PREVIEW_COUNT = 10;

export function DiscussPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    id: number;
    username: string;
    content: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const utils = trpc.useUtils();

  // Preview query: always enabled, shows latest 10 on homepage
  const previewQuery = trpc.comment.list.useQuery(
    { limit: PREVIEW_COUNT, offset: 0 }
  );

  // Modal pagination query
  const modalQuery = trpc.comment.list.useQuery(
    { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    { enabled: open }
  );

  const createMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setInput('');
      setReplyTarget(null);
      utils.comment.list.invalidate();
    },
    onError: (err) => {
      alert(err.message || '发送失败');
    },
  });

  const deleteMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      utils.comment.list.invalidate();
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    createMutation.mutate({
      content: input.trim(),
      replyTo: replyTarget?.id,
      replyToUsername: replyTarget?.username,
      replyToContent: replyTarget?.content.slice(0, 60),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (comment: { id: number; username: string; content: string }) => {
    setReplyTarget({ id: comment.id, username: comment.username, content: comment.content });
    setOpen(true);
  };

  const cancelReply = () => {
    setReplyTarget(null);
  };

  const goPrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const goNextPage = () => {
    const modalData = modalQuery.data;
    if (modalData && modalData.total > (page + 1) * PAGE_SIZE) {
      setPage(page + 1);
    }
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return d.toLocaleDateString('zh-CN');
  };

  const totalCount = previewQuery.data?.total ?? 0;
  const previewComments = previewQuery.data?.items ?? [];
  const isAdmin = user?.role === 'admin';

  // Modal data
  const modalComments = modalQuery.data?.items ?? [];
  const modalTotal = modalQuery.data?.total ?? 0;
  const totalPages = Math.ceil(modalTotal / PAGE_SIZE);
  const hasNext = modalTotal > (page + 1) * PAGE_SIZE;

  useEffect(() => {
    if (open) {
      setPage(0);
    }
  }, [open]);

  return (
    <>
      {/* Inline Preview on Homepage */}
      <div className="rounded-lg border border-app-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-app-card border-b border-app-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-app-gold" />
            <span className="text-sm font-medium text-foreground">讨论区</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalCount} 条讨论
          </span>
        </div>

        <div className="divide-y divide-app-border/40">
          {previewQuery.isLoading ? (
            <div className="px-4 py-4 text-center">
              <div className="animate-spin h-4 w-4 border-2 border-app-gold border-t-transparent rounded-full mx-auto" />
            </div>
          ) : previewComments.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-xs text-muted-foreground">还没有讨论，来说点什么吧</p>
            </div>
          ) : (
            previewComments.map((comment) => (
              <div key={comment.id} className="flex gap-2.5 px-4 py-2.5 group hover:bg-app-hover/50 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-app-gold/15 border border-app-gold/30 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-app-gold">
                    {comment.username.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium text-foreground">{comment.username}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(comment.createdAt)}</span>
                  </div>
                  {comment.replyTo && comment.replyToUsername && (
                    <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                      回复 <span className="text-app-gold">{comment.replyToUsername}</span>：{comment.replyToContent}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed break-words line-clamp-2">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show more button */}
        {totalCount > PREVIEW_COUNT && (
          <button
            onClick={() => setOpen(true)}
            className="w-full px-4 py-2.5 text-xs text-muted-foreground hover:text-app-gold hover:bg-app-hover/50 transition-colors border-t border-app-border/40"
          >
            查看更多 ({totalCount} 条)
          </button>
        )}

        {/* Quick reply button */}
        {isAuthenticated && previewComments.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="w-full px-4 py-2 text-xs text-app-gold hover:bg-app-gold/5 transition-colors border-t border-app-border/40"
          >
            参与讨论...
          </button>
        )}
      </div>

      {/* Full Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl bg-app-card border border-app-border shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-app-gold" />
                  <h2 className="text-lg font-bold text-app-gold">讨论区</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {modalQuery.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-5 w-5 border-2 border-app-gold border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : modalComments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">还没有讨论</p>
                  </div>
                ) : (
                  modalComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-app-gold/15 border border-app-gold/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-app-gold">
                          {comment.username.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{comment.username}</span>
                          <span className="text-[11px] text-muted-foreground">{formatTime(comment.createdAt)}</span>
                          {isAdmin && (
                            <button
                              onClick={() => {
                                if (confirm('确定删除？')) {
                                  deleteMutation.mutate({ id: comment.id });
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-app-red transition-all"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        {comment.replyTo && comment.replyToUsername && (
                          <div className="mb-1.5 pl-2 border-l-2 border-app-gold/30 rounded">
                            <p className="text-[11px] text-muted-foreground truncate">
                              回复 <span className="text-app-gold">{comment.replyToUsername}</span>：{comment.replyToContent}
                            </p>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleReply({ id: comment.id, username: comment.username, content: comment.content })}
                            className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-app-gold transition-colors"
                          >
                            <Reply className="h-3 w-3" />
                            回复
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {modalTotal > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-4 px-6 py-2 border-t border-app-border">
                  <button
                    onClick={goPrevPage}
                    disabled={page <= 0}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-app-gold transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3 w-3" />
                    上一页
                  </button>
                  <span className="text-xs text-muted-foreground">
                    第 {page + 1} / {totalPages || 1} 页
                  </span>
                  <button
                    onClick={goNextPage}
                    disabled={!hasNext}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-app-gold transition-colors disabled:opacity-30"
                  >
                    下一页
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="sticky bottom-0 border-t border-app-border bg-app-card px-6 py-3 flex-shrink-0">
                {replyTarget && (
                  <div className="flex items-center justify-between mb-2 px-2 py-1 rounded bg-app-gold/5 border border-app-gold/20">
                    <span className="text-[11px] text-app-gold truncate">
                      回复 {replyTarget.username}：{replyTarget.content.slice(0, 40)}
                    </span>
                    <button onClick={cancelReply} className="p-0.5 text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={replyTarget ? `回复 ${replyTarget.username}...` : '发表你的看法...'}
                      maxLength={300}
                      className="flex-1 bg-app-bg border border-app-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-app-gold/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || createMutation.isPending}
                      className="p-2 rounded-md bg-app-gold/10 text-app-gold hover:bg-app-gold/20 transition-colors disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">登录后即可参与讨论</p>
                )}
                {input.length > 0 && (
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{input.length}/300</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
