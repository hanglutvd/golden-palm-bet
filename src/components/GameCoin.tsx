import { Coins } from 'lucide-react';

interface GameCoinProps {
  amount: number | string;
  className?: string;
  iconClassName?: string;
}

/**
 * 游戏代币显示组件
 * 用金币图标替代 ¥ 符号，强调这是游戏代币而非真实货币
 */
export function GameCoin({ amount, className = '', iconClassName = '' }: GameCoinProps) {
  const formatted = typeof amount === 'number'
    ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : amount;

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <Coins className={`h-3.5 w-3.5 text-app-gold flex-shrink-0 ${iconClassName}`} />
      <span className="tabular-nums">{formatted}</span>
    </span>
  );
}
