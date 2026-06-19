"use client";

import Image from "next/image";
import { useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppNav } from "../../../../components/app-nav";
import { BragAttachments } from "../../../../components/brag-attachments";
import { CommentsSheet } from "../../../../components/comments-sheet";
import { boardCoverBackground, useBoardPreferences, useCreatedBoards } from "../../../../lib/boards";
import { useArcMeta } from "../../../../lib/arcs";
import {
  createBrag,
  deleteBrag,
  formatBragDate,
  useCheers,
  useCreatedBrags,
  type BragPost,
} from "../../../../lib/brags";

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function ArcPage() {
  const { slug, arcSlug } = useParams<{ slug: string; arcSlug: string }>();
  const router = useRouter();
  const boards = useCreatedBoards();
  const { preferences } = useBoardPreferences();
  const allBrags = useCreatedBrags();
  const { cheeredIds, toggleCheer } = useCheers();
  const { getArcMeta, updateArcMeta } = useArcMeta();

  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentPost, setCommentPost] = useState<BragPost | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAbout, setEditAbout] = useState("");

  const beginningRef = useRef<HTMLDivElement>(null);

  const board = boards.find((b) => nameToSlug(b.name) === slug);
  const pref = board ? preferences[board.name] : undefined;
  const displayName = pref?.title?.trim() || board?.name || "";
  const displayCover = board?.cover ?? pref?.cover;

  const arcName = useMemo(() => {
    if (!board) return "";
    const arcNames = [...new Set(
      allBrags.filter((b) => b.board === board.name && b.arc).map((b) => b.arc as string)
    )];
    return arcNames.find((n) => nameToSlug(n) === arcSlug) ?? decodeURIComponent(arcSlug);
  }, [board, allBrags, arcSlug]);

  // Newest first — oldest is at the bottom (the beginning of the journey)
  const arcBrags = useMemo(() => {
    if (!board || !arcName) return [];
    return allBrags.filter((b) => b.board === board.name && b.arc === arcName);
  }, [board, allBrags, arcName]);

  const arcMeta = board ? getArcMeta(board.name, arcName) : {};
  const displayArcTitle = arcMeta.title?.trim() || arcName;

  const coverStyle = displayCover
    ? { backgroundImage: boardCoverBackground(displayCover) }
    : { backgroundImage: "radial-gradient(circle at 20% 24%, rgba(56,189,248,0.55), transparent 34%), linear-gradient(135deg, #07111f 0%, #12345b 54%, #0f766e 100%)" };

  if (!board) {
    return (
      <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-6 sm:px-8">
          <AppNav active="Boards" />
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm shadow-zinc-200">
            <p className="text-2xl font-black text-zinc-950">Board not found.</p>
          </div>
        </section>
      </main>
    );
  }

  function handlePost() {
    if (!composeText.trim() || posting) return;
    setPosting(true);
    window.setTimeout(() => {
      createBrag({
        text: composeText.trim(),
        board: board!.name,
        visibility: "Clique only",
        arc: arcName,
        bragToFeed: true,
      });
      setComposeText("");
      setComposerOpen(false);
      setPosting(false);
    }, 560);
  }

  function openEdit() {
    setEditTitle(arcMeta.title?.trim() || arcName);
    setEditAbout(arcMeta.about?.trim() || "");
    setEditOpen(true);
  }

  function saveEdit() {
    updateArcMeta(board!.name, arcName, {
      title: editTitle.trim() || arcName,
      about: editAbout.trim(),
    });
    setEditOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-6 sm:px-8">
        <AppNav active="Boards" />

        <header
          className="relative min-h-56 overflow-hidden rounded-[1.75rem] bg-cover bg-center text-white shadow-sm shadow-zinc-200"
          style={coverStyle}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.22)_38%,rgba(0,0,0,0.84)_100%)]" />
          <div className="relative z-10 flex min-h-56 flex-col justify-between p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push(`/boards/${slug}?view=arcs`)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/14 px-4 text-sm font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/24"
              >
                <span aria-hidden="true">←</span>
                {displayName}
              </button>
              <button
                type="button"
                onClick={openEdit}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/14 text-white backdrop-blur-md transition hover:bg-white/24"
                aria-label="Edit arc"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {arcBrags.length} {arcBrags.length === 1 ? "brag" : "brags"}
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">Active</span>
              </div>
              <h1 className="mt-4 break-words text-4xl font-black leading-none tracking-tight sm:text-5xl">
                {displayArcTitle}
              </h1>
              {arcMeta.about?.trim() ? (
                <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/70">{arcMeta.about}</p>
              ) : null}
            </div>
          </div>
        </header>

        {/* Edit arc panel */}
        {editOpen ? (
          <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200">
            <div className="p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">Edit Arc</p>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Arc title"
                className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-base font-black text-zinc-950 outline-none transition focus:border-zinc-950 focus:bg-white"
              />
              <textarea
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                placeholder="What is this arc about? Give it some context…"
                rows={3}
                className="mt-2 min-h-24 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none transition focus:border-zinc-950 focus:bg-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-3 sm:px-6">
              <button type="button" onClick={() => setEditOpen(false)} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
              <button type="button" onClick={saveEdit} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800">Save</button>
            </div>
          </article>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Brags</h2>
            {arcBrags.length > 1 && (
              <button
                type="button"
                onClick={() => beginningRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-black text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-950"
              >
                ↓ Beginning
              </button>
            )}
          </div>
          {!composerOpen && (
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="profile-primary-button inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              <span aria-hidden="true" className="text-lg leading-none">+</span>
              Add Brag
            </button>
          )}
        </div>

        {composerOpen ? (
          <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200">
            <div className="flex items-start gap-3 p-5 sm:p-6">
              <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-zinc-100">
                <Image src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg" alt="You" fill sizes="40px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{displayArcTitle}</p>
                <textarea
                  autoFocus
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
                  placeholder="What did you do?"
                  rows={4}
                  className="min-h-28 w-full resize-none bg-transparent text-base font-semibold leading-7 text-zinc-800 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-5 py-3 sm:px-6">
              <button type="button" onClick={() => { setComposeText(""); setComposerOpen(false); }} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
              <button type="button" onClick={handlePost} disabled={!composeText.trim() || posting} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
                {posting ? "Posting…" : "Brag"}
              </button>
            </div>
          </article>
        ) : null}

        {arcBrags.length === 0 && !composerOpen ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
            <div>
              <p className="mb-3 text-4xl">🎯</p>
              <p className="text-xl font-black tracking-tight text-zinc-950">Nothing bragged yet.</p>
              <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-zinc-500">
                Log your first moment inside this arc.
              </p>
              <button type="button" onClick={() => setComposerOpen(true)} className="profile-primary-button mt-5 inline-flex h-10 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800">
                Log first brag
              </button>
            </div>
          </div>
        ) : null}

        {arcBrags.length > 0 ? (
          <div className="relative pb-4">
            <div className="absolute left-[5px] top-2 bottom-0 w-px bg-zinc-200" />

            <div className="flex flex-col gap-10">
              {arcBrags.map((post, index) => {
                const isCheered = cheeredIds.has(String(post.id));
                const isFirst = index === 0;
                const isLast = index === arcBrags.length - 1;
                const hasMedia = Boolean(post.attachments?.length) || (post.type === "photo" && Boolean(post.image));
                return (
                  <div key={post.id} ref={isLast ? beginningRef : undefined} className="relative flex gap-5 pl-8">
                    {/* Newest = filled black dot, older = gray */}
                    <div className={`absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-[#fbfbfb] ${isFirst ? "bg-zinc-950" : "bg-zinc-400"}`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                          {formatBragDate(post)}{isFirst ? " · Latest" : isLast ? " · Beginning" : ""}
                        </span>
                        <div className="relative shrink-0">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }} className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700" aria-label="Post options">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                          </button>
                          {openMenuId === post.id ? (
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteBrag(post.id); setOpenMenuId(null); }} className="flex w-full items-center px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50">Delete</button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {post.attachments?.length ? (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
                          <BragAttachments attachments={post.attachments} />
                        </div>
                      ) : post.type === "photo" && post.image ? (
                        <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100">
                          <Image src={post.image} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" unoptimized />
                        </div>
                      ) : null}

                      {post.text ? (
                        <p className={`mt-2 leading-snug text-zinc-950 ${hasMedia ? "text-base font-semibold" : "text-xl font-black tracking-tight sm:text-2xl"}`}>
                          {post.text}
                        </p>
                      ) : null}

                      <div className="mt-3 flex items-center gap-2">
                        <button type="button" onClick={() => toggleCheer(post.id)} className={`h-8 rounded-full px-3.5 text-xs font-black transition ${isCheered ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                          Cheer {post.cheers + (isCheered ? 1 : 0)}
                        </button>
                        <button type="button" onClick={() => setCommentPost(post)} className="h-8 rounded-full bg-zinc-100 px-3.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-200">
                          Comment {post.comments}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <CommentsSheet post={commentPost} onClose={() => setCommentPost(null)} />
      </section>
    </main>
  );
}
