"use client";

import { useState } from "react";
import { AppNav } from "../components/app-nav";

const boardRows = [
  {
    title: "🏋️ Fitness",
    boards: [
      {
        name: "Maya Chen",
        board: "Marathon Build",
        brags: "27 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Leo Carter",
        board: "Strength Season",
        brags: "19 brags",
        color: "bg-[#14532d]",
      },
      {
        name: "Nico Lane",
        board: "5K Comeback",
        brags: "12 brags",
        color: "bg-[#155e75]",
      },
      {
        name: "Bella Cruz",
        board: "Mobility Work",
        brags: "22 brags",
        color: "bg-[#6d28d9]",
      },
      {
        name: "Dante Ford",
        board: "Boxing Basics",
        brags: "16 brags",
        color: "bg-[#854d0e]",
      },
    ],
  },
  {
    title: "🍳 Food",
    boards: [
      {
        name: "Elena Rossi",
        board: "Sunday Meal Prep",
        brags: "18 brags",
        color: "bg-[#9f1239]",
      },
      {
        name: "Marco Reed",
        board: "Protein Kitchen",
        brags: "25 brags",
        color: "bg-[#7c2d12]",
      },
      {
        name: "Ari Stone",
        board: "Cooking Basics",
        brags: "11 brags",
        color: "bg-[#be123c]",
      },
      {
        name: "Mia Torres",
        board: "No Takeout Month",
        brags: "21 brags",
        color: "bg-[#365314]",
      },
      {
        name: "Gianna Park",
        board: "Family Recipes",
        brags: "13 brags",
        color: "bg-[#86198f]",
      },
    ],
  },
  {
    title: "📚 Education",
    boards: [
      {
        name: "Ari Stone",
        board: "52 Books",
        brags: "31 brags",
        color: "bg-[#4338ca]",
      },
      {
        name: "Sofia Alvarez",
        board: "Spanish Daily",
        brags: "28 brags",
        color: "bg-[#1e3a8a]",
      },
      {
        name: "Anthony Diaz",
        board: "Math Refresh",
        brags: "10 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Luca Vela",
        board: "Design Studies",
        brags: "17 brags",
        color: "bg-[#854d0e]",
      },
      {
        name: "Maya Chen",
        board: "History Notes",
        brags: "14 brags",
        color: "bg-[#14532d]",
      },
    ],
  },
  {
    title: "💼 Career",
    boards: [
      {
        name: "Jordan Ellis",
        board: "Founder Notes",
        brags: "14 brags",
        color: "bg-[#7c2d12]",
      },
      {
        name: "Nico Lane",
        board: "Portfolio Push",
        brags: "20 brags",
        color: "bg-[#1e3a8a]",
      },
      {
        name: "Elena Rossi",
        board: "Interview Prep",
        brags: "8 brags",
        color: "bg-[#4338ca]",
      },
      {
        name: "Dante Ford",
        board: "Sales Reps",
        brags: "23 brags",
        color: "bg-[#155e75]",
      },
      {
        name: "Bella Cruz",
        board: "Client Wins",
        brags: "15 brags",
        color: "bg-[#6d28d9]",
      },
    ],
  },
  {
    title: "🕊️ Faith & Wellness",
    boards: [
      {
        name: "Sofia Alvarez",
        board: "Quiet Mornings",
        brags: "9 brags",
        color: "bg-[#14532d]",
      },
      {
        name: "Gianna Park",
        board: "Gratitude Log",
        brags: "24 brags",
        color: "bg-[#86198f]",
      },
      {
        name: "Mia Torres",
        board: "Sleep Reset",
        brags: "12 brags",
        color: "bg-[#365314]",
      },
      {
        name: "Anthony Diaz",
        board: "Prayer Walks",
        brags: "16 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Leo Carter",
        board: "Mindful Minutes",
        brags: "18 brags",
        color: "bg-[#854d0e]",
      },
    ],
  },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filteredRows = query
    ? boardRows
        .map((row) => ({
          ...row,
          boards: row.boards.filter(
            (item) =>
              item.board.toLowerCase().includes(query) ||
              item.name.toLowerCase().includes(query),
          ),
        }))
        .filter((row) => row.boards.length > 0)
    : boardRows;

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Explore" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Explore
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Find boards worth following.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Discover public progress from people building discipline, skill,
            faith, fitness, and momentum.
          </p>

          <div className="mt-8 max-w-2xl rounded-full border border-zinc-200 bg-white px-2 py-1.5 shadow-md shadow-zinc-200">
            <div className="flex items-center gap-3 px-3">
              <svg className="h-5 w-5 shrink-0 text-zinc-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pin progress, not people..."
                className="flex-1 bg-transparent py-3 text-base font-semibold text-zinc-700 outline-none placeholder:font-medium placeholder:text-zinc-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="flex flex-col gap-9">
          {filteredRows.length === 0 && (
            <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm shadow-zinc-200">
              <p className="text-xl font-black text-zinc-950">No boards match &ldquo;{search}&rdquo;</p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">Try a different keyword.</p>
            </div>
          )}
          {filteredRows.map((row) => (
            <section key={row.title}>
              <div className="mb-3 flex items-center justify-between gap-4 px-1 sm:px-4">
                <h2 className="text-3xl font-black tracking-tight text-zinc-950">
                  {row.title}
                </h2>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-500 shadow-sm shadow-zinc-200"
                >
                  View all
                </button>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-4">
                  {row.boards.map((item) => (
                    <article
                      key={`${row.title}-${item.name}-${item.board}`}
                      className="group flex h-64 w-64 shrink-0 flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:w-72"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`grid h-14 w-14 place-items-center rounded-2xl ${item.color} text-lg font-black text-white shadow-sm shadow-zinc-200 transition group-hover:rotate-3 group-hover:scale-105`}
                        >
                          {item.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                          {item.brags}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-zinc-500">
                          {item.name}
                        </p>
                        <h3 className="mt-2 text-3xl font-black leading-none tracking-tight text-zinc-950">
                          {item.board}
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}
