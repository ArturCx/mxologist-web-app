"use client";

// Single client-side store for the whole Mxologist experience: screen
// routing + inventory/ratings/search/filter/hover, plus the derived
// makeability and recommendation logic (ported from the prototype's
// Component class). Frontend-only — no persistence or API.
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DRINKS, FLAVORS, type Drink, type Flavor } from "@/lib/mxologist/data";

export type Screen = "landing" | "bar" | "make" | "detail" | "rec" | "settings";
export type Filter = "all" | "ready" | "almost";

type Profile = Record<Flavor, number>;

export type MxologistStore = {
  // state
  screen: Screen;
  selectedId: string | null;
  inventory: string[];
  ratings: Record<string, number>;
  search: string;
  filter: Filter;
  hover: number;
  // actions
  enter: () => void;
  enterLanding: () => void;
  go: (s: Screen) => void;
  open: (id: string) => void;
  addIng: (n: string) => void;
  removeIng: (n: string) => void;
  rate: (id: string, score: number) => void;
  setSearch: (q: string) => void;
  setFilter: (f: Filter) => void;
  setHover: (n: number) => void;
  // derived
  has: (n: string) => boolean;
  missing: (d: Drink) => Drink["ingredients"];
  profile: () => Profile;
  score: (d: Drink, p: Profile) => number;
  selectedDrink: Drink | null;
};

const Ctx = createContext<MxologistStore | null>(null);

export function MxologistProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<string[]>([
    "Bourbon",
    "Gin",
    "Campari",
    "Sweet Vermouth",
    "Angostura Bitters",
    "Sugar",
    "Orange",
    "Lemon",
    "Lime",
    "Tonic Water",
  ]);
  const [ratings, setRatings] = useState<Record<string, number>>({
    negroni: 5,
    "old-fashioned": 4,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [hover, setHover] = useState(0);

  const has = useCallback(
    (n: string) =>
      inventory.some((i) => i.toLowerCase() === n.toLowerCase()),
    [inventory],
  );

  const missing = useCallback(
    (d: Drink) => d.ingredients.filter((x) => !has(x.n)),
    [has],
  );

  const addIng = useCallback(
    (n: string) =>
      setInventory((inv) =>
        inv.some((i) => i.toLowerCase() === n.toLowerCase())
          ? inv
          : [...inv, n],
      ),
    [],
  );

  const removeIng = useCallback(
    (n: string) => setInventory((inv) => inv.filter((i) => i !== n)),
    [],
  );

  const rate = useCallback(
    (id: string, score: number) =>
      setRatings((r) => ({ ...r, [id]: score })),
    [],
  );

  const enter = useCallback(() => setScreen("bar"), []);
  const enterLanding = useCallback(() => setScreen("landing"), []);
  const go = useCallback((s: Screen) => setScreen(s), []);
  const open = useCallback((id: string) => {
    setSelectedId(id);
    setHover(0);
    setScreen("detail");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  // Centered weighting: 5★ = +2, 3★ = 0, 1★ = -2, so disliked flavors
  // actively get pushed down.
  const profile = useCallback((): Profile => {
    const p = Object.fromEntries(FLAVORS.map((f) => [f, 0])) as Profile;
    Object.entries(ratings).forEach(([id, st]) => {
      const d = DRINKS.find((x) => x.id === id);
      if (!d) return;
      const w = st - 3;
      Object.entries(d.vector).forEach(([f, v]) => {
        p[f as Flavor] += (v ?? 0) * w;
      });
    });
    return p;
  }, [ratings]);

  const score = useCallback((d: Drink, p: Profile) => {
    let s = 0;
    Object.entries(d.vector).forEach(([f, v]) => {
      s += (v ?? 0) * (p[f as Flavor] || 0);
    });
    return s;
  }, []);

  const selectedDrink = useMemo(
    () => DRINKS.find((x) => x.id === selectedId) ?? null,
    [selectedId],
  );

  const value: MxologistStore = {
    screen,
    selectedId,
    inventory,
    ratings,
    search,
    filter,
    hover,
    enter,
    enterLanding,
    go,
    open,
    addIng,
    removeIng,
    rate,
    setSearch,
    setFilter,
    setHover,
    has,
    missing,
    profile,
    score,
    selectedDrink,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMxologist(): MxologistStore {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useMxologist must be used within <MxologistProvider>");
  return ctx;
}
