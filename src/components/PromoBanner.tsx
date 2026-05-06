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

      <div className="relative px-6 py-12 md:py-16 text-center">
        <p className="text-sm md:text-base text-app-gold font-bold tracking-widest uppercase mb-3 drop-shadow-md">
          第 79 届戛纳国际电影节
        </p>
        <p className="text-xs md:text-sm text-app-gold/80 drop-shadow-md">
          2026.05.12 - 05.23 · 法国戛纳
        </p>
      </div>
    </div>
  );
}
