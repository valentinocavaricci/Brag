"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { AppNav } from "../../components/app-nav";
import { BragAttachments } from "../../components/brag-attachments";
import { useCreatedBrags, useCheers, createBrag, formatBragDate } from "../../lib/brags";

const board = {
  name: "Gym",
  mode: "Progress board",
  status: "Public Board",
  image: "/gym.jpg",
  summary: "Sets, PRs, and proof that the work is compounding.",
};

const boardViews = ["Brags", "Arcs"] as const;

type LocalArc = {
  id: number;
  name: string;
  description: string;
  colorStart: string;
  colorEnd: string;
};

const arcPalette = [
  { start: "#14532d", end: "#10b981", label: "Forest" },
  { start: "#1e3a5f", end: "#3b82f6", label: "Ocean" },
  { start: "#09090b", end: "#3f3f46", label: "Obsidian" },
  { start: "#7c2d12", end: "#ef4444", label: "Ember" },
  { start: "#4c1d95", end: "#a855f7", label: "Dusk" },
  { start: "#92400e", end: "#f59e0b", label: "Amber" },
];

const ARCS_KEY = "brag.gym.arcs.v1";

function readArcs(): LocalArc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ARCS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeArcs(arcs: LocalArc[]) {
  window.localStorage.setItem(ARCS_KEY, JSON.stringify(arcs));
}

