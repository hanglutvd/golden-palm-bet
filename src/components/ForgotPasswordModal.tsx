import { useState } from "react";
import { X, Mail, ArrowLeft, AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  onGoToReset: (token: string) => void;
}

export function ForgotPasswordModal({ open, onClose, onBackToLogin, onGoToReset }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      if (data.token) {
        // Email not configured, token returned for manual reset
        setSuccess("邮件服务暂未配置，已生成重置令牌。点击下方按钮直接重置密码。");
      } else {
        // Real email sent
        setSuccess(data.message);
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email.trim()) return;
    forgotMutation.mutate({ email: email.trim() });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-app-card border border-app-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <button onClick={onBackToLogin} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-app-gold">找回密码</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-app-red/10 border border-app-red/20 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-app-red flex-shrink-0" />
              <span className="text-sm text-app-red">{error}</span>
            </div>
          )}
          {success && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-app-green/10 border border-app-green/20 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-app-green flex-shrink-0" />
                <span className="text-sm text-app-green">{success}</span>
              </div>
              {forgotMutation.data?.token && (
                <button
                  type="button"
                  onClick={() => onGoToReset(forgotMutation.data.token)}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-app-gold py-2.5 text-sm font-medium text-white hover:bg-app-gold/80 transition-colors"
                >
                  <KeyRound className="h-4 w-4" />
                  前往重置密码
                </button>
              )}
            </div>
          )}

          {!success && (
            <>
              <p className="text-sm text-muted-foreground">
                请输入注册时使用的邮箱地址，我们将为您生成密码重置链接。
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full rounded-md bg-app-gold py-2.5 text-sm font-medium text-white hover:bg-app-gold/80 transition-all disabled:opacity-50"
              >
                {forgotMutation.isPending ? "处理中..." : "发送重置链接"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
