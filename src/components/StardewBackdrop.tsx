export function StardewBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Pelican Town Twilight Sunset Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #191536 0%, #3E2856 32%, #7D4364 62%, #C96E63 84%, #F2B26B 100%)',
        }}
      />

      {/* Twinkling Pixel Stars */}
      <div className="absolute top-[8%] left-[14%] w-1.5 h-1.5 bg-[#FFF6C2] animate-twinkle" />
      <div
        className="absolute top-[14%] left-[78%] w-1.5 h-1.5 bg-[#FFF6C2] animate-twinkle"
        style={{ animationDelay: '0.8s' }}
      />
      <div
        className="absolute top-[22%] left-[42%] w-1 h-1 bg-[#FFD6E0] animate-twinkle"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-[11%] left-[56%] w-1 h-1 bg-[#FFF6C2] animate-twinkle"
        style={{ animationDelay: '0.4s' }}
      />
      <div
        className="absolute top-[28%] left-[88%] w-1.5 h-1.5 bg-[#FFF6C2] animate-twinkle"
        style={{ animationDelay: '1.9s' }}
      />
      <div
        className="absolute top-[25%] left-[12%] w-1 h-1 bg-[#FFD6E0] animate-twinkle"
        style={{ animationDelay: '1.1s' }}
      />

      {/* Drifting Pixel Clouds */}
      <div className="absolute top-[16%] -left-24 w-28 opacity-35 animate-cloud-slow">
        <div className="h-3 w-16 mx-auto bg-[#F8C8C4]" />
        <div className="h-3 w-28 bg-[#F4A9A8]" />
        <div className="h-2 w-20 mx-auto bg-[#D9838F]" />
      </div>

      <div
        className="absolute top-[33%] -left-20 w-24 opacity-30 animate-cloud-med"
        style={{ animationDelay: '-18s' }}
      >
        <div className="h-2.5 w-12 mx-auto bg-[#FFE0B5]" />
        <div className="h-3 w-24 bg-[#F7BA8E]" />
      </div>

      {/* Distant Pelican Town Pine & Mountain Silhouette */}
      <svg
        viewBox="0 0 160 32"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        className="absolute bottom-0 left-0 w-full h-24 opacity-85"
      >
        {/* Distant hills */}
        <polygon points="0,32 0,18 28,10 62,20 96,12 130,19 160,13 160,32" fill="#2A1D3D" />
        {/* Foreground pine silhouettes */}
        <rect x="0" y="24" width="160" height="8" fill="#19132B" />
        <rect x="8" y="20" width="4" height="4" fill="#19132B" />
        <rect x="9" y="17" width="2" height="3" fill="#19132B" />
        <rect x="22" y="19" width="6" height="5" fill="#19132B" />
        <rect x="24" y="15" width="2" height="4" fill="#19132B" />
        <rect x="128" y="19" width="6" height="5" fill="#19132B" />
        <rect x="130" y="16" width="2" height="3" fill="#19132B" />
        <rect x="146" y="21" width="4" height="3" fill="#19132B" />
      </svg>
    </div>
  );
}
