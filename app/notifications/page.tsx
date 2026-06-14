"use client";

import Image from "next/image";
import { useState } from "react";
import { AppNav } from "../components/app-nav";

type Notification = {
  id: number;
  type: "pin" | "cheer" | "comment" | "clique" | "milestone";
  isClique: boolean;
  author?: string;
  avatar?: string;
  content: string;
  target: string;
  time: string;
  unread: boolean;
};

const notifications: Notification[] = [
  {
    id: 1,
    type: "pin",
    isClique: false,
    content: "Someone pinned your arc",
    target: "Sourdough Bread",
    time: "2m ago",
    unread: true,
  },
  {
    id: 2,
    type: "cheer",
    isClique: true,
    author: "Marco",
    avatar: "/guy1.png",
    content: "Marco cheered your brag",
    target: "Gym · Added five pounds to my working set...",
    time: "18m ago",
    unread: true,
  },
  {
    id: 3,
    type: "pin",
    isClique: false,
    content: "Someone pinned your arc",
    target: "Sourdough Bread",
    time: "1h ago",
    unread: true,
  },
  {
    id: 4,
    type: "comment",
    isClique: true,
    author: "Sofia",
    avatar: "/girl1.png",
    content: "Sofia commented on your brag",
    target: "okay this is actually incredible",
    time: "2h ago",
    unread: true,
  },
  {
    id: 5,
    type: "milestone",
    isClique: false,
    content: "Your Music board hit 10 brags",
    target: "The reps are compounding. Keep going.",
    time: "3h ago",
    unread: true,
  },
  {
    id: 6,
    type: "pin",
    isClique: false,
    content: "Someone pinned your arc",
    target: "New Album?? 👀",
    time: "5h ago",
    unread: false,
  },
  {
    id: 7,
    type: "clique",
    isClique: true,
    author: "Nico",
    avatar: "/guy3.png",
    content: "Nico added you to his Clique",
    target: "You're in.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 8,
    type: "cheer",
    isClique: false,
    content: "Someone cheered your brag",
    target: "Food · Cooked instead of ordering...",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 9,
    type: "pin",
    isClique: false,
    content: "Someone pinned your board",
    target: "Music",
    time: "Yesterday",
    unread: false,
  },
  {
    id: 10,
    type: "milestone",
    isClique: false,
    content: "Your Sourdough Bread arc hit 500 pins",
    target: "That's not nothing. That's proof people care about the work.",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 11,
    type: "comment",
    isClique: false,
    content: "Someone commented on your brag",
    target: "Music · Bounced the first rough sequence...",
    time: "2 days ago",
    unread: false,
  },
  {
    id: 12,
    type: "clique",
    isClique: true,
    author: "Elena",
    avatar: "/girl4.png",
    content: "Elena added you to her Clique",
    target: "You're in.",
    time: "3 days ago",
    unread: false,
  },
];

function NotifIcon({ type }: { type: Notification["type"] }) {
  if (type === "pin") return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-950 text-base">
      📌
    </div>
  );
  if (type === "cheer") return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-base">
      🎉
    </div>
  );
  if (type === "comment") return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-base">
      💬
    </div>
  );
  if (type === "clique") return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-base">
      👥
    </div>
  );
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-base">
      🏆
    </div>
  );
}

export default function NotificationsPage() {
  const [read, setRead] = useState<Set<number>>(new Set());

  const unreadCount = notifications.filter((n) => n.unread && !read.has(n.id)).length;

  const todayNotifs = notifications.filter((n) => !["Yesterday", "2 days ago", "3 days ago"].includes(n.time));
  const yesterdayNotifs = notifications.filter((n) => n.time === "Yesterday");
  const olderNotifs = notifications.filter((n) => ["2 days ago", "3 days ago"].includes(n.time));

  function markAllRead() {
    setRead(new Set(notifications.map((n) => n.id)));
  }

  function isUnread(n: Notification) {
    return n.unread && !read.has(n.id);
  }

  function renderNotif(n: Notification) {
    const unread = isUnread(n);

    return (
      <div
        key={n.id}
        onClick={() => setRead((prev) => new Set([...prev, n.id]))}
        className={`flex cursor-pointer items-start gap-3.5 rounded-2xl p-3.5 transition ${unread ? "bg-white shadow-sm shadow-zinc-200 ring-1 ring-zinc-200 hover:shadow-md" : "hover:bg-zinc-100"}`}
      >
        {/* Avatar or icon */}
        {n.isClique && n.avatar ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-2 ring-white">
            <Image src={n.avatar} alt={n.author ?? ""} fill sizes="40px" className="object-cover" />
          </div>
        ) : (
          <NotifIcon type={n.type} />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-zinc-950">{n.content}</p>
          <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-zinc-400">{n.target}</p>
          <p className="mt-1 text-xs font-semibold text-zinc-400">{n.time}</p>
        </div>

        {unread && (
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zinc-950" />
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-6 sm:px-8">
        <AppNav active="Alerts" />

        <header className="px-1 py-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Activity
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Alerts
              </h1>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="mb-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-black text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:text-zinc-950"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Anonymous note */}
          <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
              How this works
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-600">
              Your Clique members show up by name. Everyone else is{" "}
              <span className="font-black text-zinc-950">Someone</span> — because the point is that the work resonated, not who specifically.
            </p>
          </div>
        </header>

        <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 shadow-sm">
          {/* Today */}
          {todayNotifs.length > 0 && (
            <section>
              <p className="px-5 pt-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Today
              </p>
              <div className="mt-2 px-2">
                {todayNotifs.map(renderNotif)}
              </div>
            </section>
          )}

          {/* Yesterday */}
          {yesterdayNotifs.length > 0 && (
            <section className="border-t border-zinc-100">
              <p className="px-5 pt-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Yesterday
              </p>
              <div className="mt-2 px-2">
                {yesterdayNotifs.map(renderNotif)}
              </div>
            </section>
          )}

          {/* Older */}
          {olderNotifs.length > 0 && (
            <section className="border-t border-zinc-100 pb-2">
              <p className="px-5 pt-5 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Earlier
              </p>
              <div className="mt-2 px-2">
                {olderNotifs.map(renderNotif)}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
