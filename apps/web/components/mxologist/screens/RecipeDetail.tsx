"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import { recipeToCard } from "@/lib/mxologist/adapt";
import { formatMeasure, type Unit } from "@/lib/mxologist/measure";
import type {
  ApiFavorite,
  ApiRating,
  ApiRecipe,
  ApiUserIngredient,
} from "@/lib/mxologist/api-types";
import { eyebrow, glassCard, rule, tokens } from "@/lib/mxologist/design";
import { useMxologist } from "../store";
import { RecipeDetailSkeleton } from "../Skeleton";
import DrinkImage from "../DrinkImage";

// "+ Add" chip for a missing ingredient — hovers to a soft green wash.
function AddChip({ onClick, label }: { onClick: () => void; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      style={{
        fontSize: 10,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: tokens.readyGreen,
        border: "1px solid rgba(159,184,106,.4)",
        borderRadius: 20,
        padding: "4px 10px",
        cursor: "pointer",
        background: on ? "rgba(159,184,106,.12)" : "transparent",
      }}
    >
      ＋ {label}
    </span>
  );
}

const dividerHeader = (label: string) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      margin: "30px 0 18px",
    }}
  >
    <div style={{ ...eyebrow(".24em", 13), whiteSpace: "nowrap" }}>{label}</div>
    <div style={rule()} />
  </div>
);

