export function PromoBanner() {
  return (
    <div
      className="relative rounded-lg overflow-hidden group cursor-pointer"
      style={{
        backgroundImage: `url('https://i.imgs.ovh/2026/05/05/1cdaf9ae033de79458798bdf9f3b2ac2.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay — lighter in center to let banner colors show through */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

      <div className="relative px-6 py-10 md:py-14 text-center">
        <p className="text-xs text-app-gold/90 font-medium tracking-widest uppercase mb-2">
          第 79 届戛纳国际电影节
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
          戛纳主竞赛股市
        </h2>
        <p className="text-sm text-white/80">
          2026.05.12 - 05.23 · 法国戛纳
        </p>
      </div>
    </div>
  );
}
