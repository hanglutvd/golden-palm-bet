import { useState } from "react";
import { X, Mail, User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onForgotPassword?: () => void;
}

export function AuthModal({ open, onClose, onForgotPassword }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, register, isLoading } = useAuth();

  if (!open) return null;

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setIdentifier("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
        setError("请填写所有字段");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
      }
      if (password.length < 6) {
        setError("密码至少6个字符");
        return;
      }
      if (username.length < 2 || username.length > 50) {
        setError("用户名过长（最多6个中文或12个英文）");
        return;
      }
      console.log("[AuthModal] Calling register with:", { email: email.trim(), username: username.trim() });
      try {
        await register({ email: email.trim(), username: username.trim(), password });
        console.log("[AuthModal] Register success");
        setSuccess("注册成功！");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1200);
      } catch (err: any) {
        console.error("[AuthModal] Register error:", err);
        setError(err.message || "注册失败");
      }
    } else {
      if (!identifier.trim() || !password.trim()) {
        setError("请填写所有字段");
        return;
      }
      try {
        await login({ identifier: identifier.trim(), password });
        setSuccess("登录成功！");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } catch (err: any) {
        setError(err.message || "登录失败");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-xl bg-app-card border border-app-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-lg font-bold text-app-gold">
            {mode === "login" ? "登录" : "注册"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-app-border">
          <button
            onClick={() => switchMode("login")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors duration-200 ${
              mode === "login"
                ? "text-app-gold border-b-2 border-app-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            登录
          </button>
          <button
            onClick={() => switchMode("register")}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors duration-200 ${
              mode === "register"
                ? "text-app-gold border-b-2 border-app-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            注册
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4">
          {/* Error / Success messages */}
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

          {/* Register fields */}
          {mode === "register" && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">用户名（昵称）</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="设置一个昵称"
                    className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  最多6个中文或12个英文，混排自动计算
                </p>
              </div>
            </>
          )}

          {/* Login field */}
          {mode === "login" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">邮箱或用户名</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="邮箱或用户名"
                  className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6个字符"
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

          {/* Confirm password (register only) */}
          {mode === "register" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">确认密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  className="w-full rounded-md border border-app-border bg-app-bg px-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-app-gold focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-app-gold py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-app-gold/80 hover:shadow-[0_2px_8px_rgba(201,168,76,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>

          {/* Forgot password */}
          {mode === "login" && onForgotPassword && (
            <div className="text-center -mt-2">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs text-muted-foreground hover:text-app-gold transition-colors"
              >
                忘记密码？
              </button>
            </div>
          )}
        </form>

        {/* Footer hint */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-muted-foreground">
            {mode === "login" ? (
              <>
                还没有账号？{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="text-app-gold hover:underline"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="text-app-gold hover:underline"
                >
                  直接登录
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
