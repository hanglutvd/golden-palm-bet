import { useState, useEffect } from 'react';
import { LayoutDashboard, Film, Trophy, Users, ArrowLeft, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminMovies } from '@/pages/AdminMovies';
import { AdminAwards } from '@/pages/AdminAwards';
import { AdminUsers } from '@/pages/AdminUsers';
import { AdminMarketImage } from '@/pages/AdminMarketImage';

const menuItems = [
  { label: '概览', key: 'dashboard', icon: LayoutDashboard, component: AdminDashboard },
  { label: '电影管理', key: 'movies', icon: Film, component: AdminMovies },
  { label: '开奖管理', key: 'awards', icon: Trophy, component: AdminAwards },
  { label: '用户管理', key: 'users', icon: Users, component: AdminUsers },
  { label: '行情图片', key: 'market-image', icon: BarChart3, component: AdminMarketImage },
];

interface AdminShellProps {
  onExit: () => void;
}

export function AdminShell({ onExit }: AdminShellProps) {
  const [activeKey, setActiveKey] = useState('dashboard');
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      onExit();
    }
  }, [isLoading, isAuthenticated, user, onExit]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const activeItem = menuItems.find((m) => m.key === activeKey);
  const ActiveComponent = activeItem?.component || AdminDashboard;

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-app-card border-r border-app-border flex-shrink-0 relative">
        {/* Header */}
        <div className="px-4 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-app-gold" />
            <span className="text-sm font-bold text-app-gold">管理后台</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user?.username}</p>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveKey(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-app-gold/10 text-app-gold font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-app-hover'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-0 left-0 w-56 p-2 border-t border-app-border bg-app-card">
          <button
            onClick={onExit}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors text-left"
          >
            <ArrowLeft className="h-4 w-4" />
            返回网站
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
