"use client";

import Link from "next/link";
import { useState } from "react";

const board = {
  name: "Reading",
  mode: "Journey collection",
  status: "Public Board",
  image: "/reading.jpg",
  summary:
    "Books, reflections, and proof that long pages are turning into personal progress.",
};

const stats = [
  { label: "Brags", value: "3" },
  { label: "Journeys", value: "3" },
  { label: "Done", value: "1" },
];

const boardViews = ["Brags", "Journeys"] as const;

const journeys = [
  {
    title: "War and Peace",
    href: "/journeys/war-and-peace",
    status: "Completed",
    progress: "3 brags",
    description:
      "A full arc from intimidation to completion, with milestones worth keeping visible.",
    meta: ["Started", "Page 100", "Finished"],
  },
  {
    title: "1984",
    href: "#",
    status: "Planned",
    progress: "0 brags",
    description:
      "A future reading journey for notes, reactions, and the moments that make the book stick.",
    meta: ["Classic", "Fiction", "Next up"],
  },
  {
    title: "Animal Farm",
    href: "#",
    status: "Planned",
    progress: "0 brags",
    description:
      "A smaller journey that can still collect proof, reflections, and the best takeaways.",
    meta: ["Short read", "Fiction", "Queued"],
  },
];

const recentBrags = [
  {
    marker: "Finished",
    title: "Completed War and Peace",
    source: "Journey: War and Peace",
    body: "Finished the whole book and proved the scary goal could actually become a closed loop.",
  },
  {
    marker: "Page 100",
    title: "Found the rhythm",
    source: "Journey: War and Peace",
    body: "Got through the first hundred pages and started building momentum with the characters.",
  },
  {
    marker: "Today",
    title: "Read 30 minutes before bed",
    source: "Standalone brag",
    body: "A small proof moment directly on the Reading board, separate from any specific book journey.",
  },
];

export default function ReadingPage() {
  const [activeView, setActiveView] =
    useState<(typeof boardViews)[number]>("Brags");

  return (
    <main className="min-h-screen bg-[#fbfbfb] text-zinc-950">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-4 sm:px-6 sm:py-6">
        <nav className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-zinc-950"
          >
            BRAG
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-950"
          >
            Back
          </Link>
        </nav>

        <header className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
          <section className="relative h-44 overflow-hidden sm:h-52">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${board.image})` }}
            />
            <div className="absolute inset-x-0 bottom-0 h-3/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_42%,black_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.16)_42%,rgba(0,0,0,0.82)_100%)]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-6">
              <p className="w-fit rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-md">
                Brag Board
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {board.name}
              </h1>
            </div>
          </section>

          <section className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {board.status}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-600">
                {board.mode}
              </span>
            </div>

            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
              {board.summary}
            </p>

            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="border-r border-zinc-200 p-3 text-center last:border-r-0 sm:p-4"
                >
                  <p className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-500 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </header>

        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
              R
            </div>
            <button className="min-h-11 flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 text-left text-sm font-semibold text-zinc-500 transition hover:border-zinc-300 hover:bg-white">
              What did you prove today?
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4">
            <button className="rounded-full bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-zinc-800">
              + Brag
            </button>
            <button className="rounded-full border border-zinc-200 px-4 py-3 text-sm font-black text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50">
              + Journey
            </button>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex w-full rounded-2xl bg-zinc-100 p-1 sm:w-fit">
              {boardViews.map((view) => {
                const isActive = activeView === view;

                return (
                  <button
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                    className={`min-h-10 flex-1 rounded-xl px-4 text-sm font-black transition sm:min-w-32 ${
                      isActive
                        ? "bg-white text-zinc-950 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-950"
                    }`}
                  >
                    {view}
                  </button>
                );
              })}
            </div>
            <p className="text-sm font-semibold text-zinc-500">
              {activeView === "Brags"
                ? "All proof moments on this board"
                : "Bigger arcs inside this board"}
            </p>
          </div>

          {activeView === "Brags" ? (
            <div className="space-y-3">
              {recentBrags.map((brag) => (
                <article
                  key={brag.title}
                  className="rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white">
                      R
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-zinc-950">
                          {brag.title}
                        </p>
                        <span className="text-sm font-semibold text-zinc-400">
                          {brag.marker}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {brag.source}
                      </p>
                      <p className="mt-3 leading-7 text-zinc-600">
                        {brag.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {journeys.map((journey) => (
                <Link
                  key={journey.title}
                  href={journey.href}
                  className="group block rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                          {journey.status}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                          {journey.progress}
                        </span>
                      </div>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-zinc-950">
                        {journey.title}
                      </h3>
                      <p className="mt-2 max-w-2xl leading-7 text-zinc-600">
                        {journey.description}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-lg font-semibold text-white transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {journey.meta.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-semibold text-zinc-500"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
