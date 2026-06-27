"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import type {
  ApiIngredient,
  ApiUserIngredient,
  MatchesResponse,
} from "@/lib/mxologist/api-types";
import {
  eyebrow,
  glassCard,
  goldButton,
  headline,
  rule,
  tokens,
} from "@/lib/mxologist/design";
import { useMxologist } from "../store";
import HoverDiv from "../Hover";

// Display order for the IngredientCategory enum; labels come from i18n.
const CAT_ORDER = [
  "SPIRIT",
  "LIQUEUR",
  "MIXER",
  "SYRUP",
  "BITTER",
  "GARNISH",
  "OTHER",
] as const;

// Remove (×) glyph on an owned chip — hovers to danger red.
function RemoveX({ onClick }: { onClick: () => void }) {
  const [on, setOn] = useState(false);
  return (
    <span
      onClick={onClick}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      style={{
        cursor: "pointer",
        color: on ? "#b23a4e" : "rgba(150,164,190,.55)",
        fontSize: 15,
        lineHeight: 1,
        padding: "0 2px",
      }}
    >
      ×
    </span>
  );
}

export default function MyBar() {
  const { search, setSearch, go } = useMxologist();
  const { t } = useT();
  const catLabel = (cat: string) => t(`cat.${cat}` as I18nKey);
  const api = useApi();

  const [catalog, setCatalog] = useState<ApiIngredient[]>([]);
  const [owned, setOwned] = useState<ApiUserIngredient[]>([]);
  const [readyCount, setReadyCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load: catalog + the user's inventory + how many drinks are ready.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<ApiIngredient[]>("/ingredients/catalog"),
      api<ApiUserIngredient[]>("/ingredients/my-inventory"),
      api<MatchesResponse>("/recipes/matches?pageSize=1"),
    ])
      .then(([cat, inv, matches]) => {
        if (cancelled) return;
        setCatalog(cat);
        setOwned(inv);
        setReadyCount(matches.canMake.total);
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

  // Keep the "drinks ready" stat fresh after the inventory changes.
  const refreshReadyCount = useCallback(() => {
    api<MatchesResponse>("/recipes/matches?pageSize=1")
      .then((m) => setReadyCount(m.canMake.total))
      .catch(() => {});
  }, [api]);

  const ownedIds = new Set(owned.map((o) => o.ingredientId));

  const addIngredient = useCallback(
    async (ing: ApiIngredient) => {
      // Optimistic-ish: append, then reconcile the ready stat.
      try {
        const created = await api<ApiUserIngredient>("/ingredients/my-inventory", {
          method: "POST",
          body: JSON.stringify({ ingredientId: ing.id }),
        });
        setOwned((prev) =>
          prev.some((o) => o.ingredientId === created.ingredientId)
            ? prev
            : [created, ...prev],
        );
        refreshReadyCount();
      } catch (err) {
        setError(err instanceof Error ? err.message : t("bar.errAdd"));
      }
    },
    [api, refreshReadyCount],
  );

  const removeIngredient = useCallback(
    async (ingredientId: string) => {
      const prev = owned;
      setOwned((cur) => cur.filter((o) => o.ingredientId !== ingredientId));
      try {
        await api(`/ingredients/my-inventory/${ingredientId}`, {
          method: "DELETE",
        });
        refreshReadyCount();
      } catch (err) {
        setOwned(prev); // roll back on failure
        setError(err instanceof Error ? err.message : t("bar.errRemove"));
      }
    },
    [api, owned, refreshReadyCount],
  );

  const q = search.trim().toLowerCase();
  const addResults = q
    ? catalog
        .filter((c) => !ownedIds.has(c.id) && c.name.toLowerCase().includes(q))
        .slice(0, 24)
    : [];
  const noResults = q.length > 0 && addResults.length === 0;

  const inventoryGroups = CAT_ORDER.map((cat) => ({
    name: cat,
    items: owned
      .filter((o) => o.ingredient.category === cat)
      .sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name)),
  })).filter((g) => g.items.length > 0);

  const barStat =
    readyCount === null
      ? t("bar.stat", { n: owned.length })
      : t("bar.statReady", { n: owned.length, r: readyCount });

  return (
    <div>
      <div style={eyebrow()}>{t("bar.eyebrow")}</div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginTop: 8,
        }}
      >
        <h2 style={headline(46)}>{t("bar.title")}</h2>
        <div style={{ fontSize: 14, color: "rgba(214,222,238,.7)" }}>
          {loading ? t("bar.loading") : barStat}
        </div>
      </div>

      {error && (
        <div style={{ color: tokens.almostText, marginTop: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Add-ingredient panel */}
      <div style={{ ...glassCard(), padding: 24, marginTop: 26 }}>
        <div style={{ ...eyebrow(".24em", 11), marginBottom: 12 }}>
          {t("bar.addIngredient")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid rgba(201,165,92,.35)",
            borderRadius: 4,
            padding: "12px 16px",
            background: "rgba(0,0,0,.25)",
          }}
        >
          <span style={{ color: "rgba(201,165,92,.7)", fontSize: 16 }}>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("bar.searchPlaceholder")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: tokens.textBody,
              fontFamily: "var(--font-jost)",
              fontSize: 15,
              fontWeight: 300,
              outline: "none",
            }}
          />
        </div>

        {addResults.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 9,
              marginTop: 14,
            }}
          >
            {addResults.map((r) => (
              <HoverDiv
                key={r.id}
                onClick={() => addIngredient(r)}
                base={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  border: "1px solid rgba(201,165,92,.3)",
                  borderRadius: 30,
                  cursor: "pointer",
                  background: "rgba(201,165,92,.05)",
                  fontSize: 13,
                  color: tokens.textBody,
                }}
                hover={{
                  border: "1px solid #e3c987",
                  background: "rgba(201,165,92,.14)",
                }}
              >
                <span style={{ color: tokens.readyGreen, fontWeight: 500 }}>
                  ＋
                </span>
                {r.name}
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgba(150,164,190,.6)",
                  }}
                >
                  {catLabel(r.category)}
                </span>
              </HoverDiv>
            ))}
          </div>
        )}

        {noResults && (
          <div
            style={{
              marginTop: 14,
              fontSize: 13,
              color: "rgba(150,164,190,.6)",
            }}
          >
            {t("bar.noMatch", { q: search })}
          </div>
        )}
      </div>

      {/* Inventory groups */}
      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {!loading && owned.length === 0 && (
          <div style={{ color: "rgba(214,222,238,.6)", fontSize: 14 }}>
            {t("bar.empty")}
          </div>
        )}
        {inventoryGroups.map((g) => (
          <div key={g.name}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div style={{ ...eyebrow(".22em", 12), whiteSpace: "nowrap" }}>
                {catLabel(g.name)}
              </div>
              <div style={rule()} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {g.items.map((it) => (
                <div
                  key={it.ingredientId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 12px 9px 15px",
                    border: "1px solid rgba(201,165,92,.22)",
                    borderRadius: 4,
                    background:
                      "var(--glass-bg, linear-gradient(160deg,rgba(38,52,82,.45),rgba(14,20,34,.4)))",
                    fontSize: 14,
                    color: tokens.textBody,
                  }}
                >
                  {it.ingredient.name}
                  <RemoveX onClick={() => removeIngredient(it.ingredientId)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        onClick={() => go("make")}
        style={{
          ...goldButton(),
          marginTop: 40,
          padding: "15px 32px",
          letterSpacing: ".18em",
          fontSize: 12,
          boxShadow: "0 8px 24px rgba(201,165,92,.25)",
        }}
      >
        {t("bar.seeWhatICanMake")} &nbsp;→
      </div>
    </div>
  );
}
