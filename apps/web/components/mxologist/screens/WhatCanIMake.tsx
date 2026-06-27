"use client";

import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/lib/api";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import { recipeToCard, type CardDrink } from "@/lib/mxologist/adapt";
import type {
  MatchesResponse,
  Page,
  ApiMatch,
} from "@/lib/mxologist/api-types";
import {
  diamond,
  eyebrow,
  glassCard,
  glowLayer,
  headline,
  monoStyle,
  monoTile,
  tokens,
} from "@/lib/mxologist/design";
import { useMxologist, type Filter } from "../store";
import HoverDiv from "../Hover";
import { MatchesSkeleton } from "../Skeleton";
import DrinkImage from "../DrinkImage";

const PAGE_SIZE = 6;

const FILTER_PILLS: [Filter, I18nKey][] = [
  ["all", "make.filterAll"],
  ["ready", "make.filterReady"],
  ["almost", "make.filterAlmost"],
];

function MonoTile({ d, size = 62 }: { d: CardDrink; size?: number }) {
  return (
    <div style={monoTile(size)}>
      <div style={glowLayer(d)} />
      <div style={monoStyle(d, size === 62 ? 24 : 20)}>{d.mono}</div>
      <DrinkImage src={d.imageUrl} alt={d.name} />
    </div>
  );
}

const cardBase = { ...glassCard(), padding: 20, cursor: "pointer" } as const;
const cardHover = {
  transform: "translateY(-5px)",
  boxShadow: "0 24px 54px rgba(0,0,0,.55)",
};

function CardHead({ d }: { d: CardDrink }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <MonoTile d={d} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-poiret)",
            fontSize: 23,
            color: tokens.textPrimary,
            lineHeight: 1.05,
          }}
        >
          {d.name}
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(150,164,190,.75)",
            marginTop: 4,
          }}
        >
          {d.glass}
        </div>
      </div>
    </div>
  );
}

function ReadyCard({
  d,
  readyLabel,
  recipeLabel,
  onOpen,
}: {
  d: CardDrink;
  readyLabel: string;
  recipeLabel: string;
  onOpen: () => void;
}) {
  return (
    <HoverDiv
      onClick={onOpen}
      base={{
        ...cardBase,
        transition:
          "transform .25s ease,border-color .25s ease,box-shadow .25s ease",
      }}
      hover={{ ...cardHover, border: "1px solid rgba(227,201,135,.55)" }}
    >
      <CardHead d={d} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
        {d.tags.map((t) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              color: tokens.brass,
              border: "1px solid rgba(201,165,92,.32)",
              borderRadius: 20,
              padding: "3px 9px",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid rgba(201,165,92,.14)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: tokens.readyGreen,
              boxShadow: "0 0 8px #9fb86a",
            }}
          />
          <span
            style={{
              fontSize: 11,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: tokens.readyGreen,
            }}
          >
            {readyLabel}
          </span>
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "rgba(201,165,92,.8)",
          }}
        >
          {recipeLabel} →
        </span>
      </div>
    </HoverDiv>
  );
}

function AlmostCard({
  d,
  missingNames,
  missLabel,
  onOpen,
}: {
  d: CardDrink;
  missingNames: string[];
  missLabel: string;
  onOpen: () => void;
}) {
  return (
    <HoverDiv
      onClick={onOpen}
      base={{
        ...cardBase,
        transition:
          "transform .25s ease,border-color .25s ease,box-shadow .25s ease",
      }}
      hover={{ ...cardHover, border: "1px solid rgba(216,146,79,.5)" }}
    >
      <CardHead d={d} />
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid rgba(201,165,92,.14)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: tokens.almostText,
            marginBottom: 8,
          }}
        >
          {missLabel}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {missingNames.map((m) => (
            <span
              key={m}
              style={{
                fontSize: 12,
                color: "#ecb98c",
                border: "1px dashed rgba(199,106,53,.55)",
                borderRadius: 4,
                padding: "3px 9px",
                background: "rgba(199,106,53,.09)",
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </HoverDiv>
  );
}

function SectionHeader({
  color,
  labelColor,
  label,
  count,
  ruleColor,
}: {
  color: string;
  labelColor?: string;
  label: string;
  count: number;
  ruleColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        margin: "36px 0 20px",
      }}
    >
      <div style={diamond(color)} />
      <div
        style={{
          fontSize: 13,
          letterSpacing: ".26em",
          textTransform: "uppercase",
          color: labelColor ?? color,
          whiteSpace: "nowrap",
        }}
      >
        {label} &nbsp;·&nbsp; {count}
      </div>
      <div
        style={{
          height: 1,
          flex: 1,
          background: `linear-gradient(90deg,${ruleColor},transparent)`,
        }}
      />
    </div>
  );
}

// Prev / "Page X of Y" / Next footer for a section.
function Pager({
  page,
  totalPages,
  prevLabel,
  nextLabel,
  pageText,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  prevLabel: string;
  nextLabel: string;
  pageText: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  const btn = (enabled: boolean) =>
    ({
      padding: "8px 16px",
      borderRadius: 3,
      fontSize: 11,
      letterSpacing: ".14em",
      textTransform: "uppercase",
      border: "1px solid rgba(201,165,92,.3)",
      color: enabled ? tokens.textBody : "rgba(214,222,238,.3)",
      background: "transparent",
      cursor: enabled ? "pointer" : "default",
      userSelect: "none",
    }) as const;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        marginTop: 22,
      }}
    >
      <div style={btn(page > 1)} onClick={page > 1 ? onPrev : undefined}>
        ← {prevLabel}
      </div>
      <div
        style={{
          fontSize: 11,
          letterSpacing: ".16em",
          textTransform: "uppercase",
          color: "rgba(214,222,238,.6)",
        }}
      >
        {pageText}
      </div>
      <div
        style={btn(page < totalPages)}
        onClick={page < totalPages ? onNext : undefined}
      >
        {nextLabel} →
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
  gap: 18,
} as const;

