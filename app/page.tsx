"use client";

import Image from "next/image";
import Link from "next/link";
import { AppNav } from "./components/app-nav";
import { BragAttachments } from "./components/brag-attachments";
import { type BragPost, useBrags } from "./lib/brags";

const posts: BragPost[] = [
  {
    id: 1,
    author: "Marco",
    avatar: "/guy1.png",
    board: "Gym",
    source: "Clique",
    time: "18m",
    type: "photo",
    image: "/gym.jpg",
    text: "Added five pounds to my working set and kept the form clean. Tiny jump, real momentum.",
    cheers: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Leo",
    avatar: "/guy2.png",
    board: "Reading",
    source: "Clique",
    time: "42m",
    type: "text",
    text: "Finished the chapter I kept putting off. Not dramatic, but I showed up before checking my phone and that feels like the win.",
    cheers: 9,
    comments: 1,
  },
  {
    id: 3,
    author: "Nico",
    avatar: "/guy3.png",
    board: "Career",
    source: "Clique",
    time: "1h",
    type: "photo",
    image: "/career.jpg",
    text: "Shipped the first pass of the dashboard. It is not perfect yet, but it is finally real enough to improve.",
    cheers: 18,
    comments: 5,
  },
  {
    id: 4,
    author: "Anthony",
    avatar: "/guy4.png",
    board: "Faith",
    source: "Clique",
    time: "2h",
    type: "text",
    text: "Ten quiet minutes this morning. Wrote down three things I am grateful for and carried that into the day.",
    cheers: 15,
    comments: 2,
  },
  {
    id: 5,
    author: "Dante",
    avatar: "/guy5.png",
    board: "Reading",
    source: "Clique",
    time: "3h",
    type: "text",
    text: "Read twenty pages after dinner instead of drifting. The streak is starting to feel like identity, not effort.",
    cheers: 11,
    comments: 4,
  },
  {
    id: 6,
    author: "Luca",
    avatar: "/guy6.png",
    board: "Gym",
    source: "Clique",
    time: "4h",
    type: "photo",
    image: "/gym.jpg",
    text: "Hit the planned session even with low energy. Kept it simple, finished every set, and left proud.",
    cheers: 14,
    comments: 2,
  },
  {
    id: 7,
    author: "Sofia",
    avatar: "/girl1.png",
    board: "Reading",
    source: "Clique",
    time: "5h",
    type: "text",
    text: "Finished the essay notes before lunch. Small deadline, handled cleanly.",
    cheers: 16,
    comments: 3,
  },
  {
    id: 8,
    author: "Gianna",
    avatar: "/girl2.png",
    board: "Faith",
    source: "Clique",
    time: "6h",
    type: "text",
    text: "Made time to journal when the day got loud. Five minutes was enough to reset the whole mood.",
    cheers: 13,
    comments: 2,
  },
  {
    id: 9,
    author: "Mia",
    avatar: "/girl3.png",
    board: "Career",
    source: "Clique",
    time: "7h",
    type: "photo",
    image: "/career.jpg",
    text: "Sent the follow-up I had been overthinking. Clear, direct, done.",
    cheers: 20,
    comments: 6,
  },
  {
    id: 10,
    author: "Elena",
    avatar: "/girl4.png",
    board: "Gym",
    source: "Clique",
    time: "8h",
    type: "photo",
    image: "/gym.jpg",
    text: "Showed up for cardio before the excuses got organized. Future me gets the credit.",
    cheers: 17,
    comments: 4,
  },
  {
    id: 11,
    author: "Bella",
    avatar: "/girl5.png",
    board: "Reading",
    source: "Clique",
    time: "9h",
    type: "text",
    text: "Started a new book and actually put the phone in another room. That was the real achievement.",
    cheers: 12,
    comments: 1,
  },
  {
    id: 12,
    author: "Sarah",
    avatar: "/girl4.png",
    board: "Ironman Training",
    source: "Pinned Journey",
    time: "10h",
    type: "text",
    text: "Longest swim of the block is done. I wanted to quit at 1,500 yards and finished the whole plan anyway.",
    cheers: 41,
    comments: 9,
    pins: 493,
  },
  {
    id: 13,
    author: "Maya",
    avatar: "/girl3.png",
    board: "LSAT 170 Push",
    source: "Pinned Journey",
    time: "11h",
    type: "text",
    text: "Timed logic games finally clicked today. Not perfect, but it felt like proof that the reps are compounding.",
    cheers: 36,
    comments: 7,
    pins: 301,
  },
  {
    id: 14,
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board: "New Album?? 👀",
    source: "Clique",
    time: "12h",
    type: "photo",
    image: "/music.png",
    text: "Bounced the first rough sequence. Still messy, but the project finally has a shape.",
    cheers: 22,
    comments: 5,
  },
  {
    id: 15,
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board: "Food",
    source: "Clique",
    time: "13h",
    type: "photo",
    image: "/food.png",
    text: "Cooked instead of ordering and actually plated it like I cared. Small thing, real proof.",
    cheers: 19,
    comments: 3,
  },
];

