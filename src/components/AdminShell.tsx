import { useState, useEffect } from 'react';
import { LayoutDashboard, Film, Trophy, Users, ArrowLeft, Shield, BarChart3, Menu, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, slide-in when open */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-app-card border-r border-app-border flex-shrink-0 transform transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b border-app-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-app-gold" />
            <span className="text-sm font-bold text-app-gold">管理后台</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-4 py-2 text-xs text-muted-foreground border-b border-app-border">{user?.username}</p>

        {/* Nav */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveKey(item.key);
                  setMobileMenuOpen(false);
                }}
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
        <div className="absolute bottom-0 left-0 w-full p-2 border-t border-app-border bg-app-card">
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
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Shield className="h-4 w-4 text-app-gold" />
          <span className="text-sm font-bold text-app-gold">管理后台</span>
        </div>

        <div className="p-4 lg:p-6">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
