import { Shield, Ban, UserX } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-app-border bg-app-card mt-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-6 py-5">
        {/* Legal Statements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Personal Information Protection */}
          <div className="flex items-start gap-2.5 rounded-lg bg-app-bg/60 border border-app-border/40 px-3 py-2.5">
            <Shield className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">个人信息保护</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                本网站严格遵守《个人信息保护法》，仅收集必要的注册信息（邮箱、昵称），不会向第三方泄露或出售您的个人数据。
              </p>
            </div>
          </div>

          {/* Minor Protection */}
          <div className="flex items-start gap-2.5 rounded-lg bg-app-bg/60 border border-app-border/40 px-3 py-2.5">
            <UserX className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">未成年人保护</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                本网站严格遵守《未成年人保护法》，不建议未满18周岁的未成年人参与。本平台为电影节竞猜游戏，不构成任何形式的赌博或投资建议。
              </p>
            </div>
          </div>

          {/* No Real Money */}
          <div className="flex items-start gap-2.5 rounded-lg bg-app-bg/60 border border-app-border/40 px-3 py-2.5">
            <Ban className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-foreground">虚拟货币声明</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                本网站所有交易均使用虚拟货币（游戏币），不涉及任何真实货币交易。游戏币不可兑换、不可提现，仅用于平台内的竞猜娱乐。
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-app-border/40 pt-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs text-muted-foreground">
              金棕榈竞猜是一个非官方的竞猜游戏平台，与戛纳电影节组委会无直接关联。
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 金棕榈竞猜 · 设计与开发：陀螺电影Toroscope
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
