import { X, BookOpen, TrendingUp, DollarSign, Trophy, Wallet, Equal, Coins, Clock, CalendarCheck, Flame, Lock, Rocket } from 'lucide-react';
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
            <h2 className="text-lg font-bold text-app-gold">交易规则</h2>
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
              欢迎来到<strong className="text-app-gold">#戛纳主竞赛股市</strong>！
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
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <DollarSign className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">每人每部电影持股上限</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">20股</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  本金3,000，每股100，请谨慎决策——All in搏大奖还是分散押注降低风险？
                </p>
              </div>
            </div>
          </div>

          {/* Rule 0: Pre-Launch Period */}
          <div className="rounded-lg border border-app-red/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-red/10 border-b border-app-red/20">
              <Flame className="h-4 w-4 text-app-red" />
              <h3 className="text-sm font-semibold text-app-red">预热期（5月11日 ~ 5月13日 00:00）</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Flame className="h-4 w-4 text-app-red" />
                <span className="text-sm text-foreground">交易次数限制</span>
                <span className="text-sm font-bold tabular-nums text-app-red">不限次数</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Equal className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">电影价格</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">锁定 100 不变</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">涨跌幅显示</span>
                <span className="text-sm font-bold tabular-nums text-muted-foreground">不展现</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  预热期可自由交易，不限次数，价格始终锁定为100。您的交易会被记录（净成交量持续累积），但不会结算或展现涨跌幅。所有预热期的交易将在5月13日09:00首次开盘时一次性结算。
                </p>
              </div>
            </div>
          </div>

          {/* Lock Period */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">休市锁定（5月13日 00:00 ~ 09:00）</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">交易状态</span>
                <span className="text-sm font-bold tabular-nums text-muted-foreground">暂停交易</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  5月13日00:00至09:00为休市锁定时段，无法买入或卖出。请耐心等待09:00正式开盘。
                </p>
              </div>
            </div>
          </div>

          {/* Official Launch */}
          <div className="rounded-lg border border-app-gold/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-gold/10 border-b border-app-gold/20">
              <Rocket className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-app-gold">正式上线（5月13日 09:00 起）</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <Rocket className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">首次开盘结算</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">09:00</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-app-red" />
                <span className="text-sm text-foreground">每日交易时段（北京时间）</span>
                <span className="text-sm font-bold tabular-nums text-app-red">09:00-12:00 / 15:00-18:00</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <CalendarCheck className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">价格结算频率</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">每10分钟</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <DollarSign className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">每时段每部电影交易</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">限1次</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  5月13日09:00首次开盘时，系统将根据预热期累积的净成交量一次性调整所有电影价格并展现涨跌幅。此后进入正常交易模式：每天09:00-12:00和15:00-18:00两个交易时段，每10分钟根据净成交量结算一次价格。每个时段每部电影只能买入**或**卖出一次，不能同时买和卖。
                </p>
              </div>
            </div>
          </div>

          {/* Rule 1: Trading Hours */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <Clock className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">正常交易时间</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-app-red" />
                <span className="text-sm text-foreground">每日交易时段（北京时间）</span>
                <span className="text-sm font-bold tabular-nums text-app-red">09:00-12:00 / 15:00-18:00</span>
              </div>
              <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-center px-4 py-2.5">
                <CalendarCheck className="h-4 w-4 text-app-gold" />
                <span className="text-sm text-foreground">价格结算频率</span>
                <span className="text-sm font-bold tabular-nums text-app-gold">每10分钟</span>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  上午12:00收盘后调整下午15:00开盘价，下午18:00收盘后调整次日09:00开盘价。
                </p>
              </div>
            </div>
          </div>

          {/* Rule 2: Price Mechanism */}
          <div className="rounded-lg border border-app-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-app-bg/60 border-b border-app-border">
              <TrendingUp className="h-4 w-4 text-app-red" />
              <h3 className="text-sm font-semibold text-foreground">价格机制</h3>
            </div>
            <div className="divide-y divide-app-border/60">
              <div className="px-4 py-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  交易时段内价格锁定不变，买入/卖出仅改变您的持仓与余额。每10分钟根据该时段累计净成交量统一调整下一时段开盘价。涨跌幅反映从上一次结算价到当前的变化。
                </p>
              </div>
            </div>
          </div>

          {/* Rule 4: Dividends */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">最终分红机制</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              除了日常交易积累财富外，您最终必须尽可能多地持有获奖影片的股份。电影节闭幕时，获奖影片将为其股东发放丰厚分红；未获奖的影片则一文不值，无法带来任何收益。
            </p>
          </div>

          {/* Rule 5: Dividend Table */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-app-gold" />
              <h3 className="text-sm font-semibold text-foreground">分红标准</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
              获奖影片的分红标准如下。金棕榈奖每股分红5000，评审团大奖3000，最佳导演2500，其他奖项2000-1500。押中任意奖项都有丰厚回报，分散押注多部影片是稳健策略。
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
                { name: '金棕榈奖', dividend: 5000.00, highlight: true },
                { name: '评审团大奖', dividend: 3000.00, highlight: false },
                { name: '最佳导演', dividend: 2500.00, highlight: false },
                { name: '最佳男演员', dividend: 2000.00, highlight: false },
                { name: '最佳女演员', dividend: 2000.00, highlight: false },
                { name: '最佳编剧', dividend: 2000.00, highlight: false },
                { name: '评审团奖', dividend: 2000.00, highlight: false },
                { name: '特别奖（若有）', dividend: 1500.00, highlight: false },
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
              <strong>预热期策略提示：</strong>预热期可自由交易不限次数，价格锁定100。这是布局的好机会——您可以不受限制地调整持仓，为5月13日09:00正式开盘做准备。建议提前研究入围影片，分散押注多部热门影片降低风险，同时重点持有金棕榈大热门等待最终分红。开盘首日将根据预热期累积的净成交量一次性调整价格，您的持仓将在那一刻开始浮动。祝你好运！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
