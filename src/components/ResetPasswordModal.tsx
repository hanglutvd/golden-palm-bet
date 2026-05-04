import { useState } from "react";
import { X, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
  token: string;
}

export function ResetPasswordModal({ open, onClose, onBackToLogin, token }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess("密码重置成功！请使用新密码登录。");
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
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

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6个字符");
      return;
    }

    resetMutation.mutate({ token, password });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-app-card border border-app-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-lg font-bold text-app-gold">重置密码</h2>
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
            <div className="flex items-center gap-2 rounded-lg bg-app-green/10 border border-app-green/20 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 text-app-green flex-shrink-0" />
              <span className="text-sm text-app-green">{success}</span>
            </div>
          )}

          {!success && (
            <>
              <p className="text-sm text-muted-foreground">
                请输入您的新密码。
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少6个字符"
                    required
                    minLength={6}
                    className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    required
                    className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetMutation.isPending}
                className="w-full rounded-md bg-app-gold py-2.5 text-sm font-medium text-white hover:bg-app-gold/80 transition-all disabled:opacity-50"
              >
                {resetMutation.isPending ? "处理中..." : "确认重置"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
