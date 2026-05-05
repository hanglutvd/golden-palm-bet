import { Users, Shield, ShieldOff } from 'lucide-react';
import { trpc } from '@/providers/trpc';
import { GameCoin } from '@/components/GameCoin';

export function AdminUsers() {
  const { data: userList } = trpc.admin.users.useQuery();
  const utils = trpc.useUtils();

  const setAdminMutation = trpc.admin.setAdmin.useMutation({
    onSuccess: () => utils.admin.users.invalidate(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">用户管理</h1>

      <div className="rounded-lg bg-app-card border border-app-border overflow-x-auto">
        <div className="min-w-[600px]">
        <div className="grid grid-cols-[auto,1fr,1fr,auto,auto,auto] gap-3 px-4 py-2.5 border-b border-app-border bg-app-bg/60">
          <span className="text-xs font-semibold uppercase text-muted-foreground w-8">ID</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">用户名</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">邮箱</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">资产</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-center">角色</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">操作</span>
        </div>
        <div className="divide-y divide-app-border/40">
          {userList?.map((u) => (
            <div key={u.id} className="grid grid-cols-[auto,1fr,1fr,auto,auto,auto] gap-3 items-center px-4 py-3">
              <span className="text-xs text-muted-foreground w-8">{u.id}</span>
              <span className="text-sm text-foreground">{u.username}</span>
              <span className="text-xs text-muted-foreground">{u.email}</span>
              <span className="text-sm font-semibold tabular-nums text-app-gold text-right">
                <GameCoin amount={u.balance} />
              </span>
              <div className="flex justify-center">
                {u.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-xs text-app-gold font-medium">
                    <Shield className="h-3.5 w-3.5" />
                    管理员
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    用户
                  </span>
                )}
              </div>
              <div className="text-right">
                <button
                  onClick={() => {
                    const newRole = u.role === 'admin' ? 'user' : 'admin';
                    setAdminMutation.mutate({ userId: u.id, role: newRole as 'user' | 'admin' });
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    u.role === 'admin'
                      ? 'text-app-red hover:bg-app-red/10'
                      : 'text-app-gold hover:bg-app-gold/10'
                  }`}
                >
                  {u.role === 'admin' ? (
                    <>
                      <ShieldOff className="h-3 w-3" />
                      取消
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3" />
                      设为管理员
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
          {!userList?.length && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              暂无用户
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
