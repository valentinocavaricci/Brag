"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AppNav } from "../components/app-nav";

const stats = [
  { label: "Boards", value: "6" },
  { label: "Journeys", value: "9" },
  { label: "Brags", value: "24" },
  { label: "Pins", value: "672" },
];

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

const tiles = [
  {
    name: "Gym",
    description: "Strength, consistency, and milestones from training days.",
    href: "#",
    count: "12 brags",
    detail: "general progress",
    pins: "128 pins",
    privacy: "Private",
    image: "/gym.jpg",
    size: "large",
  },
  {
    name: "Music",
    description: "Demos, writing sessions, sound experiments, and album proof.",
    href: "/tiles/music",
    count: "1 journey",
    detail: "New Album?? 👀",
    pins: "173 pins",
    privacy: "Public",
    image: "/music.png",
    size: "medium",
  },
  {
    name: "Reading",
    description: "Books, reflections, and long-form reading journeys.",
    href: "/tiles/reading",
    count: "3 journeys",
    detail: "War and Peace, essays, classics",
    pins: "214 pins",
    privacy: "Public",
    image: "/reading.jpg",
    size: "small",
  },
  {
    name: "Food",
    description: "Cooking reps, meals worth remembering, and bread experiments.",
    href: "/tiles/food",
    count: "5 brags",
    detail: "Sourdough Bread journey",
    pins: "87 pins",
    privacy: "Public",
    image: "/food.png",
    size: "small",
  },
  {
    name: "Career",
    description: "Projects, work wins, lessons, and professional growth.",
    href: "#",
    count: "2 journeys",
    detail: "dashboard build, internship search",
    pins: "96 pins",
    privacy: "Public",
    image: "/career.jpg",
    size: "medium",
  },
  {
    name: "Faith",
    description: "Practices, gratitude, and spiritual growth.",
    href: "#",
    count: "8 brags",
    detail: "general practice",
    pins: "55 pins",
    privacy: "Private",
    image: null,
    size: "medium",
  },
] as const;

const profileBoardSizes = {
  small: {
    tile: "col-span-1 row-span-1",
    body: "p-4 sm:p-5",
    title: "text-3xl sm:text-4xl",
    description: "line-clamp-2 text-sm leading-5",
    detail: "line-clamp-1 text-[0.65rem] tracking-[0.14em]",
  },
  medium: {
    tile: "col-span-2 row-span-1",
    body: "p-5 sm:p-6",
    title: "text-4xl sm:text-5xl",
    description: "line-clamp-2 text-sm leading-6 sm:text-base",
    detail: "line-clamp-1 text-xs tracking-[0.16em]",
  },
  large: {
    tile: "col-span-2 row-span-2",
    body: "p-5 sm:p-6",
    title: "text-5xl sm:text-6xl",
    description: "line-clamp-2 text-base leading-6 sm:text-lg",
    detail: "line-clamp-1 text-xs tracking-[0.18em]",
  },
} as const;

const pinnedJourneys = [
  {
    owner: "Sarah",
    location: "Massachusetts",
    title: "Ironman Training",
    board: "Fitness",
    progress: "Week 9 of 24",
    pins: "493 pins",
    update: "Long swim complete. Bike brick tomorrow.",
  },
  {
    owner: "Owen",
    location: "Austin",
    title: "First Cookbook",
    board: "Cooking",
    progress: "Recipe 18 of 40",
    pins: "127 pins",
    update: "Tested the pasta chapter again and finally nailed the sauce.",
  },
  {
    owner: "Maya",
    location: "Chicago",
    title: "LSAT 170 Push",
    board: "Education",
    progress: "34 days left",
    pins: "301 pins",
    update: "Logic games set came in clean under time.",
  },
];