export default function RecipeDetail() {
  const { selectedId, go } = useMxologist();
  const { t, lang } = useT();
  const api = useApi();

  const [recipe, setRecipe] = useState<ApiRecipe | null>(null);
  // Inventory match keyed by ingredientId (not name) so translated names don't break it.
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [ratingScore, setRatingScore] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [unit, setUnit] = useState<Unit>("ML");
  const [scoreType, setScoreType] = useState<"FIVE_STARS" | "ONE_TO_TEN">(
    "FIVE_STARS",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api<ApiRecipe>(`/recipes/${selectedId}`),
      api<ApiUserIngredient[]>("/ingredients/my-inventory"),
      api<ApiRating[]>("/ratings/mine"),
      api<ApiFavorite[]>("/favorites/mine"),
      api<{ measurementUnit: Unit; scoreType: "FIVE_STARS" | "ONE_TO_TEN" }>(
        "/settings",
      ),
    ])
      .then(([r, inv, ratings, favorites, settings]) => {
        if (cancelled) return;
        setRecipe(r);
        setOwnedIds(new Set(inv.map((i) => i.ingredientId)));
        setRatingScore(
          ratings.find((rt) => rt.recipeId === selectedId)?.score ?? 0,
        );
        setIsFavorite(favorites.some((f) => f.recipeId === selectedId));
        setUnit(settings.measurementUnit ?? "ML");
        setScoreType(settings.scoreType ?? "FIVE_STARS");
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
  }, [api, selectedId]);

  const has = useCallback(
    (ingredientId: string) => ownedIds.has(ingredientId),
    [ownedIds],
  );

  const submitRating = useCallback(
    // `displayVal` is in the user's scale (1–5 stars or 1–10); we store the
    // canonical 1–10 score (a star maps to star * 2).
    async (displayVal: number) => {
      if (!selectedId) return;
      const score = scoreType === "FIVE_STARS" ? displayVal * 2 : displayVal;
      const prev = ratingScore;
      setRatingScore(score); // optimistic
      try {
        await api("/ratings", {
          method: "POST",
          body: JSON.stringify({ recipeId: selectedId, score }),
        });
      } catch {
        setRatingScore(prev); // roll back on failure
      }
    },
    [api, selectedId, ratingScore, scoreType],
  );

  const toggleFavorite = useCallback(async () => {
    if (!selectedId) return;
    const next = !isFavorite;
    setIsFavorite(next); // optimistic
    try {
      if (next) {
        await api("/favorites", {
          method: "POST",
          body: JSON.stringify({ recipeId: selectedId }),
        });
      } else {
        await api(`/favorites/${selectedId}`, { method: "DELETE" });
      }
    } catch {
      setIsFavorite(!next); // roll back on failure
    }
  }, [api, selectedId, isFavorite]);

  const addIngredient = useCallback(
    async (ingredientId: string) => {
      // Optimistic — reflect it immediately, roll back if the call fails.
      setOwnedIds((prev) => new Set(prev).add(ingredientId));
      try {
        await api("/ingredients/my-inventory", {
          method: "POST",
          body: JSON.stringify({ ingredientId }),
        });
      } catch {
        setOwnedIds((prev) => {
          const next = new Set(prev);
          next.delete(ingredientId);
          return next;
        });
      }
    },
    [api],
  );

  if (!selectedId) return null;

  if (loading && !recipe) {
    return <RecipeDetailSkeleton />;
  }

  if (error && !recipe) {
    return (
      <div>
        <div
          onClick={() => go("make")}
          style={{
            display: "inline-flex",
            gap: 8,
            fontSize: 12,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(201,165,92,.85)",
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          ← {t("detail.back")}
        </div>
        <div style={{ color: tokens.almostText }}>
          {t("detail.error", { e: error ?? "" })}
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  const d = recipeToCard(recipe, lang);
  // Rating display is in the user's scale; storage stays canonical 1–10.
  const maxUnits = scoreType === "FIVE_STARS" ? 5 : 10;
  const displayValue =
    scoreType === "FIVE_STARS" ? Math.round(ratingScore / 2) : ratingScore;
  const shown = hoverStar || displayValue;

  return (
    <div>
      <div
        onClick={() => go("make")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "rgba(201,165,92,.85)",
          cursor: "pointer",
          marginBottom: 26,
        }}
      >
        ← Back to the menu
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 34,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div>
          <div
            style={{
              position: "relative",
              aspectRatio: "3 / 4",
              border: "1px solid rgba(201,165,92,.4)",
              borderRadius: 6,
              overflow: "hidden",
              background:
                "repeating-linear-gradient(135deg,rgba(201,165,92,.07) 0 11px,rgba(0,0,0,.2) 11px 22px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(circle at 50% 42%, rgba(${d.rgb},.45), transparent 62%)`,
              }}
            />
            <div style={{ position: "relative", textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-poiret)",
                  fontSize: 88,
                  color: d.accent,
                  textShadow: `0 0 40px rgba(${d.rgb},.6)`,
                  lineHeight: 1,
                }}
              >
                {d.mono}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-jost)",
                  fontSize: 10,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "rgba(150,164,190,.55)",
                  marginTop: 14,
                }}
              >
                {t("detail.photo")}
              </div>
            </div>
            <DrinkImage
              src={d.imageUrl}
              alt={d.name}
              sizes="(max-width: 720px) 90vw, 340px"
            />
          </div>

          <div style={{ ...glassCard(), padding: 24, marginTop: 18 }}>
            <div style={{ ...eyebrow(".24em", 11), marginBottom: 12 }}>
              {t("detail.rate")}
            </div>
            {scoreType === "FIVE_STARS" ? (
              <div
                onMouseLeave={() => setHoverStar(0)}
                style={{ display: "flex", gap: 6 }}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    onClick={() => submitRating(n)}
                    onMouseEnter={() => setHoverStar(n)}
                    style={{
                      fontSize: 30,
                      cursor: "pointer",
                      lineHeight: 1,
                      transition: ".15s",
                      ...(n <= shown
                        ? {
                            color: "#e8d199",
                            textShadow: "0 0 14px rgba(227,201,135,.6)",
                          }
                        : { color: "rgba(201,165,92,.35)" }),
                    }}
                  >
                    {n <= shown ? "★" : "☆"}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid rgba(201,165,92,.35)",
                  borderRadius: 4,
                  padding: "11px 16px",
                  background: "rgba(0,0,0,.25)",
                  width: 130,
                }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={ratingScore > 0 ? String(ratingScore) : ""}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 2);
                    let v = digits === "" ? 0 : Number(digits);
                    if (v > 10) v = 10;
                    setRatingScore(v); // optimistic; persisted on blur
                  }}
                  onBlur={() => {
                    if (ratingScore >= 1 && ratingScore <= 10)
                      submitRating(ratingScore);
                  }}
                  placeholder="—"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    color: "#eef1f7",
                    fontFamily: "var(--font-jost)",
                    fontSize: 16,
                    fontWeight: 300,
                    textAlign: "center",
                    fontVariantNumeric: "tabular-nums",
                    outline: "none",
                  }}
                />
                <span
                  style={{
                    flex: "none",
                    whiteSpace: "nowrap",
                    fontSize: 11,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(150,164,190,.6)",
                  }}
                >
                  / 10
                </span>
              </div>
            )}
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "rgba(214,222,238,.75)",
                marginTop: 12,
              }}
            >
              {displayValue > 0
                ? t("detail.rated", { x: displayValue, y: maxUnits })
                : t("detail.rateHint")}
            </div>
            {displayValue > 0 && (
              <div
                onClick={() => go("rec")}
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: tokens.textOnGold,
                  background: tokens.goldGrad,
                  padding: "10px 18px",
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              >
                {t("detail.updatedPicks")} →
              </div>
            )}
          </div>

          <div
            onClick={toggleFavorite}
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "13px 18px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              transition: ".2s",
              border: isFavorite
                ? "1px solid rgba(227,201,135,.55)"
                : "1px solid rgba(201,165,92,.3)",
              background: isFavorite ? "rgba(227,201,135,.1)" : "transparent",
              color: isFavorite ? "#e8d199" : "rgba(201,165,92,.85)",
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>
              {isFavorite ? "★" : "☆"}
            </span>
            {isFavorite ? t("detail.favorited") : t("detail.favorite")}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div style={eyebrow(".3em")}>{d.base}</div>
          <h2
            style={{
              fontFamily: "var(--font-poiret)",
              fontWeight: 400,
              fontSize: 54,
              margin: "6px 0 0",
              color: tokens.textPrimary,
              lineHeight: 1,
            }}
          >
            {d.name}
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginTop: 16,
            }}
          >
            {d.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 11,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: tokens.brass,
                  border: "1px solid rgba(201,165,92,.35)",
                  borderRadius: 20,
                  padding: "4px 12px",
                }}
              >
                {t(`flavor.${tag}` as I18nKey)}
              </span>
            ))}
            <span
              style={{
                fontSize: 11,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(150,164,190,.8)",
                border: "1px solid rgba(201,165,92,.18)",
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              {t("detail.glass", { glass: d.glass })}
            </span>
          </div>

          {dividerHeader(t("detail.ingredients"))}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {d.ingredients.map((i) => {
              const have = has(i.id);
              return (
                <div
                  key={i.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    padding: "12px 4px",
                    borderBottom: "1px solid rgba(201,165,92,.1)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        flex: "none",
                        ...(have
                          ? {
                              background: tokens.readyGreen,
                              boxShadow: "0 0 8px #9fb86a",
                            }
                          : {
                              background: "transparent",
                              border: "1px solid rgba(216,146,79,.6)",
                            }),
                      }}
                    />
                    <span
                      style={{
                        fontSize: 15,
                        color: have ? tokens.textBody : "rgba(214,222,238,.55)",
                      }}
                    >
                      {i.n}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "rgba(150,164,190,.85)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatMeasure(i.quantityMl, i.note, i.m, unit, lang)}
                    </span>
                    {!have && (
                      <AddChip
                        onClick={() => addIngredient(i.id)}
                        label={t("detail.add")}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {dividerHeader(t("detail.method"))}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {d.steps.map((text, idx) => (
              <div
                key={idx}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-poiret)",
                    fontSize: 22,
                    color: tokens.brass,
                    lineHeight: 1,
                    flex: "none",
                    width: 30,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: "rgba(214,222,238,.85)",
                    fontWeight: 300,
                  }}
                >
                  {text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
