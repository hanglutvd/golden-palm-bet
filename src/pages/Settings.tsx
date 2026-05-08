import { useState } from 'react';
import { User, Lock, Save, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from '@/components/GameCoin';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const utils = trpc.useUtils();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      setError('');
      utils.auth.me.invalidate();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message || '修改失败');
      setSuccess('');
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      setError('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => {
      setError(err.message || '修改失败');
      setSuccess('');
    },
  });

  const handleUpdateProfile = () => {
    if (!username.trim()) {
      setError('昵称不能为空');
      return;
    }
    if (username.trim() === user?.username) {
      setError('新昵称不能与当前昵称相同');
      return;
    }
    updateProfileMutation.mutate({ username: username.trim() });
  };

  const handleChangePassword = () => {
    if (!oldPassword) {
      setError('请输入原密码');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码至少6个字符');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    changePasswordMutation.mutate({
      oldPassword,
      newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-app-border bg-[#141428]/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-foreground">个人设置</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <div className="rounded-lg bg-app-card border border-app-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-app-gold/10 flex items-center justify-center">
              <User className="h-6 w-6 text-app-gold" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>角色：{user?.role === 'admin' ? '管理员' : '用户'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-app-border">
          <button
            onClick={() => { setActiveTab('profile'); setError(''); setSuccess(''); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'profile'
                ? 'text-app-gold border-app-gold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            修改昵称
          </button>
          <button
            onClick={() => { setActiveTab('password'); setError(''); setSuccess(''); }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === 'password'
                ? 'text-app-gold border-app-gold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            修改密码
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-app-red/10 border border-app-red/20 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 text-app-red flex-shrink-0" />
            <p className="text-sm text-app-red">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-app-green/10 border border-app-green/20 px-3 py-2.5">
            <CheckCircle className="h-4 w-4 text-app-green flex-shrink-0" />
            <p className="text-sm text-app-green">{success}</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="rounded-lg bg-app-card border border-app-border p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <User className="h-4 w-4 text-app-gold" />
                新昵称
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入新昵称（最多6中文或12英文）"
                disabled={(() => {
                  if (!user?.usernameChangedAt) return false;
                  const lastChange = new Date(user.usernameChangedAt).getTime();
                  const daysSince = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
                  return daysSince < 30;
                })()}
                className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2.5 text-sm text-foreground focus:border-app-gold focus:outline-none transition-colors disabled:opacity-50"
              />
              {(() => {
                if (!user?.usernameChangedAt) return null;
                const lastChange = new Date(user.usernameChangedAt).getTime();
                const daysSince = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
                const daysRemaining = Math.ceil(30 - daysSince);
                if (daysSince < 30) {
                  return (
                    <p className="text-xs text-muted-foreground">
                      昵称每30天可修改一次，还需等待 <span className="text-app-gold font-medium">{daysRemaining}</span> 天
                    </p>
                  );
                }
                return null;
              })()}
            </div>
            <button
              onClick={handleUpdateProfile}
              disabled={updateProfileMutation.isPending || (() => {
                if (!user?.usernameChangedAt) return false;
                const lastChange = new Date(user.usernameChangedAt).getTime();
                const daysSince = (Date.now() - lastChange) / (1000 * 60 * 60 * 24);
                return daysSince < 30;
              })()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateProfileMutation.isPending ? '保存中...' : '保存修改'}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="rounded-lg bg-app-card border border-app-border p-5 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-app-gold" />
                原密码
              </label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="输入当前密码"
                className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2.5 text-sm text-foreground focus:border-app-gold focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-app-gold" />
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="至少6个字符"
                className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2.5 text-sm text-foreground focus:border-app-gold focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-app-gold" />
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
                className="w-full rounded-md border border-app-border bg-app-bg px-3 py-2.5 text-sm text-foreground focus:border-app-gold focus:outline-none transition-colors"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {changePasswordMutation.isPending ? '修改中...' : '修改密码'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
