"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type ChangeEvent } from "react";
import { AppNav } from "./components/app-nav";
import { CommentsSheet } from "./components/comments-sheet";
import { BragAttachments } from "./components/brag-attachments";
import { createBrag, deleteBrag, type BragAttachment, useBrags, useCheers, usePinnedBoards, formatBragDate } from "./lib/brags";
import { bragPrompts } from "./lib/prompts";
import { useCreatedBoards } from "./lib/boards";

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("load"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const allPosts = useBrags();
  const createdBoards = useCreatedBoards();
  const livePosts = allPosts.filter((post) => post.bragToFeed !== false);
  const totalCheers = livePosts.reduce((total, post) => total + post.cheers, 0);

  type FeedView = "All" | "My Clique" | "My Pins";
  const feedViews: FeedView[] = ["All", "My Clique", "My Pins"];
  const [feedView, setFeedView] = useState<FeedView>("All");
  const { pinnedBoards, togglePin } = usePinnedBoards();

  const pinnedUpdates = livePosts.filter((post) => pinnedBoards.has(post.board));

  const filteredPosts =
    feedView === "My Clique"
      ? livePosts.filter((p) => p.source !== "Private")
      : feedView === "My Pins"
        ? pinnedUpdates
        : livePosts;

  const allBoardOptions = createdBoards.map((b) => b.name);

  const [quickBragOpen, setQuickBragOpen] = useState(false);
  const [quickBragText, setQuickBragText] = useState("");
  const [quickBragBoard, setQuickBragBoard] = useState("");
  const [quickBragImage, setQuickBragImage] = useState("");
  const [quickBragImageLoading, setQuickBragImageLoading] = useState(false);
  const [quickBragImageError, setQuickBragImageError] = useState("");
  const [quickBragPosting, setQuickBragPosting] = useState(false);
  const { cheeredIds, toggleCheer } = useCheers();
  const [promptIndex, setPromptIndex] = useState(0);
  const [commentPost, setCommentPost] = useState<(typeof livePosts)[0] | null>(null);
  const [feedDropdownOpen, setFeedDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPromptIndex(Math.floor(Math.random() * bragPrompts.length));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!feedDropdownOpen) return;
    function close() { setFeedDropdownOpen(false); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [feedDropdownOpen]);
  const [toastBoard, setToastBoard] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    function close() { setOpenMenuId(null); }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

  function openQuickBrag() {
    setQuickBragText("");
    setQuickBragBoard(allBoardOptions[0] ?? "");
    setQuickBragImage("");
    setQuickBragImageError("");
    setQuickBragOpen(true);
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuickBragImageLoading(true);
    setQuickBragImageError("");
    try {
      const compressed = await compressImage(file);
      setQuickBragImage(compressed);
    } catch {
      setQuickBragImageError("Couldn't load that photo. Try another.");
    } finally {
      setQuickBragImageLoading(false);
    }
    e.target.value = "";
  }

  function handleQuickBrag() {
    const text = quickBragText.trim();
    if (!text || quickBragPosting) return;
    setQuickBragPosting(true);
    const board = quickBragBoard;
    setTimeout(() => {
      const attachments: BragAttachment[] = quickBragImage
        ? [{ id: String(Date.now()), url: quickBragImage, kind: "image", name: "photo.jpg", mimeType: "image/jpeg" }]
        : [];
      createBrag({ text, board, visibility: "Clique only", bragToFeed: true, attachments: attachments.length ? attachments : undefined });
      setQuickBragText("");
      setQuickBragImage("");
      setQuickBragOpen(false);
      setQuickBragPosting(false);
      setToastBoard(board);
      setTimeout(() => setToastBoard(""), 2600);
    }, 650);
  }

  function getSourceLabel(post: (typeof livePosts)[number]) {
    if (post.arc) return `Arc · ${post.arc}`;
    if (post.source === "Private") return "Private";
    return post.source === "Public" ? "Public" : "Clique";
  }

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
              <div className="relative mt-3">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFeedDropdownOpen((v) => !v); }}
                  className="flex items-center gap-2 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl"
                >
                  {feedView}
                  <svg
                    className={`mt-1 h-6 w-6 shrink-0 transition-transform sm:h-7 sm:w-7 ${feedDropdownOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {feedDropdownOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 min-w-48 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
                    {feedViews.map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFeedView(view); setFeedDropdownOpen(false); }}
                        className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-black transition hover:bg-zinc-50 ${feedView === view ? "text-zinc-950" : "text-zinc-500"}`}
                      >
                        {view}
                        {feedView === view && (
                          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" fill="none"/></svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,42rem)_1fr] lg:px-10">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Quick Brag
            </p>
            <button
              type="button"
              onClick={openQuickBrag}
              className="flex w-full items-center gap-3 rounded-full border border-zinc-200 bg-white py-2 pl-2 pr-6 text-left shadow-sm shadow-zinc-200 transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200">
                <Image
                  src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg"
                  alt="Your profile photo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <span className="text-sm font-normal text-zinc-300">
                {bragPrompts[promptIndex]}
              </span>
            </button>




            {filteredPosts.map((post) => {
              const hasMedia =
                Boolean(post.attachments?.length) ||
                post.type === "photo" ||
                post.type === "video";
              const isLongText = post.text.length > 110;

              return (
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
                        {post.board} · {formatBragDate(post)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <div className="flex flex-wrap justify-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          post.arc
                            ? "bg-zinc-950 text-white"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {getSourceLabel(post)}
                      </span>
                      {"pins" in post ? (
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                          {post.pins} pins
                        </span>
                      ) : null}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === post.id ? null : post.id);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
                        aria-label="Post options"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                      {openMenuId === post.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(post.board);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
                          >
                            {pinnedBoards.has(post.board) ? "Unpin Board" : "📌 Pin Board"}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="flex w-full items-center border-t border-zinc-100 px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteBrag(post.id); setOpenMenuId(null); }}
                            className="flex w-full items-center border-t border-zinc-100 px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
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
                    <p className={`text-zinc-950 ${
                      isLongText
                        ? "text-lg font-semibold leading-8 sm:text-xl"
                        : "text-xl font-black leading-snug tracking-tight sm:text-2xl"
                    }`}>
                      {post.text}
                    </p>
                  </div>
                )}

                {hasMedia && post.text ? (
                  <p className={`px-5 pt-4 text-zinc-700 ${
                    isLongText
                      ? "text-base font-medium leading-7"
                      : "text-base font-semibold leading-7"
                  }`}>
                    {post.text}
                  </p>
                ) : null}

                <div className="flex items-center gap-3 px-5 py-4 text-sm font-black text-zinc-600">
                  <button
                    type="button"
                    onClick={() => toggleCheer(post.id)}
                    className={`rounded-full px-4 py-2 transition ${
                      cheeredIds.has(String(post.id))
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 hover:bg-zinc-950 hover:text-white"
                    }`}
                  >
                    Cheer {post.cheers + (cheeredIds.has(String(post.id)) ? 1 : 0)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentPost(post)}
                    className="rounded-full bg-zinc-100 px-4 py-2 transition hover:bg-zinc-950 hover:text-white"
                  >
                    Comment {post.comments}
                  </button>
                </div>
              </article>
              );
            })}

            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm shadow-zinc-200">
                <p className="text-lg font-black text-zinc-950">
                  {feedView === "My Pins"
                    ? "Nothing pinned yet."
                    : feedView === "My Clique"
                      ? "Your clique is quiet right now."
                      : allBoardOptions.length === 0
                        ? "No boards yet."
                        : "Nothing posted yet."}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  {feedView === "My Pins"
                    ? "Pin a board from someone's post to follow their progress."
                    : allBoardOptions.length === 0
                      ? "Create a board first, then start logging your proof."
                      : "Be the first to post something."}
                </p>
                {allBoardOptions.length === 0 ? (
                  <Link
                    href="/boards/new"
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                  >
                    Create a board
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openQuickBrag}
                    className="mt-5 inline-flex h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                  >
                    Post a brag
                  </button>
                )}
              </div>
            ) : null}
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
                    pinned board updates
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

      {quickBragOpen ? (
        <section
          className="clique-editor-backdrop fixed inset-0 z-50 grid place-items-start justify-center overflow-y-auto bg-[#fbfbfb]/28 px-5 py-16 backdrop-blur-[5px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickBragOpen(false);
          }}
        >
          <div className="brag-flow-card animate-modal-in w-full max-w-xl rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-950/10 sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Quick Brag
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950">
                  What did you prove?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuickBragOpen(false)}
                className="brag-flow-secondary inline-flex h-9 items-center rounded-full border border-zinc-200 bg-transparent px-4 text-sm font-black text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950"
              >
                Cancel
              </button>
            </div>

            <textarea
              autoFocus
              value={quickBragText}
              onChange={(e) => setQuickBragText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleQuickBrag();
              }}
              placeholder="What did you prove, finish, attempt, repair, ship, or move forward?"
              rows={4}
              className="brag-flow-input mt-5 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base font-medium leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
            />

            <div className="mt-3">
              {quickBragImage ? (
                <div className="relative h-52 overflow-hidden rounded-2xl bg-zinc-100">
                  <Image
                    src={quickBragImage}
                    alt="Selected"
                    fill
                    sizes="(min-width: 640px) 36rem, calc(100vw - 2.5rem)"
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setQuickBragImage("")}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-zinc-950/70 text-white backdrop-blur-sm transition hover:bg-zinc-950"
                    aria-label="Remove photo"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <label className="brag-flow-secondary inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 bg-transparent px-4 py-2 text-sm font-black text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950">
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                  {quickBragImageLoading ? "Loading..." : "Add photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={quickBragImageLoading}
                    className="sr-only"
                  />
                </label>
              )}
              {quickBragImageError ? (
                <p className="mt-2 text-xs font-bold text-red-600">{quickBragImageError}</p>
              ) : null}
            </div>

            <div className="mt-4">
              <p className="text-sm font-black text-zinc-700">Board</p>
              {allBoardOptions.length === 0 ? (
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  <Link href="/boards/new" className="font-black text-zinc-950 underline underline-offset-2" onClick={() => setQuickBragOpen(false)}>
                    Create a board
                  </Link>{" "}first to start logging brags.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {allBoardOptions.map((board) => (
                    <button
                      key={board}
                      type="button"
                      onClick={() => setQuickBragBoard(board)}
                      className={`rounded-full px-4 py-2 text-sm font-black transition ${
                        quickBragBoard === board
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
                      }`}
                    >
                      {board}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-5">
              <button
                type="button"
                onClick={handleQuickBrag}
                disabled={!quickBragText.trim() || quickBragPosting || !quickBragBoard}
                className="quick-brag-btn h-12 flex-1 rounded-full px-5 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <span className="quick-brag-idle-shimmer" aria-hidden="true" />
                {quickBragPosting ? <span className="quick-brag-click-glint" aria-hidden="true" /> : null}
                Brag
              </button>
              <Link
                href="/brags/new"
                className="brag-flow-secondary inline-flex h-12 shrink-0 items-center rounded-full border border-zinc-200 px-5 text-sm font-black text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950"
                onClick={() => setQuickBragOpen(false)}
              >
                Add detail →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {toastBoard ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-5 md:bottom-8">
          <div className="brag-toast inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-zinc-950/20">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
            Bragged to {toastBoard}
          </div>
        </div>
      ) : null}
      <CommentsSheet post={commentPost} onClose={() => setCommentPost(null)} />
    </main>
  );
}