export default function Home() {
  const allPosts = useBrags(posts);
  const livePosts = allPosts.filter((post) => post.bragToFeed !== false);
  const totalCheers = livePosts.reduce((total, post) => total + post.cheers, 0);
  const pinnedUpdates = livePosts.filter(
    (post) => post.source === "Pinned Journey",
  );

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Home" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Home
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Progress Feed
              </h1>
            </div>

            <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm shadow-zinc-200">
              {livePosts.length} updates
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,42rem)_1fr] lg:px-10">
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-zinc-950 text-sm font-black text-white">
                  VC
                </div>
                <Link
                  href="/brags/new"
                  className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-500 transition hover:border-zinc-300 hover:bg-white hover:text-zinc-700"
                >
                  What did you accomplish?
                </Link>
              </div>
            </div>

            {livePosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200"
              >
                <div className="flex items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200">
                      <Image
                        src={post.avatar}
                        alt={`${post.author} profile photo`}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-zinc-950">
                        {post.author}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-zinc-500">
                        {post.board} · {post.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        post.source === "Pinned Journey"
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {post.source}
                    </span>
                    {"pins" in post ? (
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                        {post.pins} pins
                      </span>
                    ) : null}
                  </div>
                </div>

                {post.attachments?.length ? (
                  <BragAttachments attachments={post.attachments} />
                ) : post.type === "photo" && post.image ? (
                  <div className="relative aspect-[4/3] w-full bg-zinc-100">
                    <Image
                      src={post.image}
                      alt={`${post.author}'s ${post.board} brag`}
                      fill
                      sizes="(min-width: 1024px) 672px, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : post.type === "video" && post.image ? (
                  <div className="aspect-[4/3] w-full bg-zinc-950">
                    <video
                      src={post.image}
                      controls
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="px-5 pb-2 pt-4">
                    <p className="text-2xl font-black leading-snug tracking-tight text-zinc-950 sm:text-3xl">
                      {post.text}
                    </p>
                  </div>
                )}

                {(post.attachments?.length ||
                  post.type === "photo" ||
                  post.type === "video") &&
                post.text ? (
                  <p className="px-5 pt-4 text-base font-semibold leading-7 text-zinc-700">
                    {post.text}
                  </p>
                ) : null}

                <div className="flex items-center gap-3 px-5 py-4 text-sm font-black text-zinc-600">
                  <button
                    type="button"
                    className="rounded-full bg-zinc-100 px-4 py-2 transition hover:bg-zinc-950 hover:text-white"
                  >
                    Cheer {post.cheers}
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-zinc-100 px-4 py-2 transition hover:bg-zinc-950 hover:text-white"
                  >
                    Comment {post.comments}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Today
              </p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-950">
                Your progress graph is moving.
              </h2>
              <div className="mt-6 grid gap-4">
                <div>
                  <p className="text-3xl font-black tracking-tight">
                    {livePosts.length}
                  </p>
                  <p className="text-sm font-bold text-zinc-500">
                    brags posted
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">
                    {pinnedUpdates.length}
                  </p>
                  <p className="text-sm font-bold text-zinc-500">
                    pinned journey updates
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">
                    {totalCheers}
                  </p>
                  <p className="text-sm font-bold text-zinc-500">
                    cheers shared
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
