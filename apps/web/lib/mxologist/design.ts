// Midnight Ink + brass design tokens and style helpers, lifted from the
// handoff README + prototype. Inline-style objects keep the recreation
// pixel-faithful to the exact gradient/shadow values in the spec.
import type { CSSProperties } from "react";

export const tokens = {
  bgGradient:
    "radial-gradient(125% 85% at 50% -12%, #16203a 0%, #0c1322 42%, #070b14 100%)",
  ink900: "#070b14",
  ink800: "#0c1322",
  ink700: "#16203a",
  navBg:
    "var(--nav-bg, linear-gradient(180deg,rgba(12,19,34,.92),rgba(12,19,34,.6)))",

  brass: "#c9a55c",
  brassBright: "#e8d199",
  goldGrad: "linear-gradient(180deg,#e8d199,#c9a55c)",
  brassBorder: "rgba(201,165,92,.26)",
  brassBorderStrong: "rgba(201,165,92,.4)",

  textPrimary: "#f3f5fa",
  textBody: "#eef1f7",
  textOnGold: "#0c1322",
  navInactive: "rgba(237,242,250,.96)",

  readyGreen: "#9fb86a",
  almostText: "#d8924f",
  almostAccent: "#c76a35",
} as const;

export type CardBlur = "Subtle" | "Medium" | "Heavy";

export function blurPx(blur: CardBlur = "Medium"): number {
  return { Subtle: 8, Medium: 14, Heavy: 22 }[blur];
}

// Glass card surface — the default container for panels and recipe cards.
export function glassCard(blur: CardBlur = "Medium"): CSSProperties {
  const b = blurPx(blur);
  return {
    background:
      "var(--glass-bg, linear-gradient(160deg,rgba(38,52,82,.55),rgba(14,20,34,.45)))",
    backdropFilter: `blur(${b}px) saturate(125%)`,
    WebkitBackdropFilter: `blur(${b}px) saturate(125%)`,
    border: "1px solid rgba(201,165,92,.26)",
    borderRadius: 6,
    boxShadow:
      "0 16px 40px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.05)",
  };
}

// Primary gold button.
export function goldButton(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontWeight: 500,
    textTransform: "uppercase",
    color: tokens.textOnGold,
    background: tokens.goldGrad,
    border: "1px solid #efdca8",
    borderRadius: 3,
    cursor: "pointer",
  };
}

// Radial accent glow behind a drink monogram tile.
export function glowLayer(d: { rgb: string }): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(circle at 50% 45%, rgba(${d.rgb},.5), transparent 68%)`,
  };
}

// Monogram text — size varies by surface (62px tile = 24px, 54px tile = 20px).
export function monoStyle(d: { accent: string; rgb: string }, size = 24): CSSProperties {
  return {
    position: "relative",
    fontFamily: "var(--font-poiret)",
    fontSize: size,
    letterSpacing: ".04em",
    color: d.accent,
    textShadow: `0 0 14px rgba(${d.rgb},.5)`,
  };
}

// 62px / 54px monogram tile frame.
export function monoTile(size: number): CSSProperties {
  return {
    position: "relative",
    width: size,
    height: size,
    flex: "none",
    border: "1px solid rgba(201,165,92,.4)",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "rgba(0,0,0,.3)",
  };
}

// Uppercase brass eyebrow label.
export function eyebrow(letterSpacing = ".34em", size = 12): CSSProperties {
  return {
    fontSize: size,
    letterSpacing,
    textTransform: "uppercase",
    color: tokens.brass,
  };
}

// Poiret One screen headline (H2).
export function headline(size = 46): CSSProperties {
  return {
    fontFamily: "var(--font-poiret)",
    fontWeight: 400,
    fontSize: size,
    margin: 0,
    color: tokens.textPrimary,
  };
}

// Flex-grow divider rule fading to transparent (defaults to brass).
export function rule(color = "rgba(201,165,92,.4)"): CSSProperties {
  return {
    height: 1,
    flex: 1,
    background: `linear-gradient(90deg,${color},transparent)`,
  };
}

// Rotated-square "diamond" mark used in section headers.
export function diamond(color: string, size = 8): CSSProperties {
  return {
    width: size,
    height: size,
    background: color,
    transform: "rotate(45deg)",
    boxShadow: `0 0 12px ${color}`,
  };
}
