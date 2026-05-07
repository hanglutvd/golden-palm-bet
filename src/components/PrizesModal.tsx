import { X, Trophy, Wine, Mail, Crown, Gift, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrizesModalProps {
  open: boolean;
  onClose: () => void;
}

const prizeTiers = [
  {
    rank: '冠军',
    rankNum: 1,
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    gradient: 'from-yellow-400/20 via-yellow-400/5 to-transparent',
    prizes: [
      { icon: Gift, text: '戛纳终极周边大礼包（含独家纪念品）' },
      { icon: Wine, text: 'Lazy酒吧葡萄酒套装（三瓶）' },
      { icon: Mail, text: '戛纳电影节官方明信片' },
    ],
  },
  {
    rank: '亚军',
    rankNum: 2,
    icon: Trophy,
    color: 'text-gray-300',
    bgColor: 'bg-gray-300/10',
    borderColor: 'border-gray-300/30',
    gradient: 'from-gray-300/20 via-gray-300/5 to-transparent',
    prizes: [
      { icon: Gift, text: '戛纳精选周边大礼包' },
      { icon: Wine, text: 'Lazy酒吧葡萄酒套装（三瓶）' },
      { icon: Mail, text: '戛纳电影节官方明信片' },
    ],
  },
  {
    rank: '季军',
    rankNum: 3,
    icon: Trophy,
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    borderColor: 'border-amber-600/30',
    gradient: 'from-amber-600/20 via-amber-600/5 to-transparent',
    prizes: [
      { icon: Gift, text: '戛纳周边礼包' },
      { icon: Wine, text: 'Lazy酒吧葡萄酒套装（三瓶）' },
      { icon: Mail, text: '戛纳电影节官方明信片' },
    ],
  },
  {
    rank: '第 4-5 名',
    rankNum: 4,
    icon: Star,
    color: 'text-app-gold',
    bgColor: 'bg-app-gold/10',
    borderColor: 'border-app-gold/20',
    gradient: 'from-app-gold/10 to-transparent',
    prizes: [
      { icon: Wine, text: 'Lazy酒吧葡萄酒套装（三瓶）' },
      { icon: Mail, text: '戛纳电影节官方明信片' },
    ],
  },
  {
    rank: '第 6-10 名',
    rankNum: 6,
    icon: Mail,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    gradient: 'from-emerald-400/10 to-transparent',
    prizes: [
      { icon: Mail, text: '戛纳电影节官方明信片' },
    ],
  },
];

export function PrizesModal({ open, onClose }: PrizesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-app-gold" />
            <div>
              <h2 className="text-lg font-bold text-app-gold">奖品池</h2>
              <p className="text-xs text-muted-foreground">电影节结束后，财富排行前列的玩家将获得以下奖品</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Intro */}
          <div className="rounded-lg bg-app-gold/5 border border-app-gold/20 px-4 py-3">
            <p className="text-sm text-app-gold leading-relaxed">
              电影节闭幕、获奖名单公布且所有分红结算完成后，系统将锁定最终排名。排名依据为玩家的总资产（账户余额 + 持仓市值）。排名前10的玩家均可获得奖品，奖品由陀螺电影Toroscope和北京Lazy酒吧联合提供。
            </p>
          </div>

          {/* Prize Tiers */}
          {prizeTiers.map((tier, idx) => {
            const RankIcon = tier.icon;
            return (
              <div
                key={idx}
                className={`rounded-lg border ${tier.borderColor} ${tier.bgColor} overflow-hidden`}
              >
                <div className={`bg-gradient-to-r ${tier.gradient} px-4 py-3 flex items-center gap-3`}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-app-card border ${tier.borderColor}`}>
                    <RankIcon className={`h-4 w-4 ${tier.color}`} />
                  </div>
                  <div>
                    <span className={`text-sm font-bold ${tier.color}`}>{tier.rank}</span>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {tier.prizes.map((prize, pIdx) => {
                    const PrizeIcon = prize.icon;
                    return (
                      <div key={pIdx} className="flex items-start gap-2.5">
                        <PrizeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-relaxed">{prize.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Note */}
          <div className="flex items-start gap-2 rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5">
            <Star className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-app-gold leading-relaxed">
              最终排名以系统结算后数据为准。奖品将在排名确认后的15个工作日内寄出。如遇特殊情况（如物流限制），主办方保留更换等值奖品的权利。
            </p>
          </div>

          {/* Prize Image - Cannes Merch */}
          <div className="rounded-lg overflow-hidden border border-app-border">
            <img
              src="https://i.imgs.ovh/2026/05/06/c8ac39c3dfa6d790f2c691472aac64e3.png"
              alt="戛纳电影节官方周边"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="px-3 py-2 bg-app-bg border-t border-app-border">
              <p className="text-xs text-muted-foreground text-center">戛纳电影节官方周边</p>
            </div>
          </div>

          {/* Prize Image - Wine */}
          <div className="rounded-lg overflow-hidden border border-app-border">
            <img
              src="https://i.imgs.ovh/2026/05/06/99a528d1115dcf2d2d640d54c82237ff.jpg"
              alt="Lazy酒吧葡萄酒套装（三瓶）"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="px-3 py-2 bg-app-bg border-t border-app-border">
              <p className="text-xs text-muted-foreground text-center">Lazy酒吧葡萄酒套装（三瓶）- 第1至5名均可获得</p>
            </div>
          </div>

          {/* Sponsors */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">奖品提供</p>
              <p className="text-sm font-medium text-foreground">陀螺电影Toroscope</p>
            </div>
            <div className="w-px h-6 bg-app-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">联合赞助</p>
              <p className="text-sm font-medium text-foreground">北京Lazy酒吧</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
