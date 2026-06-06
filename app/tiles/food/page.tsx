"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { BragAttachments } from "../../components/brag-attachments";
import { AppNav } from "../../components/app-nav";
import { useBrags } from "../../lib/brags";

const board = {
  name: "Food",
  mode: "General brags + journey",
  status: "Public Board",
  image: "/food.png",
  summary:
    "Cooking reps, meals worth remembering, and the little proof moments that make a kitchen feel less random.",
};

const boardViews = ["Brags", "Journeys"] as const;

const journeys = [
  {
    title: "Sourdough Bread",
    href: "/journeys/sourdough-bread",
    status: "Active",
    progress: "3 brags",
    description:
      "A patient little arc for starter care, better crust, and learning by baking the next loaf.",
    meta: ["Starter", "Fermentation", "Crust"],
  },
];

export default function FoodPage() {
  const [activeView, setActiveView] =
    useState<(typeof boardViews)[number]>("Brags");
  const brags = useBrags();
  const boardBrags = brags.filter((brag) => brag.board === board.name);
  const stats = [
    { label: "Brags", value: String(boardBrags.length) },
    { label: "Journeys", value: "1" },
    { label: "Pins", value: "87" },
  ];

  return (
    <main className="min-h-screen bg-[#fbfbfb] text-zinc-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/boards"
          className="w-fit text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Boards
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
          <section className="relative h-48 overflow-hidden sm:h-56">
            <Image
              src={board.image}
              alt="Food board cover"
              fill
              sizes="(min-width: 768px) 896px, 100vw"
              className="object-cover"
              priority
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
                  <p className="text-2xl font-black tracking-tight sm:text-3xl">
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
          <div className="mb-4 flex w-full rounded-2xl bg-zinc-100 p-1 sm:w-fit">
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

          {activeView === "Brags" ? (
            <div className="grid gap-3 sm:grid-cols-2">
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
                        sizes="(min-width: 640px) 420px, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black">
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
                      <h3 className="mt-4 text-2xl font-black tracking-tight">
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
