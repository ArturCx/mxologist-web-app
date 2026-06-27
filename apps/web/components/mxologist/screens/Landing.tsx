"use client";

import { SignInButton } from "@clerk/nextjs";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import { tokens } from "@/lib/mxologist/design";

const STEPS: [string, I18nKey][] = [
  ["01", "landing.step1"],
  ["02", "landing.step2"],
  ["03", "landing.step3"],
];

export default function Landing() {
  const { t } = useT();
  return (
    <div
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: ".42em",
          textTransform: "uppercase",
          color: tokens.brass,
          marginBottom: 26,
        }}
      >
        {t("landing.est")}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mxologist-wordmark-white-cream.svg"
        alt="Mxologist"
        style={{
          height: "clamp(56px,11vw,120px)",
          width: "auto",
          margin: 0,
          filter: "drop-shadow(0 0 40px rgba(217,147,58,.22))",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          margin: "24px 0 18px",
        }}
      >
        <div
          style={{
            height: 1,
            width: 54,
            background: "linear-gradient(90deg,transparent,#c9a55c)",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            background: tokens.brass,
            transform: "rotate(45deg)",
            boxShadow: "0 0 12px rgba(201,165,92,.7)",
          }}
        />
        <div
          style={{
            height: 1,
            width: 54,
            background: "linear-gradient(270deg,transparent,#c9a55c)",
          }}
        />
      </div>

      <div
        style={{
          fontFamily: "var(--font-poiret)",
          fontSize: "clamp(22px,3.4vw,32px)",
          color: "#e3c987",
          letterSpacing: ".02em",
        }}
      >
        {t("landing.tagline")}
      </div>

      <p
        style={{
          maxWidth: 520,
          fontSize: 16,
          lineHeight: 1.7,
          color: "rgba(214,222,238,.72)",
          margin: "22px 0 38px",
          fontWeight: 300,
        }}
      >
        {t("landing.blurb")}
      </p>

      {/* Redirects to the Clerk sign-in page; on success the user returns
          to "/" already authenticated and the app chrome takes over. */}
      <SignInButton mode="redirect" forceRedirectUrl="/" signUpForceRedirectUrl="/">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 38px",
            fontWeight: 500,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            fontSize: 13,
            color: tokens.textOnGold,
            background: tokens.goldGrad,
            border: "1px solid #efdca8",
            borderRadius: 3,
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(201,165,92,.3)",
            animation: "glowPulse 4.5s ease-in-out infinite",
          }}
        >
          {t("landing.stepInside")} &nbsp;→
        </div>
      </SignInButton>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 48,
          marginTop: 64,
        }}
      >
        {STEPS.map(([num, caption]) => (
          <div key={num}>
            <div
              style={{
                fontFamily: "var(--font-poiret)",
                fontSize: 30,
                color: tokens.brass,
              }}
            >
              {num}
            </div>
            <div
              style={{
                fontSize: 13,
                letterSpacing: ".04em",
                color: "rgba(214,222,238,.66)",
                marginTop: 6,
                lineHeight: 1.5,
                // Keep each caption on a single line (PT captions are longer
                // than EN and were wrapping inside the old fixed maxWidth).
                whiteSpace: "nowrap",
              }}
            >
              {t(caption)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
