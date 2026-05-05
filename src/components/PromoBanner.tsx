export function PromoBanner() {
  return (
    <div 
      className="rounded-lg overflow-hidden group cursor-pointer relative"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
      }}
    >
      <div className="px-6 py-8 md:py-10 text-center relative">
        {/* Decorative elements */}
        <div className="absolute top-3 left-4 w-16 h-16 rounded-full bg-app-gold/5 blur-xl" />
        <div className="absolute bottom-3 right-4 w-20 h-20 rounded-full bg-app-gold/5 blur-xl" />
        
        <p className="text-xs text-app-gold/80 font-medium tracking-widest uppercase mb-2 relative">
          第 79 届戛纳国际电影节
        </p>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 relative">
          金棕榈竞猜
        </h2>
        <p className="text-sm text-muted-foreground relative">
          2026.05.12 - 05.23 · 法国戛纳
        </p>
        
        {/* Gold line accent */}
        <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-app-gold/60 to-transparent" />
      </div>
    </div>
  );
}
