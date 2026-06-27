"use client";

// Shimmering placeholder blocks used while a screen's data loads, in place of
// plain "Loading…" text. The shimmer keyframe lives in app/globals.css.
import type { CSSProperties } from "react";
import { glassCard } from "@/lib/mxologist/design";

export default function Skeleton({
  width = "100%",
  height = 14,
  radius = 6,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className="mx-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// One placeholder drink card — mirrors the recommendation / "what can I make"
// card silhouette (monogram, name, flavour chips, two ingredient lines).
function CardSkeleton() {
  return (
    <div
      style={{
        ...glassCard(),
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <Skeleton width={52} height={52} radius={10} />
      <Skeleton width="65%" height={20} />
      <div style={{ display: "flex", gap: 8 }}>
        <Skeleton width={58} height={18} radius={20} />
        <Skeleton width={46} height={18} radius={20} />
        <Skeleton width={52} height={18} radius={20} />
      </div>
      <Skeleton width="100%" height={11} />
      <Skeleton width="80%" height={11} />
    </div>
  );
}

// A responsive grid of card skeletons (recommendations, matches).
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
        gap: 18,
        marginTop: 28,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Section eyebrow + horizontal rule placeholder.
function SectionHeaderSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginTop: 36,
        marginBottom: 4,
      }}
    >
      <Skeleton width={150} height={13} />
      <div
        style={{
          flex: 1,
          height: 1,
          background: "rgba(201,165,92,.18)",
        }}
      />
    </div>
  );
}

// Recommendations screen: a taste-profile panel + a grid of cards.
export function RecommendedSkeleton() {
  return (
    <>
      <div style={{ ...glassCard(), padding: 24, marginTop: 28 }}>
        <Skeleton width={120} height={12} style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <Skeleton width={100} height={12} />
              <Skeleton width="100%" height={7} radius={6} />
            </div>
          ))}
        </div>
      </div>
      <CardGridSkeleton count={6} />
    </>
  );
}

// "What can I make" screen: a section header + grid of match cards.
export function MatchesSkeleton() {
  return (
    <div style={{ marginTop: 4 }}>
      <SectionHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </div>
  );
}

// Recipe-detail screen: back link + two-column (artwork, title/meta/method).
export function RecipeDetailSkeleton() {
  return (
    <div>
      <Skeleton width={140} height={13} style={{ marginBottom: 26 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 34,
          alignItems: "start",
        }}
      >
        <Skeleton
          width="100%"
          height={0}
          radius={10}
          style={{ aspectRatio: "3 / 4", height: "auto" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Skeleton width="55%" height={40} />
          <div style={{ display: "flex", gap: 10 }}>
            <Skeleton width={70} height={22} radius={20} />
            <Skeleton width={60} height={22} radius={20} />
            <Skeleton width={80} height={22} radius={20} />
          </div>
          <Skeleton width={180} height={28} style={{ marginTop: 6 }} />
          <div style={{ ...glassCard(), padding: 22, marginTop: 8 }}>
            <Skeleton width={130} height={12} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <Skeleton width="45%" height={13} />
                  <Skeleton width={64} height={13} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...glassCard(), padding: 22 }}>
            <Skeleton width={110} height={12} style={{ marginBottom: 18 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <Skeleton width="100%" height={12} />
              <Skeleton width="92%" height={12} />
              <Skeleton width="96%" height={12} />
              <Skeleton width="70%" height={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings screen: a stack of section panels with label + control rows.
export function SettingsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ ...glassCard(), padding: 26 }}>
          <Skeleton width={140} height={12} style={{ marginBottom: 18 }} />
          <Skeleton width="70%" height={14} style={{ marginBottom: 16 }} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Skeleton width={130} height={40} radius={6} />
            <Skeleton width={130} height={40} radius={6} />
            <Skeleton width={130} height={40} radius={6} />
          </div>
        </div>
      ))}
    </div>
  );
}

// A row of chip placeholders (My Bar inventory while loading).
export function ChipsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={70 + ((i * 37) % 80)} height={36} radius={4} />
      ))}
    </div>
  );
}
