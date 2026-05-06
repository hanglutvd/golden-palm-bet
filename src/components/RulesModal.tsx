import { X, BookOpen, TrendingUp, DollarSign, Trophy, Wallet, Equal, Coins, Clock, CalendarCheck } from 'lucide-react';
import { GameCoin } from './GameCoin';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export function RulesModal({ open, onClose }: RulesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-app-gold" />
            <h2 className="text-lg font-bold text-app-gold">竞猜规则</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Welcome */}
          <div className="rounded-lg bg-app-bg/80 border border-app-border/60 p-4">
            <p className="text-sm text-foreground leading-relaxed">
              欢迎来到<strong className="text-app-gold">#戛纳竞猜平台</strong>！
            </p>
            <p className="text-sm text-foreground leading-relaxed mt-2">
              游戏的目标是押注第79届戛纳电影节主竞赛单元的入围影片，像在股市中一样买入和卖出电影"股份"。
            </p>
          </div>

          {/* Capital Rule */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <Wallet className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">注册本金</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Coins className="h-4 w-4 text-app-green" />
                <span className="text-sm text-foreground">注册成功即可获得虚拟本金</span>
                <span className="text-sm font-bold tabular-nums text-app-gold"><GameCoin amount={3000} /></span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Equal className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">所有电影初始统一价格</span>
                <span className="text-sm font-bold tabular-nums text-app-gold"><GameCoin amount={100} /></span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  本金 3,000，每股 100，交易时段 09:00-12:00 / 15:00-18:00（北京时间）。请谨慎决策——All in 搏大奖还是分散押注降低风险？
                </p>
              </div>
            </div>
          </div>

          {/* Rule 1: Trading Hours */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <Clock className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">交易时间</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-app-green" />
                <span className="text-sm text-foreground">每日交易时段</span>
                <span className="text-sm font-bold tabular-nums text-app-green">09:00-12:00 / 15:00-18:00</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <CalendarCheck className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">价格更新时间</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">09:00 / 15:00 开盘</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  交易时段内可自由买入/卖出，价格保持不变。次日开盘时根据当日净成交量统一调整开盘价。
                </p>
              </div>
            </div>
          </div>

          {/* Rule 2: Price Mechanism */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-app-green" />
              <h3 className="text-sm font-semibold text-foreground">每日行情交易</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              每部电影的价格每时段更新一次。交易时段内买入/卖出仅改变您的持仓与余额，不影响实时价格。系统会在 12:00 和 18:00 收盘时，根据本时段净成交量（买入股数 − 卖出股数）统一调整下一时段开盘价——每净买入 1 股价格 +0.2%，每净卖出 1 股价格 −0.2%。
            </p>
          </div>

          {/* Rule 3: Dividends */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">最终分红机制</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              除了日常交易积累财富外，您最终必须尽可能多地持有获奖影片的股份。电影节闭幕时，获奖影片将为其股东发放丰厚分红；未获奖的影片则一文不值，无法带来任何收益。
            </p>
          </div>

          {/* Rule 4: Dividend Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">分红标准</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              获奖影片的分红标准如下。请注意，金棕榈奖的分红远高于其他奖项——这意味着押中金棕榈热门影片将带来巨大的回报。
            </p>
          </div>

          {/* Dividend Table */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="grid grid-cols-[1fr,auto] gap-4 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                奖项
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">
                每股分红
              </span>
            </div>
            <div className="divide-y divide-app-border/60">
              {[
                { name: '金棕榈奖', dividend: 500.00, highlight: true },
                { name: '评审团大奖', dividend: 200.00, highlight: false },
                { name: '最佳导演', dividend: 150.00, highlight: false },
                { name: '最佳男演员 / 最佳女演员', dividend: 100.00, highlight: false },
                { name: '最佳编剧', dividend: 100.00, highlight: false },
                { name: '评审团奖', dividend: 100.00, highlight: false },
                { name: '特别奖（若有）', dividend: 50.00, highlight: false },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[1fr,auto] gap-4 items-center px-4 py-2.5 ${
                    item.highlight ? 'bg-app-gold/5' : ''
                  }`}
                >
                  <span className={`text-sm ${item.highlight ? 'font-semibold text-app-gold' : 'text-foreground'}`}>
                    {item.name}
                  </span>
                  <span className={`text-sm font-semibold tabular-nums text-right ${
                    item.highlight ? 'text-app-gold' : 'text-foreground'
                  }`}>
                    {item.dividend.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-app-gold/5 border border-app-gold/20 p-4">
            <p className="text-sm text-app-gold leading-relaxed">
              <strong>策略提示：</strong>本金 3,000，每股 100，交易时段 09:00-12:00 / 15:00-18:00。每部电影每个时段限交易一次（上午一次 + 下午一次），每人每部电影最多持有 20 股。明智的玩家会把握交易窗口集中押注金棕榈热门博取最高回报，或分散押注多部影片降低风险。每个交易时段内价格锁定，您可以在观察市场动向后再决定是否出手。密切关注每日分析文章和口碑走势，在预期上涨前买入、预期下跌前卖出，同时保留部分股份等待最终颁奖结果获取分红。祝你好运！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
