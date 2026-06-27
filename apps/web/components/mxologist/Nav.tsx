"use client";

import { UserButton } from "@clerk/nextjs";
import { useT } from "@/lib/i18n";
import type { I18nKey } from "@/lib/i18n/en";
import { tokens } from "@/lib/mxologist/design";
import { useMxologist, type Screen } from "./store";

const NAV_DEFS: [Screen, I18nKey][] = [
  ["bar", "nav.myBar"],
  ["make", "nav.whatCanIMake"],
  ["rec", "nav.recommended"],
  ["settings", "nav.settings"],
];

// Sticky top nav shared across all in-app screens.
export default function Nav() {
  const { screen, go } = useMxologist();
  const { t } = useT();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        background: tokens.navBg,
        borderBottom: "1px solid rgba(201,165,92,.24)",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "15px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div
          onClick={() => go("bar")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 9,
              height: 9,
              background: tokens.brass,
              transform: "rotate(45deg)",
              boxShadow: "0 0 10px rgba(201,165,92,.6)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mxologist-wordmark-white-cream.svg"
            alt="Mxologist"
            style={{ height: 38, width: "auto", display: "block", marginTop: 3 }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {NAV_DEFS.map(([key, label]) => {
            const active =
              screen === key || (key === "make" && screen === "detail");
            return (
              <div
                key={key}
                onClick={() => go(key)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 3,
                  fontSize: 12,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: ".2s",
                  whiteSpace: "nowrap",
                  ...(active
                    ? { color: tokens.textOnGold, background: tokens.goldGrad }
                    : { color: tokens.navInactive, background: "transparent" }),
                }}
              >
                {t(label)}
              </div>
            );
          })}
        </div>

        {/* Clerk account widget: avatar + dropdown with "Sign out".
            Signing out flips <SignedOut> on and returns the user to the
            landing page automatically. */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: {
                  width: 36,
                  height: 36,
                  border: "1px solid rgba(201,165,92,.5)",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
