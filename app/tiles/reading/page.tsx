"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { BragAttachments } from "../../components/brag-attachments";
import { AppNav } from "../../components/app-nav";
import { useBrags, useCheers, createBrag, formatBragDate } from "../../lib/brags";

const board = {
  name: "Reading",
  mode: "Arc collection",
  status: "Public Board",
  image: "/reading.jpg",
  summary:
    "Books, reflections, and proof that long pages are turning into personal progress.",
};

const boardViews = ["Brags", "Arcs"] as const;

const arcs = [
  {
    title: "War and Peace",
    href: "/arcs/war-and-peace",
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
      "A future reading arc for notes, reactions, and the moments that make the book stick.",
    meta: ["Classic", "Fiction", "Next up"],
  },
  {
    title: "Animal Farm",
    href: "#",
    status: "Planned",
    progress: "0 brags",
    description:
      "A smaller arc that can still collect proof, reflections, and the best takeaways.",
    meta: ["Short read", "Fiction", "Queued"],
  },
];

export default function ReadingPage() {
  const [activeView, setActiveView] =
    useState<(typeof boardViews)[number]>("Brags");
  const brags = useBrags();
  const boardBrags = brags.filter((b) => b.board === board.name);
  const { cheeredIds, toggleCheer } = useCheers();

  const [composeText, setComposeText] = useState("");
  const [composeFocused, setComposeFocused] = useState(false);
  const [composePosting, setComposePosting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    function close() { setOpenMenuId(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  function handleComposeBrag() {
    const text = composeText.trim();
    if (!text || composePosting) return;
    setComposePosting(true);
    setTimeout(() => {
      createBrag({ text, board: board.name, visibility: "Clique only", bragToFeed: true });
      setComposeText("");
      setComposeFocused(false);
      setComposePosting(false);
    }, 650);
  }

  const stats = [
    { label: "Brags", value: String(boardBrags.length) },
    { label: "Arcs", value: "3" },
    { label: "Done", value: "1" },
  ];

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/boards"
          className="w-fit text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Boards
        </Link>

        <header className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
          <section className="relative h-40 overflow-hidden sm:h-52">
            <Image
              src={board.image}
              alt="Reading board cover"
              fill
              sizes="(min-width: 768px) 896px, 100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-3/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_42%,black_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.16)_36%,rgba(0,0,0,0.84)_100%)]" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4 text-white sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/22 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                  Brag Board
                </span>
                <span className="rounded-full bg-white/14 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
                  {board.mode}
                </span>
              </div>
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
                  <span className="font-black text-zinc-950">{stat.value}</span>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        </header>

        <section className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex w-full rounded-2xl bg-zinc-100 p-1 sm:w-fit">
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
            <div className="flex flex-col gap-3">
              {/* Inline compose */}
              <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-black text-white">
                    VC
                  </div>
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      onFocus={() => setComposeFocused(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComposeBrag();
                      }}
                      placeholder={`What did you prove in ${board.name}?`}
                      rows={composeFocused || composeText ? 3 : 1}
                      className="w-full resize-none bg-transparent text-sm font-semibold text-zinc-700 outline-none placeholder:text-zinc-400"
                    />
                    {(composeFocused || composeText) && (
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => { setComposeFocused(false); setComposeText(""); }}
                          className="text-xs font-black text-zinc-400 transition hover:text-zinc-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleComposeBrag}
                          disabled={!composeText.trim() || composePosting}
                          className="quick-brag-btn relative h-8 overflow-hidden rounded-full px-5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <span className="quick-brag-idle-shimmer" aria-hidden="true" />
                          {composePosting && <span className="quick-brag-click-glint" aria-hidden="true" />}
                          Brag
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {boardBrags.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-base font-black text-zinc-950">No brags in Reading yet.</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    Post your first proof moment above.
                  </p>
                </div>
              ) : (
                boardBrags.map((brag) => {
                  const isCheered = cheeredIds.has(String(brag.id));
                  const hasMedia = brag.attachments?.length || brag.image;

                  return (
                    <article
                      key={brag.id}
                      className="overflow-hidden rounded-2xl border border-zinc-100 bg-white transition hover:border-zinc-200"
                    >
                      {brag.attachments?.length ? (
                        <BragAttachments attachments={brag.attachments} />
                      ) : brag.type === "video" && brag.image ? (
                        <div className="aspect-video bg-zinc-950">
                          <video src={brag.image} controls className="h-full w-full object-cover" />
                        </div>
                      ) : brag.image ? (
                        <div className="relative aspect-video bg-zinc-100">
                          <Image
                            src={brag.image}
                            alt={brag.title ?? `${board.name} brag`}
                            fill
                            sizes="(min-width: 640px) 768px, 100vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                              <Image
                                src={brag.avatar}
                                alt={brag.author}
                                fill
                                sizes="28px"
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm font-black text-zinc-950">{brag.author}</span>
                            <span className="text-xs font-semibold text-zinc-400">
                              {formatBragDate(brag)}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {brag.arc ? (
                              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                                ↳ {brag.arc}
                              </span>
                            ) : null}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === brag.id ? null : brag.id);
                                }}
                                className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                                aria-label="Post options"
                              >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="5" cy="12" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="19" cy="12" r="2" />
                                </svg>
                              </button>
                              {openMenuId === brag.id && (
                                <div className="absolute right-0 top-full z-20 mt-1 min-w-[9rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
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
                        </div>

                        {brag.text ? (
                          <p
                            className={`mt-3 font-semibold leading-6 text-zinc-700 ${
                              hasMedia ? "text-sm" : "text-base font-black leading-snug text-zinc-950"
                            }`}
                          >
                            {brag.text}
                          </p>
                        ) : null}

                        <div className="mt-3 flex items-center gap-2 border-t border-zinc-50 pt-3">
                          <button
                            type="button"
                            onClick={() => toggleCheer(brag.id)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${
                              isCheered
                                ? "bg-zinc-950 text-white"
                                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-950 hover:text-white"
                            }`}
                          >
                            Cheer {brag.cheers + (isCheered ? 1 : 0)}
                          </button>
                          <button
                            type="button"
                            className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-950 hover:text-white"
                          >
                            Comment {brag.comments}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {arcs.map((arc) => (
                <Link
                  key={arc.title}
                  href={arc.href}
                  className="group block rounded-2xl border border-zinc-100 bg-white p-4 transition hover:border-zinc-200 hover:bg-zinc-50/60 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-black text-zinc-600">
                          {arc.status}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                          {arc.progress}
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-black tracking-tight">
                        {arc.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
                        {arc.description}
                      </p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-lg font-semibold text-white transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {arc.meta.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500"
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
