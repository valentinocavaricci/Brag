"use client";

import Link from "next/link";
import { useState } from "react";

export function QuickBragLink() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Link
      href="/brags/new"
      onClick={(event) => {
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
      }}
      className={`board-quick-brag absolute right-4 top-4 z-20 inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-white/92 text-base font-black text-zinc-950 shadow-sm shadow-zinc-950/20 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 ${
        isOpen ? "w-36 gap-2 px-4" : "w-11 px-0"
      }`}
      aria-label="Create a quick brag"
    >
      <span className="shrink-0">B</span>
      <span
        className={`whitespace-nowrap text-sm transition duration-300 ${
          isOpen
            ? "max-w-24 translate-x-0 opacity-100"
            : "max-w-0 translate-x-2 opacity-0"
        }`}
      >
        Quick Brag
      </span>
    </Link>
  );
}
