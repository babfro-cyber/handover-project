"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f3eb] px-6 py-10 text-[#2d2418]">
      <div className="w-full max-w-xl rounded-[28px] border border-[#ded4c4] bg-white px-8 py-10 shadow-[0_18px_50px_rgba(52,43,28,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#756854]">
          Application error
        </p>
        <h1 className="mt-4 text-3xl font-semibold">The page could not finish loading.</h1>
        <p className="mt-4 text-base leading-7 text-[#5d503f]">
          Try refreshing this page. If the issue persists, open the health route to confirm the deployment is reachable.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-[#7a6a4e] px-5 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-[#ded4c4] px-5 py-3 text-sm font-semibold text-[#2d2418]"
          >
            Back to home
          </Link>
          <Link
            href="/health"
            className="rounded-2xl border border-[#ded4c4] px-5 py-3 text-sm font-semibold text-[#2d2418]"
          >
            Open /health
          </Link>
        </div>
      </div>
    </main>
  );
}
