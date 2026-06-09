"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AppNav } from "../../components/app-nav";

const entries = [
  {
    id: 4,
    marker: "Rough sequence",
    date: "May 30, 2026",
    title: "The album has a shape",
    body: "Put the demos in an order. Not finished, not polished, but the arc is starting to make sense.",
  },
  {
    id: 3,
    marker: "Demo 06",
    date: "Apr 15, 2026",
    title: "Hook finally landed",
    body: "Rewrote the chorus three times and the last pass actually felt like the song talking back.",
  },
  {
    id: 2,
    marker: "Demo 03",
    date: "Mar 28, 2026",
    title: "Found the sound",
    body: "The drums finally stopped fighting the guitar part. First time the project felt like it had a palette.",
  },
  {
    id: 1,
    marker: "Demo 01",
    date: "Mar 12, 2026",
    title: "Voice memo became a verse",
    body: "Started with a melody into the phone and built enough around it to know there is a song here.",
  },
];

export default function NewAlbumPage() {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    function close() { setOpenMenuId(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
        <AppNav active="Boards" />
        <Link
          href="/tiles/music"
          className="mt-5 inline-block text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Music
        </Link>

        {/* Hero */}
        <header className="mt-5 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div
            className="relative flex min-h-64 flex-col justify-end bg-cover bg-center p-7 text-white md:p-9"
            style={{ backgroundImage: "url(/music.png)" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.18)_40%,rgba(0,0,0,0.82)_100%)]" />
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                  Music
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                  Active arc · {entries.length} brags
                </span>
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                New Album?? 👀
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-white/80">
                A running proof trail for demos, rough mixes, and the tiny decisions that turn sketches into something real.
              </p>
            </div>
          </div>
        </header>

        {/* Timeline */}
        <section className="mt-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Timeline</h2>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Most recent first
              </p>
            </div>
            <button
              type="button"
              className="quick-brag-btn relative h-10 overflow-hidden rounded-full px-5 text-xs font-black"
            >
              <span className="quick-brag-idle-shimmer" aria-hidden="true" />
              + Add Brag
            </button>
          </div>

          {/* The actual timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[1.1rem] top-3 bottom-3 w-px bg-zinc-200" />

            <div className="flex flex-col gap-5">
              {entries.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-5">
                  {/* Dot */}
                  <div className="relative z-10 mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-zinc-200">
                    <div className={`h-3 w-3 rounded-full ${index === 0 ? "bg-zinc-950" : "bg-zinc-300"}`} />
                  </div>

                  {/* Card */}
                  <article className="flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-600">
                            {entry.marker}
                          </span>
                          <time className="text-xs font-semibold text-zinc-400">
                            {entry.date}
                          </time>
                        </div>
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === entry.id ? null : entry.id);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                            aria-label="Entry options"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          </button>
                          {openMenuId === entry.id && (
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-36 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="flex w-full items-center px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="flex w-full items-center border-t border-zinc-100 px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="mt-3 text-xl font-black tracking-tight">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        {entry.body}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>

            {/* Origin cap at bottom of line */}
            <div className="relative mt-5 flex gap-5">
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-zinc-200" />
              </div>
              <div className="flex items-center pb-1">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                  Arc started · Mar 12, 2026
                </p>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