export default function WhatCanIMake() {
  const { filter, setFilter, open, go } = useMxologist();
  const api = useApi();
  const { t, lang } = useT();

  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyPage, setReadyPage] = useState(1);
  const [almostPage, setAlmostPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<MatchesResponse>(
      `/recipes/matches?readyPage=${readyPage}&almostPage=${almostPage}&pageSize=${PAGE_SIZE}`,
    )
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
        }
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
  }, [api, readyPage, almostPage]);

  const renderCards = useCallback(
    (pageData: Page<ApiMatch>, kind: "ready" | "almost") =>
      pageData.items.map((m) => {
        const card = recipeToCard(m.recipe, lang);
        const d = {
          ...card,
          tags: card.tags.map((tag) => t(`flavor.${tag}` as I18nKey)),
        };
        return kind === "ready" ? (
          <ReadyCard
            key={d.id}
            d={d}
            readyLabel={t("make.readyToPour")}
            recipeLabel={t("make.recipe")}
            onOpen={() => open(d.id)}
          />
        ) : (
          <AlmostCard
            key={d.id}
            d={d}
            missingNames={m.missingIngredients.map((i) =>
              lang === "PT" && i.namePt ? i.namePt : i.name,
            )}
            missLabel={
              m.missingIngredients.length === 1
                ? t("make.missing_one")
                : t("make.missing_other")
            }
            onOpen={() => open(d.id)}
          />
        );
      }),
    [open, t],
  );

  const ready = data?.canMake;
  const almost = data?.almostThere;
  const showReady =
    (filter === "all" || filter === "ready") && (ready?.total ?? 0) > 0;
  const showAlmost =
    (filter === "all" || filter === "almost") && (almost?.total ?? 0) > 0;
  const empty =
    !error &&
    !loading &&
    (ready?.total ?? 0) === 0 &&
    (almost?.total ?? 0) === 0;

  return (
    <div>
      <div style={eyebrow()}>{t("make.eyebrow")}</div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
          marginTop: 8,
        }}
      >
        <h2 style={headline(46)}>{t("make.title")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {FILTER_PILLS.map(([key, label]) => {
            const active = filter === key;
            return (
              <div
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 30,
                  fontSize: 11,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: ".2s",
                  ...(active
                    ? {
                        color: tokens.textOnGold,
                        background: tokens.goldGrad,
                        border: "1px solid #efdca8",
                      }
                    : {
                        color: "rgba(214,222,238,.75)",
                        background: "transparent",
                        border: "1px solid rgba(201,165,92,.3)",
                      }),
                }}
              >
                {t(label)}
              </div>
            );
          })}
        </div>
      </div>

      {loading && !data && <MatchesSkeleton />}

      {error && (
        <div style={{ color: tokens.almostText, marginTop: 36 }}>
          {t("make.error", { e: error })}
        </div>
      )}

      {empty && (
        <div style={{ color: "rgba(214,222,238,.6)", marginTop: 36 }}>
          {t("make.emptyPre")}{" "}
          <span
            onClick={() => go("bar")}
            style={{ color: tokens.brass, cursor: "pointer" }}
          >
            {t("make.emptyLink")}
          </span>
          .
        </div>
      )}

      {showReady && ready && (
        <>
          <SectionHeader
            color={tokens.readyGreen}
            label={t("make.readyToMake")}
            count={ready.total}
            ruleColor="rgba(159,184,106,.4)"
          />
          <div style={grid}>{renderCards(ready, "ready")}</div>
          <Pager
            page={ready.page}
            totalPages={ready.totalPages}
            prevLabel={t("make.prev")}
            nextLabel={t("make.next")}
            pageText={t("make.pageOf", { p: ready.page, t: ready.totalPages })}
            onPrev={() => setReadyPage((p) => Math.max(1, p - 1))}
            onNext={() => setReadyPage((p) => p + 1)}
          />
        </>
      )}

      {showAlmost && almost && (
        <>
          <SectionHeader
            color={tokens.almostAccent}
            labelColor={tokens.almostText}
            label={t("make.almostThere")}
            count={almost.total}
            ruleColor="rgba(199,106,53,.4)"
          />
          <div style={grid}>{renderCards(almost, "almost")}</div>
          <Pager
            page={almost.page}
            totalPages={almost.totalPages}
            prevLabel={t("make.prev")}
            nextLabel={t("make.next")}
            pageText={t("make.pageOf", {
              p: almost.page,
              t: almost.totalPages,
            })}
            onPrev={() => setAlmostPage((p) => Math.max(1, p - 1))}
            onNext={() => setAlmostPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}
