import { useState } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/providers/trpc';

export function DiscussPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { isAuthenticated, user } = useAuth();

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.comment.list.useQuery(
    { limit: 50, offset: 0 },
    { enabled: open }
  );

  const createMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setInput('');
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
    createMutation.mutate({ content: input.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  const totalCount = data?.total ?? 0;
  const comments = data?.items ?? [];
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Collapsed Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-app-card border border-app-border hover:bg-app-hover transition-colors group"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-app-gold" />
          <span className="text-sm font-medium text-foreground">讨论区</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{totalCount}条讨论</span>
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
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-5 w-5 border-2 border-app-gold border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">还没有讨论，来说点什么吧</p>
                  </div>
                ) : (
                  comments.map((comment) => (
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
                                if (confirm('确定删除这条评论？')) {
                                  deleteMutation.mutate({ id: comment.id });
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-app-red transition-all"
                              title="删除"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed break-words">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="sticky bottom-0 border-t border-app-border bg-app-card px-6 py-3 flex-shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="发表你的看法..."
                      maxLength={300}
                      className="flex-1 bg-app-bg border border-app-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-app-gold/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || createMutation.isPending}
                      className="p-2 rounded-md bg-app-gold/10 text-app-gold hover:bg-app-gold/20 transition-colors disabled:opacity-50"
                      title="发送"
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
