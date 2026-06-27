// Base color themes (Mxologist Base Options handoff). Only the app background
// gradient (`bg`) changes globally — the brass + glass system stays constant.
// The other fields drive the live preview card in Settings.
export type ThemeDef = {
  key: string;
  label: string;
  bg: string; // full-app background gradient
  navBg: string; // sticky header tint
  cardBg: string;
  logo: string;
  title: string;
  panel: string; // glass card tint (also used app-wide via --glass-bg)
  dot: string;
  btn: string;
};

export const DEFAULT_THEME = "midnight";

export const THEMES: ThemeDef[] = [
  {
    key: "midnight",
    label: "Midnight Ink",
    bg: "radial-gradient(125% 85% at 50% -12%, #16203a 0%, #0c1322 42%, #070b14 100%)",
    navBg: "linear-gradient(180deg,rgba(12,19,34,.92),rgba(12,19,34,.6))",
    cardBg:
      "radial-gradient(120% 90% at 50% -10%, #16203a 0%, #0c1322 45%, #070b14 100%)",
    logo: "#eef1f7",
    title: "#f3f5fa",
    panel: "linear-gradient(160deg,rgba(38,52,82,.55),rgba(14,20,34,.45))",
    dot: "#7fb6c9",
    btn: "#0c1322",
  },
  {
    key: "graphite",
    label: "Graphite",
    bg: "radial-gradient(125% 85% at 50% -12%, #20232a 0%, #14161b 42%, #0c0d11 100%)",
    navBg: "linear-gradient(180deg,rgba(20,22,27,.92),rgba(20,22,27,.6))",
    cardBg:
      "radial-gradient(120% 90% at 50% -10%, #20232a 0%, #14161b 45%, #0c0d11 100%)",
    logo: "#f0f0f2",
    title: "#f3f3f5",
    panel: "linear-gradient(160deg,rgba(48,51,58,.55),rgba(18,20,24,.45))",
    dot: "#9fb86a",
    btn: "#14161b",
  },
  {
    key: "aubergine",
    label: "Aubergine",
    bg: "radial-gradient(125% 85% at 50% -12%, #2a142b 0%, #190d1c 42%, #0e070f 100%)",
    navBg: "linear-gradient(180deg,rgba(25,13,28,.92),rgba(25,13,28,.6))",
    cardBg:
      "radial-gradient(120% 90% at 50% -10%, #2a142b 0%, #190d1c 45%, #0e070f 100%)",
    logo: "#f4eef4",
    title: "#f6f0f6",
    panel: "linear-gradient(160deg,rgba(60,34,62,.55),rgba(24,12,26,.45))",
    dot: "#c98fb4",
    btn: "#190d1c",
  },
  {
    key: "emerald",
    label: "Forest Emerald",
    bg: "radial-gradient(125% 85% at 50% -12%, #0e2a20 0%, #081c15 42%, #04100c 100%)",
    navBg: "linear-gradient(180deg,rgba(8,28,21,.92),rgba(8,28,21,.6))",
    cardBg:
      "radial-gradient(120% 90% at 50% -10%, #0e2a20 0%, #081c15 45%, #04100c 100%)",
    logo: "#eef5f1",
    title: "#f1f7f3",
    panel: "linear-gradient(160deg,rgba(24,58,46,.55),rgba(10,28,21,.45))",
    dot: "#7fc9a3",
    btn: "#081c15",
  },
  {
    key: "espresso",
    label: "Espresso",
    bg: "radial-gradient(125% 85% at 50% -12%, #2c1e11 0%, #19110a 42%, #0c0805 100%)",
    navBg: "linear-gradient(180deg,rgba(25,17,10,.92),rgba(25,17,10,.6))",
    cardBg:
      "radial-gradient(120% 90% at 50% -10%, #2c1e11 0%, #19110a 45%, #0c0805 100%)",
    logo: "#f3ead7",
    title: "#f6edd9",
    panel: "linear-gradient(160deg,rgba(46,36,24,.55),rgba(20,15,10,.42))",
    dot: "#9fb86a",
    btn: "#19110a",
  },
];
