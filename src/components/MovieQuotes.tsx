import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ArrowUpDown, CalendarDays } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/providers/trpc';
import { movieQuotes } from '@/data/movieData';
import { MovieDetailModal } from './MovieDetailModal';
import { formatPremiereDate, comparePremiereDate } from '@/lib/dateUtils';

export function MovieQuotes() {
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'premiere'>('price');

  const { data: apiMovies, isLoading } = trpc.movie.list.useQuery(undefined, {
    refetchOnWindowFocus: true,
    retry: 1,
  });

  // Merge API data (prices) with static data (quotes/authors)
  let movies = movieQuotes.map((staticM) => {
    const apiM = apiMovies?.find((a) => String(a.id) === staticM.id);
    if (apiM) {
      return {
        ...staticM,
        price: apiM.price,
        basePrice: apiM.basePrice,
        change: apiM.change,
        changePercent: apiM.changePercent,
        trend: apiM.trend,
        dailyNetVolume: apiM.dailyNetVolume,
        premiereDate: apiM.premiereDate || staticM.premiereDate,
      };
    }
    return staticM;
  });

  // Sort movies based on selected sort mode
  if (sortBy === 'premiere') {
    movies = [...movies].sort((a, b) => comparePremiereDate(a.premiereDate, b.premiereDate));
  } else {
    // Sort by price descending (highest first)
    movies = [...movies].sort((a, b) => b.price - a.price);
  }

  const selectedMovie = movies.find((m) => m.id === selectedMovieId) ?? null;

  return (
    <>
      <div className="rounded-lg bg-app-card overflow-hidden">
        {/* Section Title */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-app-gold">股市行情</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-app-card border-app-border max-w-xs">
                  <p className="text-xs text-muted-foreground">
                    价格根据市场买卖日结更新。次日09:00根据净成交量统一调整开盘价。
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'price' ? 'premiere' : 'price')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors bg-app-gold/10 border-app-gold/30 text-app-gold"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortBy === 'price' ? '按照首映时间排序' : '按照价格排序'}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-app-border">
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground w-12">
                  排名
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  电影名称
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell w-36">
                  导演
                </th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell w-28">
                  首映时间
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24">
                  当前价
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground w-28">
                  涨跌幅
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !movies.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    加载中...
                  </td>
                </tr>
              ) : movies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    暂无数据
                  </td>
                </tr>
              ) : (
                movies.map((movie, index) => (
                  <tr
                    key={movie.id}
                    onClick={() => setSelectedMovieId(movie.id)}
                    className="border-b border-app-border/60 transition-colors duration-200 hover:bg-app-hover group cursor-pointer"
                  >
                    <td className="px-3 py-3 text-sm text-muted-foreground tabular-nums">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-medium text-app-gold transition-colors duration-150 group-hover:underline group-hover:text-app-gold/80">
                        {movie.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                      {movie.director}
                    </td>
                    <td className="px-3 py-3 text-sm text-muted-foreground hidden md:table-cell tabular-nums">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-app-gold/60" />
                        {formatPremiereDate(movie.premiereDate)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span
                        className={`text-sm font-semibold tabular-nums transition-colors duration-300 ${
                          movie.trend === 'up'
                            ? 'text-app-red'
                            : movie.trend === 'down'
                              ? 'text-app-green'
                              : 'text-foreground'
                        }`}
                      >
                        {movie.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {movie.trend === 'up' && (
                          <TrendingUp className="h-3.5 w-3.5 text-app-red" />
                        )}
                        {movie.trend === 'down' && (
                          <TrendingDown className="h-3.5 w-3.5 text-app-green" />
                        )}
                        {movie.trend === 'flat' && (
                          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm font-medium tabular-nums ${
                            movie.trend === 'up'
                              ? 'text-app-red'
                              : movie.trend === 'down'
                                ? 'text-app-green'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {movie.trend === 'up' ? '+' : ''}
                          {movie.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          (量:{(movie as any).dailyNetVolume ?? 0})
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MovieDetailModal
        open={!!selectedMovie}
        onClose={() => setSelectedMovieId(null)}
        movie={selectedMovie}
      />
    </>
  );
}
