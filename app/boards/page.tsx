import Link from "next/link";
import { AppNav } from "../components/app-nav";

const boards = [
  {
    name: "Gym",
    count: "12 brags",
    detail: "No active journey",
    privacy: "Private",
    href: "#",
    color: "bg-[#14532d]",
    size: "large",
  },
  {
    name: "Music",
    count: "1 journey",
    detail: "New Album?? 👀",
    privacy: "Public",
    href: "/tiles/music",
    color: "bg-[#18181b]",
    size: "medium",
  },
  {
    name: "Reading",
    count: "3 journeys",
    detail: "War and Peace, essays, classics",
    privacy: "Public",
    href: "/tiles/reading",
    color: "bg-[#4338ca]",
    size: "small",
  },
  {
    name: "Food",
    count: "5 brags",
    detail: "Sourdough Bread journey",
    privacy: "Public",
    href: "/tiles/food",
    color: "bg-[#9f1239]",
    size: "small",
  },
  {
    name: "Career",
    count: "2 journeys",
    detail: "Dashboard build, internship search",
    privacy: "Public",
    href: "#",
    color: "bg-[#7c2d12]",
    size: "medium",
  },
  {
    name: "Faith",
    count: "8 brags",
    detail: "General practice",
    privacy: "Private",
    href: "#",
    color: "bg-[#0f766e]",
    size: "medium",
  },
] as const;

const boardTileSizes = {
  small: {
    tile: "col-span-1 row-span-1",
    body: "p-4 sm:p-5",
    title: "text-2xl sm:text-3xl",
    detail: "line-clamp-2 text-xs sm:text-sm",
    arrow: "h-9 w-9 text-base",
  },
  medium: {
    tile: "col-span-2 row-span-1",
    body: "p-5 sm:p-6",
    title: "text-3xl sm:text-4xl",
    detail: "line-clamp-2 text-sm",
    arrow: "h-10 w-10 text-lg sm:h-11 sm:w-11",
  },
  large: {
    tile: "col-span-2 row-span-2",
    body: "p-6 sm:p-7",
    title: "text-4xl sm:text-5xl",
    detail: "line-clamp-3 text-sm sm:text-base",
    arrow: "h-11 w-11 text-lg sm:h-12 sm:w-12",
  },
} as const;

export default function BoardsPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Boards
          </p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Your life domains.
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-zinc-600">
                Boards hold general brags. Add journeys when a board has a
                specific goal worth tracking over time.
              </p>
            </div>

            <Link
              href="/boards/new"
              className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                +
              </span>
              Create Board
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 [grid-auto-flow:dense] [grid-auto-rows:minmax(0,calc((100vw-2.5rem-0.75rem)/2))] sm:gap-4 sm:[grid-auto-rows:minmax(0,calc((100vw-4rem-1rem)/2))] lg:grid-cols-4 lg:[grid-auto-rows:minmax(0,calc((min(100vw,80rem)-5rem-3rem)/4))]">
          {boards.map((board) => {
            const size = boardTileSizes[board.size];

            return (
              <Link
                key={board.name}
                href={board.href}
                className={`group min-w-0 overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-sm shadow-zinc-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:rounded-[1.5rem] ${size.tile}`}
              >
                <article
                  className={`flex h-full min-h-0 flex-col justify-between ${size.body}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[0.7rem] font-black text-zinc-600 sm:px-3 sm:text-xs">
                        {board.count}
                      </span>
                      {board.privacy === "Private" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-[0.7rem] font-black text-white sm:px-3 sm:text-xs">
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <rect x="5" y="10" width="14" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                          </svg>
                          Private
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`grid shrink-0 place-items-center rounded-full ${board.color} ${size.arrow} font-semibold text-white transition group-hover:translate-x-1`}
                    >
                      →
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2
                      className={`${size.title} break-words font-black leading-none tracking-tight`}
                    >
                      {board.name}
                    </h2>
                    <p
                      className={`mt-2 font-bold leading-5 text-zinc-500 sm:mt-3 ${size.detail}`}
                    >
                      {board.detail}
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
        </section>
      </section>
    </main>
  );
}
