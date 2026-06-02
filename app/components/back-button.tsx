"use client";

import { useRouter } from "next/navigation";

export function BackButton({ label = "Back" }: { label?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        ←
      </span>
      {label}
    </button>
  );
}
