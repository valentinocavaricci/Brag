"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AppNav } from "../components/app-nav";
import { BoardsEmptyState } from "../components/boards-empty-state";
import {
  boardCoverBackground,
  boardTileSizes,
  type BoardCover,
  useBoardPreferences,
  useCreatedBoards,
} from "../lib/boards";
import { useCreatedBrags, usePinnedBoards, boardHref, formatBragDate } from "../lib/brags";
import { useArcMeta } from "../lib/arcs";
import { useProfileSettings } from "../lib/profile";

const initialClique = [
  { name: "Marco", avatar: "/guy1.png" },
  { name: "Sofia", avatar: "/girl1.png", unreadMessages: 2 },
  { name: "Leo", avatar: "/guy2.png" },
  { name: "Gianna", avatar: "/girl2.png" },
  { name: "Nico", avatar: "/guy3.png", unreadMessages: 1 },
  { name: "Mia", avatar: "/girl3.png" },
  { name: "Anthony", avatar: "/guy4.png" },
  { name: "Elena", avatar: "/girl4.png", unreadMessages: 3 },
  { name: "Dante", avatar: "/guy5.png" },
  { name: "Bella", avatar: "/girl5.png" },
  { name: "Luca", avatar: "/guy6.png" },
];

const maxCliqueSize = 15;

type ProfileTile = {
  name: string;
  description: string;
  href: string;
  count: string;
  detail: string;
  pins: string;
  privacy: string;
  image?: string | null;
  cover?: BoardCover;
  size: keyof typeof boardTileSizes;
};

type BoardFilter = "All" | "Public" | "Private";
const boardFilters: BoardFilter[] = ["All", "Public", "Private"];

