"use client";

import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { FlagBR, FlagUS } from "@/components/mxologist/Flags";
import { useApi } from "@/lib/api";
import { useT, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { THEMES, type ThemeDef } from "@/lib/theme/themes";
import { eyebrow, glassCard, headline, tokens } from "@/lib/mxologist/design";
import { SettingsSkeleton } from "../Skeleton";

type Sex = "MALE" | "FEMALE" | "OTHER";
type MeasurementUnit = "OZ" | "ML";
type ScoreType = "FIVE_STARS" | "ONE_TO_TEN";

type Settings = {
  age: number | null;
  sex: Sex | null;
  measurementUnit: MeasurementUnit;
  scoreType: ScoreType;
};

const UNIT_OPTIONS: [MeasurementUnit, string][] = [
  ["OZ", "Oz"],
  ["ML", "mL"],
];

const LANG_OPTIONS: [Lang, string, ReactNode][] = [
  ["EN", "English", <FlagUS key="us" />],
  ["PT", "Português", <FlagBR key="br" />],
];

// Gold pill segment, matching the design handoff's segStyle().
const segStyle = (active: boolean): CSSProperties => ({
  padding: "8px 18px",
  borderRadius: 30,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: ".2s",
  whiteSpace: "nowrap",
  ...(active
    ? {
        color: "#0c1322",
        background: "linear-gradient(180deg,#e8d199,#c9a55c)",
        boxShadow: "0 4px 14px rgba(201,165,92,.3)",
      }
    : { color: "rgba(214,222,238,.78)", background: "transparent" }),
});

const pillWrap: CSSProperties = {
  display: "flex",
  gap: 0,
  border: "1px solid rgba(201,165,92,.35)",
  borderRadius: 30,
  padding: 4,
  background: "rgba(0,0,0,.25)",
};

// Like segStyle, but lays out a flag glyph alongside the label.
const flagSegStyle = (active: boolean): CSSProperties => ({
  ...segStyle(active),
  display: "flex",
  alignItems: "center",
  gap: 8,
});

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, string][];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={pillWrap}>
      {options.map(([val, label]) => (
        <div
          key={val}
          onClick={() => onChange(val)}
          style={segStyle(value === val)}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

// One settings row: label + description on the left, control on the right.
function Row({
  label,
  desc,
  align = "center",
  children,
}: {
  label: string;
  desc: string;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: align === "start" ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 15,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "#eef1f7",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(150,164,190,.7)",
            marginTop: 4,
          }}
        >
          {desc}
        </div>
      </div>
      {children}
    </div>
  );
}

const Divider = () => (
  <div
    style={{
      height: 1,
      background: "linear-gradient(90deg,rgba(201,165,92,.22),transparent)",
    }}
  />
);

// A live mini-preview of the app chrome under a given theme — the "Old
// Fashioned" sample card from the design handoff.
function ThemeCard({
  t,
  active,
  onClick,
}: {
  t: ThemeDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} style={{ flex: "none", cursor: "pointer" }}>
      <div
        style={{
          font: "500 11px/1 var(--font-jost)",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: active ? "#e3c987" : "rgba(150,164,190,.85)",
        }}
      >
        {t.label}
        {active && (
          <span
            style={{ fontSize: 9, letterSpacing: ".1em", color: "#9fb86a" }}
          >
            ◆ Active
          </span>
        )}
      </div>
      <div
        style={{
          flex: "none",
          width: 230,
          borderRadius: 9,
          overflow: "hidden",
          transition: ".2s",
          background: t.cardBg,
          boxShadow: active
            ? "0 0 0 2px #e8d199,0 0 0 5px rgba(201,165,92,.22),0 16px 38px rgba(0,0,0,.45)"
            : "0 0 0 1px rgba(201,165,92,.18),0 14px 34px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                background: "#c9a55c",
                transform: "rotate(45deg)",
                boxShadow: "0 0 9px rgba(201,165,92,.6)",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-poiret)",
                fontSize: 14,
                letterSpacing: ".16em",
                color: t.logo,
              }}
            >
              MXOLOGIST
            </div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-poiret)",
              fontSize: 22,
              color: t.title,
              marginTop: 12,
              lineHeight: 1,
            }}
          >
            Old Fashioned
          </div>
          <div
            style={{
              marginTop: 13,
              background: t.panel,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(201,165,92,.26)",
              borderRadius: 5,
              padding: 11,
              display: "flex",
              gap: 11,
              alignItems: "center",
              boxShadow: "0 10px 24px rgba(0,0,0,.35)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: 42,
                height: 42,
                flex: "none",
                border: "1px solid rgba(201,165,92,.4)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "rgba(0,0,0,.3)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 50% 45%, rgba(217,147,58,.5), transparent 68%)",
                }}
              />
              <div
                style={{
                  position: "relative",
                  fontFamily: "var(--font-poiret)",
                  fontSize: 17,
                  color: "#d9933a",
                }}
              >
                OF
              </div>
            </div>
            <div>
              <div style={{ display: "flex", gap: 5 }}>
                {["Boozy", "Bitter"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      font: "400 8px var(--font-jost)",
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "#c9a55c",
                      border: "1px solid rgba(201,165,92,.35)",
                      borderRadius: 20,
                      padding: "2px 7px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: t.dot,
                    boxShadow: `0 0 8px ${t.dot}`,
                    flex: "none",
                  }}
                />
                <span
                  style={{
                    font: "400 9px var(--font-jost)",
                    letterSpacing: ".12em",
                    textTransform: "uppercase",
                    color: t.dot,
                  }}
                >
                  Ready to pour
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 13,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              font: "500 10px var(--font-jost)",
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: t.btn,
              background: "linear-gradient(180deg,#e8d199,#c9a55c)",
              borderRadius: 3,
            }}
          >
            Step Inside →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const api = useApi();
  const { t, lang, setLang } = useT();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  useEffect(() => {
    let cancelled = false;
    api<Settings>("/settings")
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  // Persist a single field — optimistic, rolls back on failure.
  const save = useCallback(
    async (changes: Partial<Settings>) => {
      setSettings((prev) => (prev ? { ...prev, ...changes } : prev));
      setStatus("saving");
      try {
        await api("/settings", {
          method: "PATCH",
          body: JSON.stringify(changes),
        });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [api],
  );

  // Age is edited locally on each keystroke; only persisted on blur.
  const setAgeLocal = useCallback((digits: string) => {
    setSettings((prev) =>
      prev ? { ...prev, age: digits === "" ? null : Number(digits) } : prev,
    );
  }, []);

  if (loading) {
    return <SettingsSkeleton />;
  }
  if (!settings) {
    return (
      <div style={{ color: tokens.almostText }}>{t("settings.errLoad")}</div>
    );
  }

  const scorePreview =
    settings.scoreType === "FIVE_STARS"
      ? t("settings.score.previewStars")
      : t("settings.score.previewNumeric");

  const sexOptions: [Sex, string][] = [
    ["FEMALE", t("settings.sex.female")],
    ["MALE", t("settings.sex.male")],
    ["OTHER", t("settings.sex.other")],
  ];
  const scoreOptions: [ScoreType, string][] = [
    ["FIVE_STARS", t("settings.score.fiveStars")],
    ["ONE_TO_TEN", t("settings.score.oneToTen")],
  ];

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={eyebrow()}>{t("settings.eyebrow")}</div>
      <h2 style={{ ...headline(46), margin: "8px 0 0" }}>
        {t("settings.title")}
      </h2>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "rgba(214,222,238,.7)",
          margin: "14px 0 0",
          fontWeight: 300,
        }}
      >
        {t("settings.subtitle")}
        {status === "saving" && (
          <span style={{ color: tokens.brass }}> · {t("settings.saving")}</span>
        )}
        {status === "saved" && (
          <span style={{ color: tokens.readyGreen }}>
            {" "}
            · {t("settings.saved")}
          </span>
        )}
        {status === "error" && (
          <span style={{ color: tokens.almostText }}>
            {" "}
            · {t("settings.errSave")}
          </span>
        )}
      </p>

      <div
        style={{
          ...glassCard(),
          padding: 24,
          marginTop: 28,
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        {/* Age */}
        <Row label={t("settings.age.label")} desc={t("settings.age.desc")}>
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
              value={settings.age ?? ""}
              onChange={(e) =>
                setAgeLocal(e.target.value.replace(/\D/g, "").slice(0, 3))
              }
              onBlur={() => save({ age: settings.age })}
              placeholder="—"
              style={{
                width: "100%",
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
                fontSize: 11,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "rgba(150,164,190,.6)",
              }}
            >
              {t("settings.age.suffix")}
            </span>
          </div>
        </Row>

        <Divider />

        {/* Measurement Unit */}
        <Row label={t("settings.unit.label")} desc={t("settings.unit.desc")}>
          <PillGroup
            options={UNIT_OPTIONS}
            value={settings.measurementUnit}
            onChange={(measurementUnit) => save({ measurementUnit })}
          />
        </Row>

        <Divider />

        {/* Sex */}
        <Row label={t("settings.sex.label")} desc={t("settings.sex.desc")}>
          <PillGroup
            options={sexOptions}
            value={settings.sex}
            onChange={(sex) => save({ sex })}
          />
        </Row>

        <Divider />

        {/* Score Type */}
        <Row
          label={t("settings.score.label")}
          desc={t("settings.score.desc")}
          align="start"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 12,
            }}
          >
            <PillGroup
              options={scoreOptions}
              value={settings.scoreType}
              onChange={(scoreType) => save({ scoreType })}
            />
            <div
              style={{
                fontSize: 13,
                color: "rgba(214,222,238,.7)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {scorePreview}
            </div>
          </div>
        </Row>

        <Divider />

        {/* Language */}
        <Row label={t("settings.lang.label")} desc={t("settings.lang.desc")}>
          <div style={pillWrap}>
            {LANG_OPTIONS.map(([val, label, flag]) => (
              <div
                key={val}
                onClick={() => setLang(val)}
                style={flagSegStyle(lang === val)}
              >
                <span style={{ display: "inline-flex", lineHeight: 0 }}>
                  {flag}
                </span>
                {label}
              </div>
            ))}
          </div>
        </Row>

        <Divider />

        {/* Website Color — visual only for now */}
        <div>
          <div
            style={{
              fontSize: 15,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#eef1f7",
            }}
          >
            {t("settings.color.label")}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(150,164,190,.7)",
              marginTop: 4,
            }}
          >
            {t("settings.color.desc")}
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
              overflowX: "auto",
              padding: "18px 4px 8px",
              margin: "0 -4px",
            }}
          >
            {THEMES.map((th) => (
              <ThemeCard
                key={th.key}
                t={th}
                active={theme === th.key}
                onClick={() => setTheme(th.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
