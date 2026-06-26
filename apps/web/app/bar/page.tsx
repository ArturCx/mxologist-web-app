"use client";

// Protected route (enforced by proxy.ts). Demonstrates the API client:
// useApi() injects the Clerk Bearer token into the call to the NestJS API.
import { useEffect, useState } from "react";
import { useApi } from "@/lib/api";

type Ingredient = {
  id: string;
  name: string;
  category: string;
};

export default function BarPage() {
  const api = useApi();
  const [catalog, setCatalog] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api<Ingredient[]>("/ingredients/catalog")
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-semibold tracking-tight">Ingredient catalog</h1>

      {loading && <p className="text-zinc-500">Loading…</p>}

      {error && (
        <p className="text-sm text-red-500">
          Couldn&apos;t load the catalog: {error}
          <br />
          <span className="text-zinc-500">
            (Expected until the database is connected and seeded.)
          </span>
        </p>
      )}

      {!loading && !error && (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {catalog.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between py-2"
            >
              <span>{ingredient.name}</span>
              <span className="text-xs uppercase tracking-wide text-zinc-500">
                {ingredient.category}
              </span>
            </li>
          ))}
          {catalog.length === 0 && (
            <li className="py-2 text-zinc-500">No ingredients yet.</li>
          )}
        </ul>
      )}
    </main>
  );
}
