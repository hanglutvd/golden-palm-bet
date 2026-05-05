import { useState } from 'react';
import { Menu, X, LogOut, User, Shield, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from './GameCoin';

interface HeaderProps {
  onOpenRules: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
  onOpenMarket: () => void;
  onOpenPrizes: () => void;
  onOpenPortfolio?: () => void;
  onEnterAdmin: () => void;
  onOpenShare: () => void;
}

export function Header({ onOpenRules, onOpenAuth, onOpenLeaderboard, onOpenMarket, onOpenPrizes, onOpenPortfolio, onEnterAdmin, onOpenShare }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: '竞猜规则', href: '#', onClick: onOpenRules, highlight: true },
    { label: '行情中心', href: '#', onClick: onOpenMarket },
    { label: '排行榜', href: '#', onClick: onOpenLeaderboard },
    { label: '奖品池', href: '#', onClick: onOpenPrizes },
    ...(isAuthenticated ? [{ label: '我的持仓', href: '#', onClick: onOpenPortfolio }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-app-border bg-app-card header-gold-strip">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="https://i.imgs.ovh/2026/05/05/2cac6253d3fed931741b9c887cee2343.png"
            alt="金棕榈"
            className="h-8 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span
              className="text-xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #d4a853 0%, #f0d78c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              金棕榈
            </span>
            <span className="text-[11px] text-muted-foreground leading-none">
              竞猜
            </span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className={`text-sm font-medium transition-colors duration-150 cursor-pointer ${
                'highlight' in item && item.highlight
                  ? 'text-app-gold hover:text-app-gold px-3 py-1 rounded-md bg-app-gold/10 border border-app-gold/20'
                  : 'text-muted-foreground hover:text-app-gold'
              }`}
            >
              {item.label}
            </a>
          ))}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Share button */}
              <button
                onClick={onOpenShare}
                className="flex items-center gap-1 rounded-md border border-app-gold/20 px-2.5 py-1 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                分享
              </button>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <User className="h-4 w-4 text-app-gold" />
                  <span className="font-medium">{user.username}</span>
                </div>
                <span className="text-xs text-app-gold tabular-nums">
                  <GameCoin amount={user.balance} />
                </span>
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={onEnterAdmin}
                  className="flex items-center gap-1 rounded-md border border-app-gold/30 px-2.5 py-1 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  后台
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1 rounded-md border border-app-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-app-red hover:border-app-red"
              >
                <LogOut className="h-3.5 w-3.5" />
                退出
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenShare}
                className="flex items-center gap-1 rounded-md border border-app-gold/20 px-2.5 py-1.5 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                分享
              </button>
              <button
                onClick={onOpenAuth}
                className="rounded-md bg-app-gold px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-app-gold/80 hover:shadow-[0_2px_8px_rgba(201,168,76,0.3)]"
              >
                登录
              </button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-app-border bg-app-card px-4 py-3">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setMobileMenuOpen(false);
                }}
                className={`text-sm font-medium transition-colors duration-150 ${
                  'highlight' in item && item.highlight
                    ? 'text-app-gold font-bold'
                    : 'text-muted-foreground hover:text-app-gold'
                }`}
              >
                {item.label}
              </a>
            ))}
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-app-border">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <User className="h-4 w-4 text-app-gold" />
                  <span className="font-medium">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="text-xs text-app-gold">(管理员)</span>
                  )}
                </div>
                {/* Mobile share button */}
                <button
                  onClick={() => {
                    onOpenShare();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 rounded-md border border-app-gold/20 px-3 py-2 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors w-fit"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  分享给好友
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      onEnterAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 rounded-md border border-app-gold/30 px-3 py-2 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors w-fit"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    进入后台
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 rounded-md border border-app-border px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-200 hover:text-app-red hover:border-app-red w-fit"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  退出
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-app-border">
                <button
                  onClick={() => {
                    onOpenShare();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 rounded-md border border-app-gold/20 px-3 py-2 text-xs font-medium text-app-gold hover:bg-app-gold/10 transition-colors w-fit"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  分享给好友
                </button>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="mt-1 w-full rounded-md bg-app-gold px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-app-gold/80"
                >
                  登录
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
