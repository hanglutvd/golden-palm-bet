import { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, CalendarDays } from 'lucide-react';
import { trpc } from '@/providers/trpc';

export function AdminMovies() {
  const [newName, setNewName] = useState('');
  const [newDirector, setNewDirector] = useState('');
  const [newPremiere, setNewPremiere] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editPremiere, setEditPremiere] = useState('');

  const utils = trpc.useUtils();
  const { data: movies } = trpc.movie.list.useQuery();

  const createMutation = trpc.admin.createMovie.useMutation({
    onSuccess: () => {
      utils.movie.list.invalidate();
      utils.admin.stats.invalidate();
      setNewName('');
      setNewDirector('');
      setNewPremiere('');
    },
  });

  const deleteMutation = trpc.admin.deleteMovie.useMutation({
    onSuccess: () => utils.movie.list.invalidate(),
  });

  const updatePriceMutation = trpc.admin.updateMoviePrice.useMutation({
    onSuccess: () => utils.movie.list.invalidate(),
  });

  const updatePremiereMutation = trpc.admin.updateMoviePremiere.useMutation({
    onSuccess: () => utils.movie.list.invalidate(),
  });

  const startEdit = (m: typeof movies extends (infer T)[] ? T : never) => {
    setEditingId(m.id);
    setEditPrice(String(m.price));
    setEditPremiere(m.premiereDate || '');
  };

  const saveEdit = (id: number) => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0) {
      updatePriceMutation.mutate({ id, price });
    }
    updatePremiereMutation.mutate({ id, premiereDate: editPremiere });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">电影管理</h1>

      {/* Add new movie */}
      <div className="rounded-lg bg-app-card border border-app-border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">添加电影</h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="电影名称"
            className="flex-1 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
          />
          <input
            value={newDirector}
            onChange={(e) => setNewDirector(e.target.value)}
            placeholder="导演"
            className="flex-1 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
          />
          <input
            value={newPremiere}
            onChange={(e) => setNewPremiere(e.target.value)}
            placeholder="首映时间（如：5月14日）"
            className="w-40 rounded-md border border-app-border bg-app-bg px-3 py-2 text-sm text-foreground focus:border-app-gold focus:outline-none"
          />
          <button
            onClick={() => {
              if (newName.trim() && newDirector.trim()) {
                createMutation.mutate({
                  name: newName.trim(),
                  director: newDirector.trim(),
                  premiereDate: newPremiere.trim() || undefined,
                });
              }
            }}
            disabled={createMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            添加
          </button>
        </div>
      </div>

      {/* Movie list */}
      <div className="rounded-lg bg-app-card border border-app-border overflow-hidden">
        <div className="grid grid-cols-[auto,1fr,1fr,1fr,auto,auto] gap-3 px-4 py-2.5 border-b border-app-border bg-app-bg/60">
          <span className="text-xs font-semibold uppercase text-muted-foreground w-10">排名</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">电影名称</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">导演</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground">首映时间</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">价格</span>
          <span className="text-xs font-semibold uppercase text-muted-foreground text-right">操作</span>
        </div>
        <div className="divide-y divide-app-border/40">
          {movies?.map((m) => (
            <div key={m.id} className="grid grid-cols-[auto,1fr,1fr,1fr,auto,auto] gap-3 items-center px-4 py-3">
              <span className="text-sm text-muted-foreground w-10">{m.rank}</span>
              <span className="text-sm text-foreground">{m.name}</span>
              <span className="text-sm text-muted-foreground">{m.director}</span>

              {/* Premiere date */}
              {editingId === m.id ? (
                <div className="flex items-center gap-1">
                  <input
                    value={editPremiere}
                    onChange={(e) => setEditPremiere(e.target.value)}
                    placeholder="如：5月14日"
                    className="w-full rounded border border-app-border bg-app-bg px-2 py-0.5 text-xs text-foreground"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-3 w-3 text-app-gold/60" />
                  {m.premiereDate || '—'}
                </div>
              )}

              {/* Price */}
              <div className="text-right">
                {editingId === m.id ? (
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-20 rounded border border-app-border bg-app-bg px-1 py-0.5 text-xs text-foreground text-right"
                  />
                ) : (
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    <GameCoin amount={m.price.toFixed(2)} />
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                {editingId === m.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(m.id)}
                      className="p-1 text-app-green hover:text-emerald-400 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-app-red hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(m)}
                      className="p-1 text-muted-foreground hover:text-app-gold transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`确定删除「${m.name}」吗？`)) {
                          deleteMutation.mutate({ id: m.id });
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-app-red transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