export default function GymPage() {
  const [activeView, setActiveView] = useState<(typeof boardViews)[number]>("Brags");
  const createdBrags = useCreatedBrags();
  const boardBrags = createdBrags.filter((b) => b.board === board.name);
  const { cheeredIds, toggleCheer } = useCheers();

  // Compose
  const [composeText, setComposeText] = useState("");
  const [composeFocused, setComposeFocused] = useState(false);
  const [composePosting, setComposePosting] = useState(false);
  const composeRef = useRef<HTMLTextAreaElement>(null);

  // FAB
  const [fabOpen, setFabOpen] = useState(false);

  // Three-dot menu
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Arcs (localStorage-backed)
  const [arcs, setArcs] = useState<LocalArc[]>([]);
  const [arcModalOpen, setArcModalOpen] = useState(false);
  const [arcName, setArcName] = useState("");
  const [arcDesc, setArcDesc] = useState("");
  const [arcColor, setArcColor] = useState(arcPalette[0]);

  useEffect(() => {
    setArcs(readArcs());
  }, []);

  useEffect(() => {
    if (openMenuId === null) return;
    function close() { setOpenMenuId(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  useEffect(() => {
    if (!fabOpen) return;
    const t = setTimeout(() => {
      function close() { setFabOpen(false); }
      document.addEventListener("click", close, { once: true });
    }, 50);
    return () => clearTimeout(t);
  }, [fabOpen]);

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

  function openBragCompose() {
    setFabOpen(false);
    setActiveView("Brags");
    setTimeout(() => composeRef.current?.focus(), 80);
  }

  function openArcModal() {
    setFabOpen(false);
    setArcName("");
    setArcDesc("");
    setArcColor(arcPalette[0]);
    setArcModalOpen(true);
  }

  function handleCreateArc() {
    const name = arcName.trim();
    if (!name) return;
    const next = [
      ...arcs,
      { id: Date.now(), name, description: arcDesc.trim(), colorStart: arcColor.start, colorEnd: arcColor.end },
    ];
    setArcs(next);
    writeArcs(next);
    setArcModalOpen(false);
    setActiveView("Arcs");
  }

  const stats = [
    { label: "Brags", value: String(boardBrags.length) },
    { label: "Arcs", value: String(arcs.length) },
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

        {/* Board header */}
        <header className="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm">
          <section className="relative h-40 overflow-hidden sm:h-52">
            <Image
              src={board.image}
              alt="Gym board cover"
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
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {board.status}
            </span>
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

        {/* Tabs + content */}
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
                    isActive ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500 hover:text-zinc-950"
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
                      ref={composeRef}
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      onFocus={() => setComposeFocused(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComposeBrag();
                      }}
                      placeholder="What did you prove in the gym?"
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
                /* ── Empty state ── */
                <div className="flex flex-col items-center px-4 py-16 text-center">
                  <p className="text-5xl">🏋️</p>
                  <p className="mt-5 text-2xl font-black tracking-tight">
                    Still warming up?
                  </p>
                  <p className="mt-2 max-w-[22rem] text-sm font-semibold leading-6 text-zinc-500">
                    Come on — I know you've done at least one thing worth bragging about. The bar is literally on the floor right now.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => composeRef.current?.focus()}
                      className="quick-brag-btn relative h-11 overflow-hidden rounded-full px-6 text-sm font-black"
                    >
                      <span className="quick-brag-idle-shimmer" aria-hidden="true" />
                      + Post a Brag
                    </button>
                    <button
                      type="button"
                      onClick={openArcModal}
                      className="h-11 rounded-full border border-zinc-200 bg-white px-6 text-sm font-black text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
                    >
                      Start a Arc →
                    </button>
                  </div>
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
                            alt={brag.title ?? "Gym brag"}
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
                              <Image src={brag.avatar} alt={brag.author} fill sizes="28px" className="object-cover" />
                            </div>
                            <span className="text-sm font-black text-zinc-950">{brag.author}</span>
                            <span className="text-xs font-semibold text-zinc-400">{formatBragDate(brag)}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {brag.arc && (
                              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-600">
                                ↳ {brag.arc}
                              </span>
                            )}
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
                                  <button type="button" onClick={(e) => e.stopPropagation()} className="flex w-full items-center px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50">Edit</button>
                                  <button type="button" onClick={(e) => e.stopPropagation()} className="flex w-full items-center border-t border-zinc-100 px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50">Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {brag.text && (
                          <p className={`mt-3 font-semibold leading-6 text-zinc-700 ${hasMedia ? "text-sm" : "text-base font-black leading-snug text-zinc-950"}`}>
                            {brag.text}
                          </p>
                        )}

                        <div className="mt-3 flex items-center gap-2 border-t border-zinc-50 pt-3">
                          <button
                            type="button"
                            onClick={() => toggleCheer(brag.id)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-black transition ${isCheered ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-950 hover:text-white"}`}
                          >
                            Cheer {brag.cheers + (isCheered ? 1 : 0)}
                          </button>
                          <button type="button" className="rounded-full bg-zinc-100 px-3.5 py-1.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-950 hover:text-white">
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
            /* ── Arcs tab ── */
            <div className="flex flex-col gap-3">
              {arcs.length === 0 ? (
                <div className="flex flex-col items-center px-4 py-16 text-center">
                  <p className="text-5xl">🎯</p>
                  <p className="mt-5 text-2xl font-black tracking-tight">No missions yet.</p>
                  <p className="mt-2 max-w-[22rem] text-sm font-semibold leading-6 text-zinc-500">
                    A arc is a named mission you track over time. First pull-up? Cut season? Name it and start collecting proof.
                  </p>
                  <button
                    type="button"
                    onClick={openArcModal}
                    className="mt-8 h-11 rounded-full bg-zinc-950 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                  >
                    Start your first arc →
                  </button>
                </div>
              ) : (
                arcs.map((arc) => (
                  <div
                    key={arc.id}
                    className="group relative min-h-44 cursor-pointer overflow-hidden rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${arc.colorStart}, ${arc.colorEnd})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="relative flex h-full min-h-44 flex-col justify-between p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white backdrop-blur-sm">
                            Active
                          </span>
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white backdrop-blur-sm">
                            0 brags
                          </span>
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition group-hover:bg-white/30 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                          {arc.name}
                        </h3>
                        {arc.description && (
                          <p className="mt-1.5 text-sm font-semibold leading-5 text-white/70">
                            {arc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </section>

      {/* ── FAB ── */}
      <div className="fixed bottom-24 right-5 z-30 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
        {fabOpen && (
          <>
            <button
              type="button"
              onClick={openArcModal}
              className="flex items-center gap-3 rounded-full bg-white py-3 pl-4 pr-5 text-sm font-black text-zinc-950 shadow-xl shadow-zinc-950/12 ring-1 ring-zinc-200 transition hover:-translate-y-0.5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-base">🎯</span>
              Start a Arc
            </button>
            <button
              type="button"
              onClick={openBragCompose}
              className="flex items-center gap-3 rounded-full bg-white py-3 pl-4 pr-5 text-sm font-black text-zinc-950 shadow-xl shadow-zinc-950/12 ring-1 ring-zinc-200 transition hover:-translate-y-0.5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-base">✍️</span>
              Post a Brag
            </button>
          </>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setFabOpen((f) => !f); }}
          className="grid h-14 w-14 place-items-center rounded-full bg-zinc-950 text-white shadow-xl shadow-zinc-950/30 transition hover:bg-zinc-800"
          aria-label="Add brag or arc"
        >
          <svg
            className={`h-6 w-6 transition-transform duration-200 ${fabOpen ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* ── Arc creation modal ── */}
      {arcModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          onClick={() => setArcModalOpen(false)}
        >
          <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm" />
          <div
            className="animate-modal-in relative w-full max-w-lg rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">New Arc</h2>
              <button
                type="button"
                onClick={() => setArcModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Live preview */}
              <div
                className="flex h-20 items-end overflow-hidden rounded-2xl p-4"
                style={{ background: `linear-gradient(135deg, ${arcColor.start}, ${arcColor.end})` }}
              >
                <p className="text-lg font-black tracking-tight text-white drop-shadow">
                  {arcName.trim() || "Arc name"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-zinc-400">
                  Arc name
                </label>
                <input
                  type="text"
                  value={arcName}
                  onChange={(e) => setArcName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateArc(); }}
                  placeholder="First Pull-up, Cut Season, 5K in 90 Days…"
                  autoFocus
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-base font-black text-zinc-950 outline-none placeholder:font-semibold placeholder:text-zinc-400 transition focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-zinc-400">
                  Mission color
                </label>
                <div className="flex gap-2">
                  {arcPalette.map((option) => {
                    const isSelected = arcColor.label === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setArcColor(option)}
                        className={`h-9 flex-1 rounded-xl transition hover:scale-105 ${isSelected ? "ring-2 ring-zinc-950 ring-offset-2" : ""}`}
                        style={{ background: `linear-gradient(135deg, ${option.start}, ${option.end})` }}
                        aria-label={option.label}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-black uppercase tracking-widest text-zinc-400">
                  What&apos;s the mission?{" "}
                  <span className="font-semibold normal-case tracking-normal">(optional)</span>
                </label>
                <textarea
                  value={arcDesc}
                  onChange={(e) => setArcDesc(e.target.value)}
                  placeholder="A quick description of what you're working toward..."
                  rows={2}
                  className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 outline-none placeholder:text-zinc-400 transition focus:border-zinc-950 focus:bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateArc}
                disabled={!arcName.trim()}
                className="quick-brag-btn relative h-12 w-full overflow-hidden rounded-full text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="quick-brag-idle-shimmer" aria-hidden="true" />
                Create Arc →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
