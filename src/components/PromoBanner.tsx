export function PromoBanner() {
  return (
    <div className="rounded-lg overflow-hidden group cursor-pointer">
      <img
        src="/images/cannes-official-banner.jpg"
        alt="第79届戛纳电影节"
        className="w-full h-auto object-cover transition-opacity duration-200 group-hover:opacity-90"
        loading="lazy"
      />
    </div>
  );
}
