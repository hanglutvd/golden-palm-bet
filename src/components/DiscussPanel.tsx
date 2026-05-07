import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

interface Comment {
  id: number;
  username: string;
  content: string;
  createdAt: string;
}

const sampleComments: Comment[] = [
  {
    id: 1,
    username: '电影爱好者',
    content: '我觉得《盒子里的羊》是枝裕和这次可能又会打动评审团',
    createdAt: '2026-05-07 14:30',
  },
  {
    id: 2,
    username: '戛纳老粉',
    content: '阿莫多瓦的《苦涩的圣诞节》题材很有趣，期待首映',
    createdAt: '2026-05-07 12:15',
  },
  {
    id: 3,
    username: 'NewWave',
    content: '滨口龙介《突如其来》已经买入20股，看好！',
    createdAt: '2026-05-07 10:22',
  },
];

export function DiscussPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { isAuthenticated } = useAuth();

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
          <span className="text-xs text-muted-foreground">{sampleComments.length}条讨论</span>
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
                {sampleComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-app-gold/15 border border-app-gold/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-app-gold">
                        {comment.username.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{comment.username}</span>
                        <span className="text-[11px] text-muted-foreground">{comment.createdAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {/* Placeholder for more */}
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">更多讨论即将开放</p>
                </div>
              </div>

              {/* Input Area */}
              <div className="sticky bottom-0 border-t border-app-border bg-app-card px-6 py-3 flex-shrink-0">
                {isAuthenticated ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="发表你的看法..."
                      maxLength={300}
                      className="flex-1 bg-app-bg border border-app-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-app-gold/50"
                    />
                    <button
                      className="p-2 rounded-md bg-app-gold/10 text-app-gold hover:bg-app-gold/20 transition-colors"
                      title="发送"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">登录后即可参与讨论</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
