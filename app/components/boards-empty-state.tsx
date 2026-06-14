import Link from "next/link";

export function BoardsEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      {/* Little guy standing on stacked cards */}
      <div className="relative h-52 w-56">
        {/* The little guy — arms up, celebrating */}
        <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2">
          <svg viewBox="0 0 80 72" fill="none" className="h-16 w-auto" aria-hidden="true">
            {/* Left arm up */}
            <line x1="28" y1="44" x2="10" y2="26" stroke="#18181b" strokeWidth="6" strokeLinecap="round" />
            {/* Right arm up */}
            <line x1="52" y1="44" x2="70" y2="26" strokeWidth="6" stroke="#18181b" strokeLinecap="round" />
            {/* Left hand */}
            <circle cx="10" cy="25" r="5" fill="#18181b" />
            {/* Right hand */}
            <circle cx="70" cy="25" r="5" fill="#18181b" />
            {/* Sparkle left */}
            <line x1="2" y1="14" x2="6" y2="18" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <line x1="0" y1="19" x2="5" y2="19" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <line x1="2" y1="24" x2="6" y2="20" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            {/* Sparkle right */}
            <line x1="78" y1="14" x2="74" y2="18" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <line x1="80" y1="19" x2="75" y2="19" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            <line x1="78" y1="24" x2="74" y2="20" stroke="#18181b" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
            {/* Body */}
            <rect x="28" y="38" width="24" height="20" rx="9" fill="#18181b" />
            {/* Head */}
            <circle cx="40" cy="20" r="16" fill="#18181b" />
            {/* Eyes */}
            <circle cx="35" cy="17" r="2.5" fill="white" />
            <circle cx="45" cy="17" r="2.5" fill="white" />
            {/* Smile */}
            <path d="M34 25 Q40 31 46 25" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Legs */}
            <line x1="35" y1="58" x2="30" y2="70" stroke="#18181b" strokeWidth="6" strokeLinecap="round" />
            <line x1="45" y1="58" x2="50" y2="70" stroke="#18181b" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>

        {/* Stacked cards — whole stack is the link */}
        <Link
          href="/boards/new"
          aria-label="Create a board"
          className="absolute bottom-0 left-0 right-0 h-36 transition-transform duration-200 hover:scale-105"
        >
          <div className="absolute inset-0 -rotate-6 rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm" />
          <div className="absolute inset-0 -rotate-2 rounded-2xl border border-zinc-200 bg-zinc-50 shadow-sm" />
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white shadow-sm transition-colors hover:border-zinc-950 hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
              <svg className="h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      <h2 className="mt-10 text-3xl font-black tracking-tight text-zinc-950">
        What are you proving?
      </h2>
      <p className="mx-auto mt-3 max-w-xs text-sm font-semibold leading-6 text-zinc-500">
        No boards yet — create one for every corner of your life worth documenting.
      </p>
    </div>
  );
}
