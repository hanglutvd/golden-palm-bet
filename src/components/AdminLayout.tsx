import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
  LayoutDashboard, Film, Trophy, BookOpen, Users, ArrowLeft, Shield, BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const menuItems = [
  { label: '概览', path: '/admin', icon: LayoutDashboard },
  { label: '电影管理', path: '/admin/movies', icon: Film },
  { label: '开奖管理', path: '/admin/awards', icon: Trophy },
  { label: '每日分析', path: '/admin/diaries', icon: BookOpen },
  { label: '用户管理', path: '/admin/users', icon: Users },
  { label: '行情图片', path: '/admin/market-image', icon: BarChart3 },
];

export function AdminLayout() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, user, navigate]);

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

  return (
    <div className="min-h-screen bg-app-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-app-card border-r border-app-border flex-shrink-0">
        {/* Header */}
        <div className="px-4 py-4 border-b border-app-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-app-gold" />
            <span className="text-sm font-bold text-app-gold">管理后台</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user?.username || '预览模式'}</p>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-app-gold/10 text-app-gold font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-app-hover'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to site */}
        <div className="absolute bottom-0 left-0 w-56 p-2 border-t border-app-border bg-app-card">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回网站
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