export default function ProfilePage() {
  const createdBoards = useCreatedBoards();
  const createdBrags = useCreatedBrags();
  const { pinnedBoards } = usePinnedBoards();
  const { preferences } = useBoardPreferences();
  const { profile } = useProfileSettings();
  const [isCliqueEditorOpen, setIsCliqueEditorOpen] = useState(false);
  const [clique, setClique] = useState(initialClique);
  const [boardView, setBoardView] = useState<"grid" | "list">("grid");
  const [boardFilter, setBoardFilter] = useState<BoardFilter>("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"boards" | "bragtivity">("boards");

  const { getArcMeta, getArcNamesForBoard } = useArcMeta();
  const arcCount = new Set(createdBrags.map((b) => b.arc).filter(Boolean)).size;
  const completedArcCount = createdBoards.reduce((sum, board) => {
    return sum + getArcNamesForBoard(board.name).filter((arc) => getArcMeta(board.name, arc).completed).length;
  }, 0);
  const profileStats = [
    { label: "Boards", value: String(createdBoards.length) },
    { label: "Arcs", value: String(arcCount) },
    { label: "Brags", value: String(createdBrags.length) },
    { label: "Pins", value: "0" },
  ];

  const rawProfileTiles: ProfileTile[] = createdBoards.map((board) => ({
    name: board.name,
    description: board.description || "A new place to collect progress and proof.",
    href: boardHref(board.name),
    count: `${createdBrags.filter((b) => b.board === board.name).length} brags`,
    detail: board.description || "new board",
    pins: "0 pins",
    privacy: board.isPrivate ? "Private" : "Public",
    cover: board.cover,
    size: board.size,
  }));

  const profileTiles = rawProfileTiles
    .map((tile, index) => {
      const preference = preferences[tile.name];
      return {
        ...tile,
        name: preference?.title?.trim() || tile.name,
        description: preference?.description?.trim() || tile.description,
        detail: preference?.description?.trim() || tile.detail,
        cover: tile.cover ?? preference?.cover,
        size: tile.size,
        order: preference?.order ?? index,
      };
    })
    .sort((a, b) => a.order - b.order);

  const filteredTiles = boardFilter === "All"
    ? profileTiles
    : profileTiles.filter((t) => t.privacy === boardFilter);

  function removeFriend(name: string) {
    setClique((c) => c.filter((p) => p.name !== name));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section
        className={`mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 transition duration-300 ease-out sm:px-8 lg:px-10 ${
          isCliqueEditorOpen ? "scale-[0.992] opacity-75 blur-[3px]" : "scale-100 opacity-100 blur-0"
        }`}
        aria-hidden={isCliqueEditorOpen}
      >
        <AppNav active="Profile" />

        <div className={`grid transition-all duration-300 ease-in-out ${activeTab === "bragtivity" ? "pointer-events-none [grid-template-rows:0fr] opacity-0" : "[grid-template-rows:1fr] opacity-100"}`}>
        <div className="overflow-hidden">
        <header className="pb-2">
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/profile/edit"
              className="absolute right-0 top-0 inline-flex h-9 w-28 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:text-zinc-950"
            >
              Edit Profile
            </Link>

            {(() => {
              const size = 220;
              const picSize = 110;
              const dotSize = 28;
              const orbitR = 88;
              const slots = maxCliqueSize;
              return (
                <button
                  type="button"
                  onClick={() => setIsCliqueEditorOpen(true)}
                  className="group relative shrink-0 transition duration-300 hover:scale-105"
                  style={{ width: size, height: size }}
                  aria-label="Edit clique"
                >
                  {Array.from({ length: slots }).map((_, i) => {
                    const angle = (i / slots) * 2 * Math.PI - Math.PI / 2;
                    const cx = size / 2 + orbitR * Math.cos(angle) - dotSize / 2;
                    const cy = size / 2 + orbitR * Math.sin(angle) - dotSize / 2;
                    const person = clique[i];
                    return (
                      <div
                        key={i}
                        className={`absolute flex items-center justify-center overflow-hidden rounded-full text-[9px] font-black ${person ? "bg-zinc-200 text-zinc-700 ring-[1px] ring-white" : "border border-dashed border-zinc-200"}`}
                        style={{ width: dotSize, height: dotSize, left: cx, top: cy }}
                      >
                        {person ? (
                          <Image src={person.avatar} alt={person.name} fill sizes="26px" className="object-cover" />
                        ) : null}
                      </div>
                    );
                  })}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-zinc-100 ring-[1px] ring-white/80 shadow-[0_0_0_2.5px_rgba(161,161,170,0.18),0_4px_16px_rgba(0,0,0,0.07)]"
                    style={{ width: picSize, height: picSize }}
                  >
                    <Image
                      src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg"
                      alt="Valentino Cavaricci"
                      fill
                      sizes="110px"
                      className="scale-[1.3] object-cover object-[48%_43%] transition duration-300 group-hover:blur-sm group-hover:brightness-50"
                      priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="text-center text-[10px] font-black leading-tight tracking-wide text-white">View<br/>Clique</span>
                    </div>
                  </div>
                </button>
              );
            })()}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black leading-tight tracking-tight text-zinc-950 sm:text-2xl">
                  {profile.displayName}
                </h1>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-black text-zinc-500">
                  {profile.visibility}
                </span>
                {profile.location ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-black text-zinc-500">
                    {profile.location}
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-semibold text-zinc-400">{profile.handle}</span>
              {profile.bio ? (
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-zinc-950">{profile.bio}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-5">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-1">
                    <span className="text-2xl font-black tracking-tight text-zinc-950">{stat.value}</span>
                    <span className="text-xs font-semibold text-zinc-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>
        </div>
        </div>

        <section className="-mt-4">
          {/* Title switcher — always visible */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-5">
              <button
                type="button"
                onClick={() => setActiveTab("boards")}
                className={`font-black tracking-tight transition-all duration-300 ease-out ${activeTab === "boards" ? "text-3xl text-zinc-950 sm:text-4xl" : "text-xl text-zinc-400 hover:scale-105 hover:text-zinc-600 sm:text-2xl"}`}
              >
                Brag Boards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("bragtivity")}
                className={`font-black tracking-tight transition-all duration-300 ease-out ${activeTab === "bragtivity" ? "text-3xl text-zinc-950 sm:text-4xl" : "text-xl text-zinc-400 hover:scale-105 hover:text-zinc-600 sm:text-2xl"}`}
              >
                Bragtivity
              </button>
            </div>

            {activeTab === "boards" ? (
              <div className="flex shrink-0 items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFilterOpen((o) => !o)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-100 pl-3 pr-2.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-200 active:scale-95"
                  >
                    {boardFilter}
                    <svg className={`h-3 w-3 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {filterOpen ? (
                    <div className="absolute right-0 top-full z-20 mt-1.5 w-28 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-lg shadow-zinc-200/60">
                      {boardFilters.map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => { setBoardFilter(f); setFilterOpen(false); }}
                          className={`w-full px-3 py-2 text-left text-xs font-black transition hover:bg-zinc-50 ${boardFilter === f ? "text-zinc-950" : "text-zinc-400"}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="inline-flex h-11 rounded-full border border-zinc-200 bg-white p-1 shadow-sm shadow-zinc-200">
                  <button type="button" onClick={() => setBoardView("grid")} aria-label="Grid view" className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full transition ${boardView === "grid" ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"}`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" />
                      <rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setBoardView("list")} aria-label="List view" className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full transition ${boardView === "list" ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"}`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>
                <Link href="/boards/new" className="profile-primary-button inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800">
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                  Create Board
                </Link>
              </div>
            ) : null}
          </div>

          {activeTab === "bragtivity" ? (
            <div className="animate-tab-fade-up flex flex-col gap-3">

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-2xl bg-zinc-950 p-5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-500">Total Brags</p>
                  <span className="my-2 text-7xl font-black leading-none tracking-tight text-white">{createdBrags.length}</span>
                  <p className="text-xs font-semibold text-zinc-500">logged</p>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Boards", value: String(createdBoards.length), color: "text-zinc-950" },
                    { label: "Arcs", value: String(arcCount), color: "text-zinc-950" },
                    { label: "Completed", value: String(completedArcCount), color: "text-emerald-500" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-1 flex-col justify-between rounded-2xl bg-zinc-100 px-4 py-3">
                      <span className={`text-2xl font-black tracking-tight ${s.color}`}>{s.value}</span>
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Brags */}
              <div>
                <p className="mb-1 mt-2 text-[0.65rem] font-bold uppercase tracking-widest text-zinc-400">Recent Brags</p>
                {createdBrags.length === 0 ? (
                  <div className="grid min-h-32 place-items-center rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-sm font-semibold text-zinc-400">No brags yet. Go brag something.</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-zinc-100">
                    {createdBrags.slice(0, 10).map((brag) => (
                      <Link
                        key={brag.id}
                        href={boardHref(brag.board)}
                        className="group flex items-center gap-3 py-3 transition-opacity hover:opacity-60"
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                          <Image src={brag.avatar} alt={brag.author} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-black text-zinc-950">{brag.title || brag.board}</p>
                            <span className="shrink-0 text-[0.65rem] font-semibold text-zinc-400">{formatBragDate(brag)}</span>
                          </div>
                          <p className="line-clamp-1 text-xs text-zinc-500">{brag.text}</p>
                        </div>
                        {brag.image ? (
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                            <Image src={brag.image} alt="" fill className="object-cover" />
                          </div>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : null}

          {activeTab !== "boards" ? null : <div className="animate-tab-fade-up">

          {/* GRID VIEW */}
          {boardView === "grid" ? (
            filteredTiles.length === 0 ? (
              <BoardsEmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-3 [grid-auto-flow:dense] [grid-auto-rows:minmax(0,calc((100vw-2.5rem-0.75rem)/2))] sm:gap-4 sm:[grid-auto-rows:minmax(0,calc((100vw-4rem-1rem)/2))] lg:grid-cols-5 lg:[grid-auto-rows:minmax(0,calc((min(100vw,80rem)-5rem-4rem)/5))]">
                {filteredTiles.map((tile) => {
                  const size = boardTileSizes[tile.size];
                  const backgroundImage = tile.cover ? boardCoverBackground(tile.cover) : undefined;
                  return (
                    <Link
                      key={tile.name}
                      href={tile.href}
                      className={`group relative flex min-w-0 overflow-hidden rounded-[1.35rem] border border-white/70 bg-zinc-900 shadow-sm shadow-zinc-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:rounded-[1.5rem] ${size.tile}`}
                    >
                      {tile.cover ? (
                        <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage }} />
                      ) : tile.image ? (
                        <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${tile.image})` }} />
                      ) : (
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#123c36_0%,#375a4f_48%,#efe2b8_100%)]" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_50%,black_100%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.82)_100%)]" />
                      <div className={`relative z-10 flex h-full min-h-0 w-full flex-col justify-between text-white ${size.body}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-wrap gap-2">
                            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">{tile.count}</span>
                            <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">{tile.pins}</span>
                            {tile.privacy === "Private" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                                  <rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />
                                </svg>
                                Private
                              </span>
                            ) : null}
                          </div>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/18 text-lg font-semibold backdrop-blur-md transition group-hover:translate-x-1">→</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className={`${size.title} break-words font-black leading-none tracking-tight`}>{tile.name}</h3>
                          <p className={`mt-2 font-black uppercase text-white/70 ${size.detail}`}>{tile.detail}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : null}

          {/* LIST VIEW */}
          {boardView === "list" ? (
            filteredTiles.length === 0 ? (
              <BoardsEmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredTiles.map((tile) => {
                  const backgroundImage = tile.cover ? boardCoverBackground(tile.cover) : undefined;
                  return (
                    <Link
                      key={tile.name}
                      href={tile.href}
                      className="group relative overflow-hidden rounded-2xl bg-zinc-950 text-white shadow-sm shadow-zinc-200 transition-all duration-300 ease-out hover:scale-[1.015] hover:shadow-lg hover:shadow-zinc-300/60"
                    >
                      {tile.cover ? (
                        <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage }} />
                      ) : null}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%),linear-gradient(135deg,rgba(0,0,0,0.18),rgba(0,0,0,0.72))]" />
                      <div className="relative z-10 flex min-h-36 flex-col justify-between p-5">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">{tile.count}</span>
                          <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">{tile.privacy}</span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight sm:text-3xl">{tile.name}</h3>
                          {tile.detail ? (
                            <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-white/60">{tile.detail}</p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : null}

          </div>}
        </section>
      </section>

      {isCliqueEditorOpen ? (
        <section className="clique-editor-backdrop fixed inset-0 z-50 grid place-items-center bg-[#fbfbfb]/28 px-5 py-8 backdrop-blur-[5px]">
          <div className="clique-editor-modal animate-modal-in w-full max-w-2xl rounded-[1.75rem] border border-white/70 bg-white/72 p-5 shadow-2xl shadow-zinc-950/18 ring-1 ring-white/50 backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <button
                  type="button"
                  onClick={() => setIsCliqueEditorOpen(false)}
                  className="clique-editor-secondary inline-flex h-10 w-fit items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-300/70 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
                >
                  <span aria-hidden="true" className="text-lg leading-none">←</span>
                  Back
                </button>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Edit Clique</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Keep it real.</h2>
              </div>
              <span className="clique-editor-pill w-fit rounded-full bg-white/65 px-3 py-1 text-xs font-black text-zinc-500 shadow-sm shadow-zinc-200/70">
                {clique.length}/{maxCliqueSize}
              </span>
            </div>

            <div className="clique-editor-panel mt-6 rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm shadow-zinc-300/70 backdrop-blur-xl">
              {clique.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
                  {clique.map((person) => (
                    <div key={person.name} className="flex min-w-0 flex-col items-center">
                      <div className="clique-editor-avatar-ring relative rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300 p-1">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-100">
                          <Image src={person.avatar} alt={`${person.name} profile photo`} fill sizes="56px" className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFriend(person.name)}
                          className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border border-white/80 bg-zinc-950 text-sm font-black leading-none text-white shadow-sm shadow-zinc-400 transition hover:scale-105 hover:bg-red-600"
                          aria-label={`Remove ${person.name} from clique`}
                        >
                          ×
                        </button>
                      </div>
                      <p className="clique-editor-name mt-2 max-w-20 truncate text-center text-sm font-bold text-zinc-700">{person.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="clique-editor-empty grid min-h-40 place-items-center rounded-3xl bg-zinc-50/80 px-6 text-center">
                  <p className="max-w-sm text-sm font-bold leading-6 text-zinc-500">
                    Your clique is empty. Add only the people you actually want in your corner.
                  </p>
                </div>
              )}
              <button
                className="clique-editor-primary mt-5 h-12 w-full rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
                disabled={clique.length >= maxCliqueSize}
                type="button"
              >
                Add Friend
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
