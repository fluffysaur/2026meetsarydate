interface SpriteProps {
  className?: string;
}

export function PixelHeart({ className = 'w-5 h-5' }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 11 10"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="0" width="2" height="1" fill="#5B2308" />
      <rect x="7" y="0" width="2" height="1" fill="#5B2308" />
      <rect x="1" y="1" width="1" height="1" fill="#5B2308" />
      <rect x="4" y="1" width="1" height="1" fill="#5B2308" />
      <rect x="6" y="1" width="1" height="1" fill="#5B2308" />
      <rect x="9" y="1" width="1" height="1" fill="#5B2308" />
      <rect x="0" y="2" width="1" height="3" fill="#5B2308" />
      <rect x="5" y="2" width="1" height="1" fill="#5B2308" />
      <rect x="10" y="2" width="1" height="3" fill="#5B2308" />
      <rect x="1" y="5" width="1" height="1" fill="#5B2308" />
      <rect x="9" y="5" width="1" height="1" fill="#5B2308" />
      <rect x="2" y="6" width="1" height="1" fill="#5B2308" />
      <rect x="8" y="6" width="1" height="1" fill="#5B2308" />
      <rect x="3" y="7" width="1" height="1" fill="#5B2308" />
      <rect x="7" y="7" width="1" height="1" fill="#5B2308" />
      <rect x="4" y="8" width="1" height="1" fill="#5B2308" />
      <rect x="6" y="8" width="1" height="1" fill="#5B2308" />
      <rect x="5" y="9" width="1" height="1" fill="#5B2308" />
      {/* Fill */}
      <rect x="2" y="1" width="2" height="1" fill="#E84A5F" />
      <rect x="7" y="1" width="2" height="1" fill="#E84A5F" />
      <rect x="1" y="2" width="4" height="3" fill="#E84A5F" />
      <rect x="6" y="2" width="4" height="3" fill="#E84A5F" />
      <rect x="5" y="3" width="1" height="2" fill="#E84A5F" />
      <rect x="2" y="5" width="7" height="1" fill="#E84A5F" />
      <rect x="3" y="6" width="5" height="1" fill="#D4354B" />
      <rect x="4" y="7" width="3" height="1" fill="#D4354B" />
      <rect x="5" y="8" width="1" height="1" fill="#D4354B" />
      {/* Highlight */}
      <rect x="2" y="2" width="1" height="1" fill="#FFA8B5" />
    </svg>
  );
}

export function PixelStardrop({ className = 'w-8 h-8' }: SpriteProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {/* Stem */}
      <rect x="5" y="0" width="2" height="2" fill="#5FA848" />
      <rect x="4" y="1" width="1" height="1" fill="#82D166" />
      {/* Star body */}
      <rect x="5" y="2" width="2" height="2" fill="#9B5DE5" />
      <rect x="4" y="4" width="4" height="2" fill="#9B5DE5" />
      <rect x="1" y="5" width="10" height="2" fill="#9B5DE5" />
      <rect x="2" y="7" width="8" height="2" fill="#7B3FE4" />
      <rect x="3" y="9" width="2" height="2" fill="#7B3FE4" />
      <rect x="7" y="9" width="2" height="2" fill="#7B3FE4" />
      {/* Sparkle highlight */}
      <rect x="5" y="3" width="1" height="2" fill="#E0C3FC" />
      <rect x="3" y="5" width="2" height="1" fill="#E0C3FC" />
      <rect x="5" y="6" width="2" height="2" fill="#FDE047" />
    </svg>
  );
}

export function PixelJunimo({
  color = 'green',
  className = 'w-9 h-9',
}: {
  color?: 'green' | 'rose' | 'gold';
  className?: string;
}) {
  const palette = {
    green: { main: '#6BCB77', shade: '#4D9E57', light: '#A8F0B0' },
    rose: { main: '#F0718D', shade: '#C94A67', light: '#FFB5C5' },
    gold: { main: '#F6BD60', shade: '#D49234', light: '#FFE5A3' },
  }[color];

  return (
    <svg
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {/* Leaf antenna */}
      <rect x="5" y="0" width="1" height="2" fill="#4D9E57" />
      <rect x="6" y="0" width="2" height="1" fill="#82D166" />
      {/* Outline top */}
      <rect x="3" y="2" width="6" height="1" fill="#3D1603" />
      <rect x="2" y="3" width="1" height="1" fill="#3D1603" />
      <rect x="9" y="3" width="1" height="1" fill="#3D1603" />
      <rect x="1" y="4" width="1" height="4" fill="#3D1603" />
      <rect x="10" y="4" width="1" height="4" fill="#3D1603" />
      <rect x="2" y="8" width="1" height="1" fill="#3D1603" />
      <rect x="9" y="8" width="1" height="1" fill="#3D1603" />
      <rect x="3" y="9" width="6" height="1" fill="#3D1603" />
      {/* Little arms & feet */}
      <rect x="0" y="5" width="1" height="2" fill="#3D1603" />
      <rect x="11" y="5" width="1" height="2" fill="#3D1603" />
      <rect x="3" y="10" width="2" height="1" fill="#3D1603" />
      <rect x="7" y="10" width="2" height="1" fill="#3D1603" />
      {/* Body fill */}
      <rect x="3" y="3" width="6" height="1" fill={palette.main} />
      <rect x="2" y="4" width="8" height="4" fill={palette.main} />
      <rect x="3" y="8" width="6" height="1" fill={palette.shade} />
      <rect x="2" y="7" width="8" height="1" fill={palette.shade} />
      {/* Highlight */}
      <rect x="3" y="4" width="2" height="1" fill={palette.light} />
      {/* Cute eyes */}
      <rect x="4" y="5" width="1" height="2" fill="#2B1406" />
      <rect x="7" y="5" width="1" height="2" fill="#2B1406" />
    </svg>
  );
}
