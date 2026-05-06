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
      {/* Dark overlay — concentrated at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

      <div className="relative px-6 py-10 md:py-14 text-center">
        <p className="text-xs text-[#a8d5ba] font-medium tracking-widest uppercase mb-2 drop-shadow-md">
          第 79 届戛纳国际电影节
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          戛纳主竞赛股市
        </h2>
        <p className="text-sm text-white/90 drop-shadow-md">
          2026.05.12 - 05.23 · 法国戛纳
        </p>
      </div>
    </div>
  );
}
