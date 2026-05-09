import { useState, useMemo, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Film, Lock, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { trpc } from '@/providers/trpc';
import { useAuth } from '@/hooks/useAuth';
import { GameCoin } from '@/components/GameCoin';
import { formatPremiereDate } from '@/lib/dateUtils';
import { getMarketStatus, formatTimeRemaining } from '@contracts/market';
import type { MovieQuote } from '@/types';

interface MovieDetailModalProps {
  open: boolean;
  onClose: () => void;
  movie: MovieQuote | null;
}

export function MovieDetailModal({ open, onClose, movie }: MovieDetailModalProps) {
  // All hooks MUST be before any conditional return
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [marketStatus, setMarketStatus] = useState(() => getMarketStatus());

  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const movieId = movie?.id ? Number(movie.id) : null;

  const { data: history } = trpc.movie.history.useQuery(
    { id: movieId! },
    { enabled: !!movieId && open }
  );

  const { data: myHoldings } = trpc.trading.myHoldings.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });

  const buyMutation = trpc.trading.buy.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      utils.invalidate();
      setTimeout(() => setSuccess(''), 2000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    },
  });

  const sellMutation = trpc.trading.sell.useMutation({
    onSuccess: (data) => {
      setSuccess(data.message);
      utils.invalidate();
      setTimeout(() => setSuccess(''), 2000);
    },
    onError: (err) => {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    },
  });

  // Market session status with live updates
  useEffect(() => {
    const timer = setInterval(() => setMarketStatus(getMarketStatus()), 1000);
    return () => clearInterval(timer);
  }, []);

  const chartData = useMemo(() => {
    if (!history || history.length === 0) {
      const data = [];
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        data.push({
          day: `${d.getMonth() + 1}/${d.getDate()}`,
          price: 100,
        });
      }
      return data;
    }
    const data = [];
    let currentPrice = 100;
    const sorted = [...history].reverse();
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const txsBefore = sorted.filter((t) => new Date(t.date) <= d);
      if (txsBefore.length > 0) {
        currentPrice = txsBefore[txsBefore.length - 1].price;
      }
      data.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, price: currentPrice });
    }
    return data;
  }, [history]);

  // Conditional return MUST be after all hooks
  if (!open || !movie) return null;

  const isUp = movie.trend === 'up';
  const isDown = movie.trend === 'down';
  const price = movie.price;
  const total = (price * quantity).toFixed(2);
  const trendColor = isUp ? '#4ade80' : isDown ? '#f87171' : '#a0a0a0';
  const isPending = buyMutation.isPending || sellMutation.isPending;
  const marketClosed = !marketStatus.isOpen;

  const myHolding = myHoldings?.find((h) => h.movieId === movieId);
  const currentQty = myHolding?.quantity || 0;
  const maxBuy = mode === 'buy'
    ? Math.floor((user?.balance || 0) / price)
    : currentQty;

  const handleTrade = () => {
    setError('');
    setSuccess('');
    if (!movieId) return;
    const qty = Math.min(quantity, maxBuy);
    if (qty <= 0) {
      setError(mode === 'buy' ? '余额不足' : '没有可卖出的股份');
      return;
    }
    if (mode === 'buy') {
      buyMutation.mutate({ movieId, quantity: qty });
    } else {
      sellMutation.mutate({ movieId, quantity: qty });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-app-card border border-app-border shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-app-border bg-app-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Film className="h-5 w-5 text-app-gold" />
            <div>
              <h2 className="text-base font-bold text-foreground">{movie.name}</h2>
              <p className="text-xs text-muted-foreground">{movie.director}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-app-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Price summary */}
          <div className="flex items-center justify-between rounded-lg bg-app-bg/60 border border-app-border/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">当前价格</p>
              <p className={`text-xl font-bold tabular-nums ${isUp ? 'text-app-red' : isDown ? 'text-app-green' : 'text-foreground'}`}>
                {price.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">首映时间</p>
              <p className="text-sm font-medium text-app-gold tabular-nums">
                {formatPremiereDate(movie.premiereDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">较开盘价</p>
              <div className="flex items-center justify-end gap-1">
                {isUp && <TrendingUp className="h-4 w-4 text-app-red" />}
                {isDown && <TrendingDown className="h-4 w-4 text-app-green" />}
                <span className={`text-sm font-semibold tabular-nums ${isUp ? 'text-app-red' : isDown ? 'text-app-green' : 'text-muted-foreground'}`}>
                  {isUp ? '+' : ''}{movie.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Market session status */}
          <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 border ${marketStatus.isOpen ? 'bg-app-green/5 border-app-green/20' : 'bg-muted/30 border-app-border/40'}`}>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${marketStatus.isOpen ? 'text-app-green' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-medium ${marketStatus.isOpen ? 'text-app-green' : 'text-muted-foreground'}`}>
                {marketStatus.status}
              </span>
              <span className="text-xs text-muted-foreground">
                09:00-12:00 / 15:00-18:00 北京时间
              </span>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {marketStatus.isOpen
                ? `距收盘 ${formatTimeRemaining(marketStatus.nextClose!)}`
                : `距开盘 ${formatTimeRemaining(marketStatus.nextOpen!)}`}
            </span>
          </div>

          {/* Chart */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              价格走势
            </p>
            <div className="rounded-lg border border-app-border/60 bg-app-bg/40 px-3 py-3">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendColor} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 10 }} axisLine={{ stroke: '#333' }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v: number) => v.toFixed(0)} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '6px', fontSize: '12px', color: '#e8e8e8' }} formatter={(value: number) => [`${value.toFixed(2)}`, '价格']} />
                  <Area type="monotone" dataKey="price" stroke={trendColor} strokeWidth={2} fill="url(#trendGrad)" dot={false} activeDot={{ r: 4, fill: trendColor }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Login required */}
          {!isAuthenticated && (
            <div className="flex items-center gap-3 rounded-lg bg-app-gold/10 border border-app-gold/20 px-4 py-3">
              <Lock className="h-5 w-5 text-app-gold flex-shrink-0" />
              <div>
                <p className="text-sm text-app-gold font-medium">请先登录</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  登录后即可买入/卖出电影股票
                </p>
              </div>
            </div>
          )}

          {/* Trade Panel */}
          {isAuthenticated && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                交易
              </p>
              <div className="rounded-lg border border-app-border/60 bg-app-bg/40 p-4 space-y-4">
                {/* Balance */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">我的余额</span>
                  <span className="text-app-gold font-semibold tabular-nums">
                    <GameCoin amount={user?.balance ?? 0} />
                  </span>
                </div>

                {/* Mode toggle */}
                <div className="flex rounded-md bg-app-card overflow-hidden border border-app-border">
                  <button onClick={() => setMode('buy')} className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${mode === 'buy' ? 'bg-app-green/15 text-app-green' : 'text-muted-foreground hover:text-foreground'}`}>
                    买入
                  </button>
                  <button onClick={() => setMode('sell')} className={`flex-1 py-2 text-sm font-medium text-center transition-colors ${mode === 'sell' ? 'bg-app-red/15 text-app-red' : 'text-muted-foreground hover:text-foreground'}`}>
                    卖出
                  </button>
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">数量（股）</label>
                    <span className="text-xs text-muted-foreground">
                      持有 {currentQty} 股
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-9 w-9 rounded-md border border-app-border bg-app-card text-foreground hover:bg-app-hover transition-colors flex items-center justify-center text-lg">
                      −
                    </button>
                    <input type="number" min={1} max={maxBuy} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(maxBuy, parseInt(e.target.value) || 1)))} className="flex-1 h-9 rounded-md border border-app-border bg-app-bg px-3 text-sm text-foreground text-center focus:border-app-gold focus:outline-none transition-colors tabular-nums" />
                    <button onClick={() => setQuantity(Math.min(maxBuy, quantity + 1))} className="h-9 w-9 rounded-md border border-app-border bg-app-card text-foreground hover:bg-app-hover transition-colors flex items-center justify-center text-lg">
                      +
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-md bg-app-card border border-app-border px-3 py-2">
                  <span className="text-xs text-muted-foreground">预计{mode === 'buy' ? '支出' : '收入'}</span>
                  <span className="text-sm font-bold tabular-nums text-foreground"><GameCoin amount={total} /></span>
                </div>

                {/* Messages */}
                {marketClosed && (
                  <div className="flex items-center gap-2 rounded-md bg-muted/40 border border-app-border px-3 py-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      当前为非交易时段，09:00-12:00 / 15:00-18:00（北京时间）方可交易
                    </p>
                  </div>
                )}
                {error && <div className="rounded-md bg-app-red/10 border border-app-red/20 px-3 py-2 text-sm text-app-red text-center">{error}</div>}
                {success && <div className="rounded-md bg-app-green/10 border border-app-green/20 px-3 py-2 text-sm text-app-green text-center">{success}</div>}

                {/* Submit */}
                <button onClick={handleTrade} disabled={isPending || marketClosed} className={`w-full rounded-md py-2.5 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'buy' ? 'bg-app-green hover:bg-emerald-400 hover:shadow-[0_2px_12px_rgba(91,140,90,0.3)]' : 'bg-app-red hover:bg-red-400 hover:shadow-[0_2px_12px_rgba(248,113,113,0.3)]'}`}>
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    {isPending ? '处理中...' : marketClosed ? '休市中' : mode === 'buy' ? '确认买入' : '确认卖出'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="flex items-start gap-2 rounded-lg bg-app-gold/5 border border-app-gold/10 px-3 py-2.5">
            <DollarSign className="h-4 w-4 text-app-gold flex-shrink-0 mt-0.5" />
            <p className="text-xs text-app-gold leading-relaxed">
              交易期间价格锁定为时段开盘价，买入/卖出仅影响您的持仓与余额。上午 <strong>12:00</strong> 收盘后调整下午 15:00 开盘价，下午 <strong>18:00</strong> 收盘后调整次日 09:00 开盘价——系统根据各时段净成交量统一更新。
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
