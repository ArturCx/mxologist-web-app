import { Show } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Mxologist</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Tell us which bottles you have, and we&apos;ll tell you what you can
        shake up tonight.
      </p>

      <Show when="signed-out">
        <p className="text-sm text-zinc-500">
          Sign in to build your bar and get recommendations.
        </p>
      </Show>

      <Show when="signed-in">
        <Link
          href="/bar"
          className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Go to my bar
        </Link>
      </Show>
    </main>
  );
}
