"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import { recipeToCard, type CardDrink } from "@/lib/mxologist/adapt";
import type {
  ApiFavorite,
  ApiRating,
  ApiRecommendation,
  ApiUserIngredient,
} from "@/lib/mxologist/api-types";
import {
  diamond,
  eyebrow,
  glassCard,
  glowLayer,
  headline,
  monoStyle,
  monoTile,
  rule,
  tokens,
} from "@/lib/mxologist/design";
import { useMxologist } from "../store";
import HoverDiv from "../Hover";

type Pick = {
  d: CardDrink;
  matchPct: number;
  makeText: string;
  makeColor: string;
};

type TasteBar = { label: string; raw: number; pct: number };

export default function Recommended() {
  const { open } = useMxologist();
  const api = useApi();
  const { t } = useT();

  const [recs, setRecs] = useState<ApiRecommendation[]>([]);
  const [ratings, setRatings] = useState<ApiRating[]>([]);
  const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
  const [owned, setOwned] = useState<ApiUserIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api<ApiRecommendation[]>("/recommendations?limit=6"),
      api<ApiRating[]>("/ratings/mine"),
      api<ApiUserIngredient[]>("/ingredients/my-inventory"),
      api<ApiFavorite[]>("/favorites/mine"),
    ])
      .then(([r, rt, inv, fav]) => {
        if (cancelled) return;
        setRecs(r);
        setRatings(rt);
        setOwned(inv);
        setFavorites(fav);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  const ownedIds = new Set(owned.map((o) => o.ingredientId));
  const ratedCount = ratings.length;

  // Taste profile: flavour tags weighted by (score - 3), mirroring the API's
  // recommender. Only positive (liked) flavours are shown.
  const profile = new Map<string, number>();
  for (const rt of ratings) {
    const weight = rt.score - 5.5; // canonical 1–10, ~5.5 neutral
    for (const tag of rt.recipe.flavorTags) {
      profile.set(tag, (profile.get(tag) ?? 0) + weight);
    }
  }
  const maxAbs = Math.max(...Array.from(profile.values()).map(Math.abs), 1);
  const tasteBars: TasteBar[] = Array.from(profile.entries())
    .map(([label, raw]) => ({
      label, // raw FlavorTag enum; translated at render
      raw,
      pct: Math.round((100 * raw) / maxAbs),
    }))
    .filter((b) => b.raw > 0)
    .sort((a, b) => b.raw - a.raw);

  // Normalise raw overlap scores into a friendly 70–98% "match".
  const scores = recs.map((r) => r.score);
  const maxS = Math.max(...scores, 1);
  const minS = Math.min(...scores, 0);
  const picks: Pick[] = recs.map(({ recipe, score }) => {
    const total = recipe.ingredients.length;
    const missing = recipe.ingredients.filter(
      (ri) => !ownedIds.has(ri.ingredientId),
    ).length;
    const card = recipeToCard(recipe);
    return {
      d: {
        ...card,
        tags: card.tags.map((tag) => t(`flavor.${tag}` as I18nKey)),
      },
      matchPct: Math.round(70 + 28 * ((score - minS) / (maxS - minS || 1))),
      makeText:
        missing === 0
          ? `● ${t("rec.pourTonight")}`
          : missing <= Math.floor(total / 2)
            ? `○ ${t(missing === 1 ? "rec.away_one" : "rec.away_other", { n: missing })}`
            : `○ ${t("rec.stretch")}`,
      makeColor: missing === 0 ? tokens.readyGreen : tokens.almostText,
    };
  });

  // Favorites reuse the same card, but they carry no recommendation score —
  // we only surface the "can you pour it tonight?" status from the inventory.
  const favPicks: Pick[] = favorites.map(({ recipe }) => {
    const total = recipe.ingredients.length;
    const missing = recipe.ingredients.filter(
      (ri) => !ownedIds.has(ri.ingredientId),
    ).length;
    const card = recipeToCard(recipe);
    return {
      d: {
        ...card,
        tags: card.tags.map((tag) => t(`flavor.${tag}` as I18nKey)),
      },
      matchPct: 0, // unused for favorites; the % block is hidden below
      makeText:
        missing === 0
          ? `● ${t("rec.pourTonight")}`
          : missing <= Math.floor(total / 2)
            ? `○ ${t(missing === 1 ? "rec.away_one" : "rec.away_other", { n: missing })}`
            : `○ ${t("rec.stretch")}`,
      makeColor: missing === 0 ? tokens.readyGreen : tokens.almostText,
    };
  });

  const recIntro =
    ratedCount > 0
      ? t(ratedCount === 1 ? "rec.intro_one" : "rec.intro_other", {
          n: ratedCount,
        })
      : t("rec.introCold");

  return (
    <div>
      <div style={eyebrow()}>{t("rec.eyebrow")}</div>
      <h2 style={{ ...headline(46), margin: "8px 0 0" }}>{t("rec.title")}</h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "rgba(214,222,238,.7)",
          margin: "14px 0 0",
          fontWeight: 300,
        }}
      >
        {recIntro}
      </p>

      {error && (
        <div style={{ color: tokens.almostText, marginTop: 24 }}>
          {t("rec.error", { e: error })}
        </div>
      )}

      {loading && (
        <div style={{ color: "rgba(214,222,238,.6)", marginTop: 28 }}>
          {t("rec.loading")}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Taste profile */}
          <div style={{ ...glassCard(), padding: 24, marginTop: 28 }}>
            <div style={{ ...eyebrow(".24em", 11), marginBottom: 18 }}>
              {t("rec.tasteProfile")}
            </div>
            {tasteBars.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                {tasteBars.map((b) => (
                  <div
                    key={b.label}
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <div
                      style={{
                        width: 110,
                        fontSize: 13,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        color: "rgba(214,222,238,.8)",
                      }}
                    >
                      {t(`flavor.${b.label}` as I18nKey)}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 7,
                        borderRadius: 6,
                        background: "rgba(201,165,92,.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${b.pct}%`,
                          background: "linear-gradient(90deg,#c9a55c,#e8d199)",
                          borderRadius: 6,
                          boxShadow: "0 0 12px rgba(227,201,135,.4)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "rgba(150,164,190,.7)" }}>
                {t("rec.tasteEmpty")}
              </div>
            )}
          </div>

          {/* Picks rail */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "34px 0 20px",
            }}
          >
            <div style={diamond(tokens.brass)} />
            <div
              style={{
                fontSize: 13,
                letterSpacing: ".26em",
                textTransform: "uppercase",
                color: tokens.brass,
                whiteSpace: "nowrap",
              }}
            >
              {t("rec.picked")}
            </div>
            <div style={rule()} />
          </div>

          {picks.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                padding: "4px 4px 18px",
                margin: "0 -4px",
              }}
            >
              {picks.map(({ d, matchPct, makeText, makeColor }) => (
                <RecCard
                  key={d.id}
                  d={d}
                  matchPct={matchPct}
                  matchLabel={t("rec.match")}
                  makeText={makeText}
                  makeColor={makeColor}
                  onOpen={() => open(d.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "rgba(150,164,190,.7)" }}>
              {t("rec.noPicks")}
            </div>
          )}

          {/* Favorites rail */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "34px 0 20px",
            }}
          >
            <div style={diamond(tokens.brass)} />
            <div
              style={{
                fontSize: 13,
                letterSpacing: ".26em",
                textTransform: "uppercase",
                color: tokens.brass,
                whiteSpace: "nowrap",
              }}
            >
              {t("rec.favorites")}
            </div>
            <div style={rule()} />
          </div>

          {favPicks.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                padding: "4px 4px 18px",
                margin: "0 -4px",
              }}
            >
              {favPicks.map(({ d, makeText, makeColor }) => (
                <RecCard
                  key={d.id}
                  d={d}
                  makeText={makeText}
                  makeColor={makeColor}
                  onOpen={() => open(d.id)}
                />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "rgba(150,164,190,.7)" }}>
              {t("rec.noFavorites")}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecCard({
  d,
  matchPct,
  matchLabel,
  makeText,
  makeColor,
  onOpen,
}: {
  d: CardDrink;
  matchPct?: number;
  matchLabel?: string;
  makeText: string;
  makeColor: string;
  onOpen: () => void;
}) {
  return (
    <HoverDiv
      onClick={onOpen}
      base={{
        ...glassCard(),
        padding: 20,
        cursor: "pointer",
        flex: "none",
        width: 260,
        transition:
          "transform .25s ease,border-color .25s ease,box-shadow .25s ease",
      }}
      hover={{
        transform: "translateY(-5px)",
        border: "1px solid rgba(227,201,135,.55)",
        boxShadow: "0 24px 54px rgba(0,0,0,.55)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={monoTile(54)}>
          <div style={glowLayer(d)} />
          <div style={monoStyle(d, 20)}>{d.mono}</div>
        </div>
        {matchPct !== undefined && (
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-poiret)",
                fontSize: 26,
                color: "#e3c987",
                lineHeight: 1,
              }}
            >
              {matchPct}%
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: ".18em",
                textTransform: "uppercase",
                color: "rgba(150,164,190,.7)",
                marginTop: 2,
              }}
            >
              {matchLabel}
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-poiret)",
          fontSize: 22,
          color: tokens.textPrimary,
          marginTop: 16,
          lineHeight: 1.05,
        }}
      >
        {d.name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {d.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: tokens.brass,
              border: "1px solid rgba(201,165,92,.3)",
              borderRadius: 20,
              padding: "3px 8px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 16,
          paddingTop: 13,
          borderTop: "1px solid rgba(201,165,92,.14)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: makeColor,
          }}
        >
          {makeText}
        </span>
      </div>
    </HoverDiv>
  );
}
