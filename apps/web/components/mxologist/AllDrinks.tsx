"use client";

// "See all" entry point for the What Can I Make screen: a floating banner
// pinned to the bottom of the viewport, and the modal it opens listing every
// drink in the catalog (searchable, regardless of the user's inventory).
import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { recipeToCard } from "@/lib/mxologist/adapt";
import type { ApiRecipe } from "@/lib/mxologist/api-types";
import {
  eyebrow,
  glassCard,
  glowLayer,
  goldButton,
  headline,
  monoStyle,
  monoTile,
  tokens,
} from "@/lib/mxologist/design";
import DrinkImage from "./DrinkImage";
import HoverDiv from "./Hover";
import Skeleton from "./Skeleton";

export function AllDrinksBanner({ onOpen }: { onOpen: () => void }) {
  const { t } = useT();
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        padding: "0 14px",
        pointerEvents: "none",
        animation: "fadeUp .5s ease both",
      }}
    >
      <div
        style={{
          ...glassCard("Heavy"),
          borderRadius: 40,
          border: `1px solid ${tokens.brassBorderStrong}`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "8px 8px 8px 22px",
          maxWidth: "100%",
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            fontSize: 12,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: tokens.textBody,
            minWidth: 0,
          }}
        >
          {t("all.banner")}
        </span>
        <button
          type="button"
          onClick={onOpen}
          style={{
            ...goldButton(),
            fontFamily: "inherit",
            fontSize: 11,
            letterSpacing: ".18em",
            padding: "10px 20px",
            borderRadius: 30,
            whiteSpace: "nowrap",
            flex: "none",
          }}
        >
          {t("all.seeAll")}
        </button>
      </div>
    </div>
  );
}

function RowSkeletons() {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: 10 }}
        >
          <Skeleton width={54} height={54} radius={4} />
          <div style={{ flex: 1 }}>
            <Skeleton width="55%" height={18} />
            <Skeleton width="30%" height={10} style={{ marginTop: 8 }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function AllDrinksModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const api = useApi();
  const { t, lang } = useT();
  const [recipes, setRecipes] = useState<ApiRecipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<ApiRecipe[]>("/recipes")
      .then((res) => {
        if (!cancelled) setRecipes(res);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  // Esc closes; the page behind must not scroll while the modal is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Sorted in the active language (PT names differ from the API's EN order).
  const drinks = useMemo(
    () =>
      (recipes ?? [])
        .map((r) => recipeToCard(r, lang))
        .sort((a, b) => a.name.localeCompare(b.name, lang.toLowerCase())),
    [recipes, lang],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? drinks.filter((d) => d.name.toLowerCase().includes(q)) : drinks;
  }, [drinks, query]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(10px, 3vw, 28px)",
        background: "rgba(4,7,14,.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("all.title")}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...glassCard("Heavy"),
          background:
            "var(--glass-bg, linear-gradient(160deg,rgba(28,39,64,.96),rgba(10,15,27,.96)))",
          width: "100%",
          maxWidth: 680,
          height: "min(760px, 100%)",
          display: "flex",
          flexDirection: "column",
          animation: "fadeUp .3s ease both",
        }}
      >
        <div
          style={{
            padding: "22px 24px 16px",
            borderBottom: "1px solid rgba(201,165,92,.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={eyebrow(".3em", 11)}>
                {recipes
                  ? t("all.count", { n: visible.length })
                  : t("all.eyebrow")}
              </div>
              <h3 style={{ ...headline(32), marginTop: 6 }}>
                {t("all.title")}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("all.close")}
              style={{
                width: 36,
                height: 36,
                flex: "none",
                borderRadius: "50%",
                border: "1px solid rgba(201,165,92,.3)",
                background: "transparent",
                color: tokens.textBody,
                fontSize: 18,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("all.search")}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "11px 14px",
              background: "rgba(0,0,0,.25)",
              border: "1px solid rgba(201,165,92,.3)",
              borderRadius: 4,
              color: tokens.textBody,
              fontFamily: "var(--font-jost)",
              fontSize: 15,
              fontWeight: 300,
              outline: "none",
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 14px" }}>
          {error && (
            <div style={{ color: tokens.almostText, padding: 10 }}>
              {t("all.error", { e: error })}
            </div>
          )}
          {!recipes && !error && <RowSkeletons />}
          {recipes && visible.length === 0 && (
            <div style={{ color: "rgba(214,222,238,.6)", padding: 10 }}>
              {t("all.empty")}
            </div>
          )}
          {visible.map((d) => (
            <HoverDiv
              key={d.id}
              onClick={() => onSelect(d.id)}
              base={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: 10,
                borderRadius: 6,
                border: "1px solid transparent",
                cursor: "pointer",
                transition: "background .2s ease,border-color .2s ease",
              }}
              hover={{
                background: "rgba(201,165,92,.08)",
                border: "1px solid rgba(201,165,92,.3)",
              }}
            >
              <div style={monoTile(54)}>
                <div style={glowLayer(d)} />
                <div style={monoStyle(d, 20)}>{d.mono}</div>
                <DrinkImage src={d.imageUrl} alt={d.name} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-poiret)",
                    fontSize: 20,
                    color: tokens.textPrimary,
                    lineHeight: 1.1,
                  }}
                >
                  {d.name}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(150,164,190,.75)",
                    marginTop: 4,
                  }}
                >
                  {d.glass} &nbsp;·&nbsp; {d.base}
                </div>
              </div>
              <span style={{ color: "rgba(201,165,92,.8)", fontSize: 14 }}>
                →
              </span>
            </HoverDiv>
          ))}
        </div>
      </div>
    </div>
  );
}
