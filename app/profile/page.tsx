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
import { useCreatedBrags, boardHref } from "../lib/brags";

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


export default function ProfilePage() {
  const createdBoards = useCreatedBoards();
  const createdBrags = useCreatedBrags();
  const { preferences } = useBoardPreferences();
  const [isCliqueEditorOpen, setIsCliqueEditorOpen] = useState(false);
  const [clique, setClique] = useState(initialClique);
  const [activeProfileView, setActiveProfileView] = useState<"boards" | "pins">(
    "boards",
  );
  const arcCount = new Set(createdBrags.map((b) => b.arc).filter(Boolean)).size;
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
    privacy: "Public",
    cover: board.cover,
    size: board.size,
  }));
  const profileTiles = rawProfileTiles
    .map((tile, index) => {
      const preference = preferences[tile.name];
      const description = preference?.description?.trim() || tile.description;

      return {
        ...tile,
        name: preference?.title?.trim() || tile.name,
        description,
        detail: preference?.description?.trim() || tile.detail,
        cover: tile.cover ?? preference?.cover,
        size: tile.size,
        order: preference?.order ?? index,
      };
    })
    .sort((first, second) => first.order - second.order);

  function removeFriend(name: string) {
    setClique((currentClique) =>
      currentClique.filter((person) => person.name !== name),
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section
        className={`mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 transition duration-300 ease-out sm:px-8 lg:px-10 ${
          isCliqueEditorOpen
            ? "scale-[0.992] opacity-75 blur-[3px]"
            : "scale-100 opacity-100 blur-0"
        }`}
        aria-hidden={isCliqueEditorOpen}
      >
        <AppNav active="Profile" />

        <header className="-mt-8 pb-5 pt-2">
          <div className="relative h-24 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_24%_35%,rgba(56,189,248,0.62)_0%,transparent_34%),radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.5)_0%,transparent_32%),linear-gradient(120deg,#07111f_0%,#12345b_48%,#0f766e_100%)] sm:h-28">
            <Link
              href="/profile/edit"
              className="profile-soft-button absolute right-3 top-3 z-10 inline-flex h-9 w-28 items-center justify-center rounded-full border border-white/70 bg-white/88 px-4 text-xs font-semibold text-zinc-700 shadow-sm shadow-zinc-950/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-zinc-950 sm:right-4 sm:top-4"
            >
              Edit Profile
            </Link>
          </div>

          <div className="relative z-10 flex flex-col gap-3 px-3 sm:flex-row sm:items-start sm:px-5">
            <div className="relative -mt-8 h-28 w-28 shrink-0 overflow-hidden rounded-full bg-zinc-900 ring-2 ring-white ring-offset-2 ring-offset-zinc-950 sm:-mt-10 sm:h-32 sm:w-32">
              <Image
                src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg"
                alt="Valentino Cavaricci profile photo"
                fill
                sizes="(min-width: 640px) 128px, 112px"
                className="scale-[1.3] object-cover object-[48%_43%]"
                priority
              />
            </div>

            <div className="min-w-0 flex-1 pb-1 pt-1 sm:pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                  Valentino Cavaricci
                </h1>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
                  Public
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white">
                Keeping proof of the work: books finished, miles logged, ideas
                built, and a life in progress.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-semibold text-white">
                {profileStats.map((stat) => (
                  <span key={stat.label}>
                    <strong className="font-black text-white">
                      {stat.value}
                    </strong>{" "}
                    {stat.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 px-3 sm:px-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  My Clique
                </p>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-black text-zinc-500">
                  {clique.length}/{maxCliqueSize}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCliqueEditorOpen(true)}
                className="profile-soft-button inline-flex h-8 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                Edit Clique
              </button>
            </div>
            <div className="grid snap-x snap-mandatory grid-flow-col auto-cols-[calc((100%-1rem)/3)] gap-2 overflow-x-auto overscroll-x-contain scroll-smooth py-1 [scrollbar-width:none] sm:auto-cols-[calc((100%-2rem)/5)] lg:auto-cols-[calc((100%-3.5rem)/8)] [&::-webkit-scrollbar]:hidden">
            {clique.map((person) => (
              <div
                key={person.name}
                className="flex min-w-0 snap-start snap-always flex-col items-center"
              >
                <div className="relative rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300 p-0.5">
                  <div className="rounded-full bg-white p-0.5">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-100">
                      <Image
                        src={person.avatar}
                        alt={`${person.name} profile photo`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    {"unreadMessages" in person ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-zinc-950 text-white shadow-sm shadow-zinc-300"
                        aria-label={`${person.name} sent ${person.unreadMessages} unread messages`}
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.4"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                          <path d="M10 19a2 2 0 0 0 4 0" />
                        </svg>
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1.5 max-w-16 truncate text-center text-xs font-semibold text-zinc-600">
                  {person.name}
                </p>
              </div>
            ))}
          </div>
          </div>
        </header>

        <section className="-mt-16 overflow-hidden">
          <div
            key={activeProfileView}
            className={
              activeProfileView === "boards"
                ? "animate-profile-swipe-right"
                : "animate-profile-swipe-left"
            }
          >
            <div className="mb-5 flex min-h-24 flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  {activeProfileView === "boards"
                    ? "My Brag Boards"
                    : "My Pins"}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2">
              <div
                className="inline-flex h-11 rounded-full border border-zinc-200 bg-white p-1 shadow-sm shadow-zinc-200"
                aria-label="Profile content view"
              >
                <button
                  type="button"
                  onClick={() => setActiveProfileView("boards")}
                  aria-pressed={activeProfileView === "boards"}
                  className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full text-zinc-600 transition ${
                    activeProfileView === "boards"
                      ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300"
                      : "hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                  title="Show boards"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <rect x="4" y="4" width="6" height="6" rx="1.5" />
                    <rect x="14" y="4" width="6" height="6" rx="1.5" />
                    <rect x="4" y="14" width="6" height="6" rx="1.5" />
                    <rect x="14" y="14" width="6" height="6" rx="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileView("pins")}
                  aria-pressed={activeProfileView === "pins"}
                  className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full text-zinc-600 transition ${
                    activeProfileView === "pins"
                      ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300"
                      : "hover:bg-zinc-100 hover:text-zinc-950"
                  }`}
                  title="Show pins"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M7 4h10v18l-5-3-5 3V4Z" />
                  </svg>
                </button>
              </div>

              {activeProfileView === "boards" ? (
                <Link
                  href="/boards/new"
                  className="profile-primary-button inline-flex h-11 w-44 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    +
                  </span>
                  Create Board
                </Link>
              ) : (
                <Link
                  href="/explore"
                  className="profile-primary-button inline-flex h-11 w-44 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.3"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="6.5" />
                    <path d="m16 16 4 4" />
                  </svg>
                  Find More Pins
                </Link>
              )}
              </div>
            </div>

            <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
              <div
                className={`transition duration-300 ${
                  activeProfileView === "boards"
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                }`}
                aria-hidden={activeProfileView !== "boards"}
              >
              {profileTiles.length === 0 ? (
                <BoardsEmptyState />
              ) : (
              <div className="grid grid-cols-2 gap-3 [grid-auto-flow:dense] [grid-auto-rows:minmax(0,calc((100vw-2.5rem-0.75rem)/2))] sm:gap-4 sm:[grid-auto-rows:minmax(0,calc((100vw-4rem-1rem)/2))] lg:grid-cols-5 lg:[grid-auto-rows:minmax(0,calc((min(100vw,80rem)-5rem-4rem)/5))]">
              {profileTiles.map((tile) => {
                const size = boardTileSizes[tile.size];
                const backgroundImage = tile.cover
                  ? boardCoverBackground(tile.cover)
                  : undefined;

                return (
                  <Link
                    key={tile.name}
                    href={tile.href}
                    className={`group relative flex min-w-0 overflow-hidden rounded-[1.35rem] border border-white/70 bg-zinc-900 shadow-sm shadow-zinc-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:rounded-[1.5rem] ${size.tile}`}
                  >
                    {tile.cover ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage }}
                      />
                    ) : tile.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${tile.image})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#123c36_0%,#375a4f_48%,#efe2b8_100%)]" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-2/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_50%,black_100%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.28)_42%,rgba(0,0,0,0.82)_100%)]" />

                    <div
                      className={`relative z-10 flex h-full min-h-0 w-full flex-col justify-between text-white ${size.body}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap gap-2">
                          <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                            {tile.count}
                          </span>
                          <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                            {tile.pins}
                          </span>
                          {tile.privacy === "Private" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
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
                                <rect
                                  x="5"
                                  y="10"
                                  width="14"
                                  height="10"
                                  rx="2"
                                />
                                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                              </svg>
                              Private
                            </span>
                          ) : null}
                        </div>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/18 text-lg font-semibold backdrop-blur-md transition group-hover:translate-x-1">
                          →
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3
                          className={`${size.title} break-words font-black leading-none tracking-tight`}
                        >
                          {tile.name}
                        </h3>
                        <p
                          className={`mt-2 font-black uppercase text-white/70 ${size.detail}`}
                        >
                          {tile.detail}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
              </div>
              )}
              </div>

              <div
                className={`grid content-start gap-3 transition duration-300 lg:grid-cols-3 ${
                  activeProfileView === "pins"
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                }`}
                aria-hidden={activeProfileView !== "pins"}
              >
                <div className="col-span-full rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm shadow-zinc-200">
                  <p className="text-xl font-black text-zinc-950">Nothing pinned yet.</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-500">
                    Pin boards from Explore to follow just that slice of someone&rsquo;s progress.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                  >
                    Find boards to pin
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
                  <span aria-hidden="true" className="text-lg leading-none">
                    ←
                  </span>
                  Back
                </button>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Edit Clique
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                  Keep it real.
                </h2>
              </div>
              <span className="clique-editor-pill w-fit rounded-full bg-white/65 px-3 py-1 text-xs font-black text-zinc-500 shadow-sm shadow-zinc-200/70">
                {clique.length}/{maxCliqueSize}
              </span>
            </div>

            <div className="clique-editor-panel mt-6 rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm shadow-zinc-300/70 backdrop-blur-xl">
              {clique.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
                  {clique.map((person) => (
                    <div
                      key={person.name}
                      className="flex min-w-0 flex-col items-center"
                    >
                      <div className="clique-editor-avatar-ring relative rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300 p-1">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-100">
                          <Image
                            src={person.avatar}
                            alt={`${person.name} profile photo`}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
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
                      <p className="clique-editor-name mt-2 max-w-20 truncate text-center text-sm font-bold text-zinc-700">
                        {person.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="clique-editor-empty grid min-h-40 place-items-center rounded-3xl bg-zinc-50/80 px-6 text-center">
                  <p className="max-w-sm text-sm font-bold leading-6 text-zinc-500">
                    Your clique is empty. Add only the people you actually want
                    in your corner.
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
