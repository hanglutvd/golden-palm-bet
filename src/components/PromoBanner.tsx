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
        <h2 className="text-2xl md:text-4xl font-extrabold text-app-gold mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          第 79 届戛纳国际电影节
        </h2>
        <p className="text-base md:text-lg font-bold text-app-gold/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
          2026.05.12 - 05.23 · 法国戛纳
        </p>
      </div>
    </div>
  );
}
