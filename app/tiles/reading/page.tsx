"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BragAttachments } from "../../components/brag-attachments";
import { AppNav } from "../../components/app-nav";
import { QuickBragLink } from "../../components/quick-brag-link";
import { useBrags } from "../../lib/brags";

const board = {
  name: "Reading",
  mode: "Journey collection",
  status: "Public Board",
  image: "/reading.jpg",
  summary:
    "Books, reflections, and proof that long pages are turning into personal progress.",
};

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

export default function ReadingPage() {
  const [activeView, setActiveView] =
    useState<(typeof boardViews)[number]>("Brags");
  const brags = useBrags();
  const boardBrags = brags.filter((brag) => brag.board === board.name);
  const stats = [
    { label: "Brags", value: String(boardBrags.length) },
    { label: "Journeys", value: "3" },
    { label: "Done", value: "1" },
  ];

  return (
    <main className="min-h-screen bg-[#fbfbfb] text-zinc-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/boards"
          className="w-fit text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Boards
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
          <section className="relative h-36 overflow-hidden sm:h-44">
            <QuickBragLink />
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${board.image})` }}
            />
            <div className="absolute inset-x-0 bottom-0 h-3/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_42%,black_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.16)_42%,rgba(0,0,0,0.82)_100%)]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4 text-white sm:p-5">
              <p className="w-fit rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-md">
                Brag Board
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                {board.name}
              </h1>
            </div>
          </section>

          <section className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                {board.status}
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-600">
                {board.mode}
              </span>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              {board.summary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-semibold text-zinc-500"
                >
                  <p className="font-black text-zinc-950">
                    {stat.value}
                  </p>
                  <p>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </header>

        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm">
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
              {boardBrags.map((brag) => (
                <article
                  key={brag.id}
                  className="overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white transition hover:bg-zinc-50"
                >
                  {brag.attachments?.length ? (
                    <BragAttachments attachments={brag.attachments} />
                  ) : brag.type === "video" && brag.image ? (
                    <div className="aspect-[4/3] bg-zinc-950">
                      <video
                        src={brag.image}
                        controls
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : brag.image ? (
                    <div className="relative aspect-[4/3] bg-zinc-100">
                      <Image
                        src={brag.image}
                        alt={brag.title ?? `${brag.board} brag`}
                        fill
                        sizes="(min-width: 640px) 768px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start gap-3 p-4 sm:p-5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white">
                      R
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-zinc-950">
                          {brag.title ?? "Proof moment"}
                        </p>
                        <span className="text-sm font-semibold text-zinc-400">
                          {brag.time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        {brag.source}
                      </p>
                      {brag.text ? (
                        <p className="mt-3 leading-7 text-zinc-600">
                          {brag.text}
                        </p>
                      ) : null}
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
                  className="group block rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition hover:bg-zinc-50"
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