export default function ProfilePage() {
  const [isCliqueEditorOpen, setIsCliqueEditorOpen] = useState(false);
  const [clique, setClique] = useState(initialClique);
  const [activeProfileView, setActiveProfileView] = useState<"boards" | "pins">(
    "boards",
  );

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

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:items-center lg:grid-cols-[12rem_1fr]">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-zinc-950 ring-[5px] ring-zinc-200 sm:mx-auto sm:h-36 sm:w-36">
              <Image
                src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg"
                alt="Valentino Cavaricci profile photo"
                fill
                sizes="(min-width: 640px) 144px, 128px"
                className="scale-[1.55] object-cover object-[48%_43%]"
                priority
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-4">
                <div className="flex min-w-0 flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                      <h1 className="truncate text-3xl font-black tracking-tight text-zinc-950 sm:text-[2.35rem] sm:leading-none">
                        Valentino Cavaricci
                      </h1>
                      <span className="hidden text-sm font-semibold text-zinc-400 sm:inline">
                        Public profile · Orange County, CA
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile/edit"
                    className="inline-flex h-10 w-fit shrink-0 items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
                  >
                    Edit Profile
                  </Link>
                </div>

                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="inline-flex items-baseline gap-1.5 text-zinc-950"
                      >
                        <span className="text-lg font-black tracking-tight">
                          {stat.value}
                        </span>
                        <span className="text-base font-semibold text-zinc-600">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                    Documenting visible proof of progress across reading,
                    fitness, career, faith, and personal growth.
                  </p>

                  <p className="mt-1 text-sm font-semibold text-zinc-500 sm:hidden">
                    Public profile · Orange County, CA
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="-mt-1 px-1 sm:px-4 lg:px-10">
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                My Clique
              </p>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500">
                {clique.length}/{maxCliqueSize}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/messages"
                className="inline-flex h-10 w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="4" y="5" width="16" height="14" rx="4" />
                  <path d="M8 10h8" />
                  <path d="M8 14h5" />
                  <path d="m9 19-3 3" />
                </svg>
                Messages
              </Link>
              <button
                type="button"
                onClick={() => setIsCliqueEditorOpen(true)}
                className="inline-flex h-10 w-fit items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                Edit Clique
              </button>
            </div>
          </div>
          <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-start gap-6 py-2">
              {clique.map((person) => (
                <div
                  key={person.name}
                  className="flex w-24 shrink-0 flex-col items-center"
                >
                  <div className="relative rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300 p-1">
                    <div className="rounded-full bg-[#fbfbfb] p-1">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100">
                        <Image
                          src={person.avatar}
                          alt={`${person.name} profile photo`}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      {"unreadMessages" in person ? (
                        <span
                          className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full border-2 border-[#fbfbfb] bg-zinc-950 text-white shadow-sm shadow-zinc-300"
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
                  <p className="mt-2 max-w-20 truncate text-center text-sm font-semibold text-zinc-700">
                    {person.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              {activeProfileView === "pins" ? (
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  My Pins
                </p>
              ) : null}
              <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                {activeProfileView === "boards"
                  ? "My Brag Boards"
                  : "Progress I am watching."}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="inline-flex h-11 rounded-full border border-zinc-200 bg-white p-1 shadow-sm shadow-zinc-200"
                aria-label="Profile content view"
              >
                <button
                  type="button"
                  onClick={() => setActiveProfileView("boards")}
                  aria-pressed={activeProfileView === "boards"}
                  className={`grid h-9 w-10 place-items-center rounded-full text-zinc-600 transition ${
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
                  className={`grid h-9 w-10 place-items-center rounded-full text-zinc-600 transition ${
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
                  className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <span aria-hidden="true" className="text-lg leading-none">
                    +
                  </span>
                  Create Board
                </Link>
              ) : null}
            </div>
          </div>

          {activeProfileView === "boards" ? (
            <div className="grid grid-cols-2 gap-3 [grid-auto-flow:dense] [grid-auto-rows:minmax(0,calc((100vw-2.5rem-0.75rem)/2))] sm:gap-4 sm:[grid-auto-rows:minmax(0,calc((100vw-4rem-1rem)/2))] lg:grid-cols-4 lg:[grid-auto-rows:minmax(0,calc((min(100vw,80rem)-5rem-3rem)/4))]">
              {tiles.map((tile) => {
                const size = profileBoardSizes[tile.size];

                return (
                  <Link
                    key={tile.name}
                    href={tile.href}
                    className={`group relative flex min-w-0 overflow-hidden rounded-[1.35rem] border border-white/70 bg-zinc-900 shadow-sm shadow-zinc-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:rounded-[1.5rem] ${size.tile}`}
                  >
                    {tile.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                        style={{ backgroundImage: `url(${tile.image})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,#123c36_0%,#375a4f_48%,#efe2b8_100%)]" />
                    )}

                    <div className="absolute inset-x-0 bottom-0 h-3/5 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,black_42%,black_100%)]" />
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
                          className={`mt-3 max-w-md text-white/82 ${size.description}`}
                        >
                          {tile.description}
                        </p>
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
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {pinnedJourneys.map((pin) => (
                <article
                  key={pin.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-zinc-950">
                        {pin.title}
                      </p>
                      <p className="mt-1 text-xs font-bold text-zinc-500">
                        {pin.owner} · {pin.location}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500">
                      {pin.pins}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-black text-white">
                      {pin.board}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                      {pin.progress}
                    </span>
                  </div>

                  <p className="mt-4 text-sm font-semibold leading-6 text-zinc-600">
                    {pin.update}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {isCliqueEditorOpen ? (
        <section className="fixed inset-0 z-50 grid place-items-center bg-[#fbfbfb]/28 px-5 py-8 backdrop-blur-[5px]">
          <div className="animate-modal-in w-full max-w-2xl rounded-[1.75rem] border border-white/70 bg-white/72 p-5 shadow-2xl shadow-zinc-950/18 ring-1 ring-white/50 backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <button
                  type="button"
                  onClick={() => setIsCliqueEditorOpen(false)}
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-300/70 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
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
              <span className="w-fit rounded-full bg-white/65 px-3 py-1 text-xs font-black text-zinc-500 shadow-sm shadow-zinc-200/70">
                {clique.length}/{maxCliqueSize}
              </span>
            </div>

            <div className="mt-6 rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm shadow-zinc-300/70 backdrop-blur-xl">
              {clique.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4">
                  {clique.map((person) => (
                    <div
                      key={person.name}
                      className="flex min-w-0 flex-col items-center"
                    >
                      <div className="relative rounded-full bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-300 p-1">
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
                      <p className="mt-2 max-w-20 truncate text-center text-sm font-bold text-zinc-700">
                        {person.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-40 place-items-center rounded-3xl bg-zinc-50/80 px-6 text-center">
                  <p className="max-w-sm text-sm font-bold leading-6 text-zinc-500">
                    Your clique is empty. Add only the people you actually want
                    in your corner.
                  </p>
                </div>
              )}

              <button
                className="mt-5 h-12 w-full rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500"
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
