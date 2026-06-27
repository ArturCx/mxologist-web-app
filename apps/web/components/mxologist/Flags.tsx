// Inline SVG flags. Emoji regional-indicator flags (🇺🇸/🇧🇷) don't render on
// Windows, so we ship real vector flags for the language selector instead.

type FlagProps = {
  size?: number;
};

export function FlagUS({ size = 18 }: FlagProps) {
  const height = Math.round((size * 10) / 19);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 19 10"
      role="img"
      aria-label="United States"
      style={{ borderRadius: 2, display: "block" }}
    >
      <rect width="19" height="10" fill="#b22234" />
      {[1, 3, 5, 7, 9].map((y) => (
        <rect key={y} y={y} width="19" height="0.77" fill="#fff" />
      ))}
      <rect width="8" height="5.38" fill="#3c3b6e" />
    </svg>
  );
}

export function FlagBR({ size = 18 }: FlagProps) {
  const height = Math.round((size * 10) / 14);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 14 10"
      role="img"
      aria-label="Brasil"
      style={{ borderRadius: 2, display: "block" }}
    >
      <rect width="14" height="10" fill="#009b3a" />
      <polygon points="7,1 13,5 7,9 1,5" fill="#fedf00" />
      <circle cx="7" cy="5" r="2.1" fill="#002776" />
    </svg>
  );
}
