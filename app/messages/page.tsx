import Image from "next/image";
import { AppNav } from "../components/app-nav";

const threads = [
  {
    name: "Sofia",
    avatar: "/girl1.png",
    unread: 2,
    time: "12m",
    preview: "That Reading brag was actually the push I needed today.",
    board: "Reading",
    active: true,
  },
  {
    name: "Nico",
    avatar: "/guy3.png",
    unread: 1,
    time: "38m",
    preview: "Send me the dashboard when you get a second.",
    board: "Career",
    active: false,
  },
  {
    name: "Elena",
    avatar: "/girl4.png",
    unread: 3,
    time: "1h",
    preview: "Cardio before excuses is a crazy line, I am stealing that.",
    board: "Gym",
    active: false,
  },
  {
    name: "Marco",
    avatar: "/guy1.png",
    unread: 0,
    time: "Yesterday",
    preview: "Leg day tomorrow. Accountability check?",
    board: "Gym",
    active: false,
  },
];

const messages = [
  {
    sender: "Sofia",
    text: "That Reading brag was actually the push I needed today.",
    align: "left",
  },
  {
    sender: "You",
    text: "Good. That is exactly why I posted it. Small win, real proof.",
    align: "right",
  },
  {
    sender: "Sofia",
    text: "Pinning your Reading board. I want to see the streak keep going.",
    align: "left",
  },
];

export default function MessagesPage() {
  const unreadTotal = threads.reduce((total, thread) => total + thread.unread, 0);

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Messages" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Clique Messages
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                DMs from your real circle.
              </h1>
            </div>
            <span className="w-fit rounded-full bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm shadow-zinc-300">
              {unreadTotal} unread
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[22rem_1fr] lg:px-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm shadow-zinc-200">
            <div className="grid gap-2">
              {threads.map((thread) => (
                <button
                  key={thread.name}
                  type="button"
                  className={`flex min-w-0 items-center gap-3 rounded-2xl p-3 text-left transition ${
                    thread.active
                      ? "bg-zinc-950 text-white"
                      : "bg-white text-zinc-950 hover:bg-zinc-50"
                  }`}
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                    <Image
                      src={thread.avatar}
                      alt={`${thread.name} profile photo`}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-black">
                        {thread.name}
                      </p>
                      <span
                        className={`text-xs font-black ${
                          thread.active ? "text-white/60" : "text-zinc-400"
                        }`}
                      >
                        {thread.time}
                      </span>
                    </div>
                    <p
                      className={`mt-1 truncate text-xs font-bold ${
                        thread.active ? "text-white/70" : "text-zinc-500"
                      }`}
                    >
                      {thread.preview}
                    </p>
                  </div>
                  {thread.unread > 0 ? (
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${
                        thread.active
                          ? "bg-white text-zinc-950"
                          : "bg-zinc-950 text-white"
                      }`}
                    >
                      {thread.unread}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <section className="flex min-h-[34rem] flex-col rounded-3xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-200 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  <Image
                    src="/girl1.png"
                    alt="Sofia profile photo"
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-950">
                    Sofia
                  </p>
                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    Clique · Reading
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500">
                Clique only
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
              {messages.map((message) => (
                <div
                  key={message.text}
                  className={`flex ${
                    message.align === "right" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm font-semibold leading-6 ${
                      message.align === "right"
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 p-4">
              <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 p-2">
                <input
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-zinc-700 outline-none placeholder:text-zinc-400"
                  placeholder="Message Sofia..."
                  type="text"
                />
                <button
                  type="button"
                  className="h-10 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}
