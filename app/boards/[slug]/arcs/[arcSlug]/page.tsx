"use client";

import Image from "next/image";
import { useState, useMemo, useRef, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppNav } from "../../../../components/app-nav";
import { BragAttachments } from "../../../../components/brag-attachments";
import { CommentsSheet } from "../../../../components/comments-sheet";
import { boardCoverBackground, useBoardPreferences, useCreatedBoards } from "../../../../lib/boards";
import { useArcMeta, deleteArcMeta } from "../../../../lib/arcs";
import {
  createBrag,
  deleteBrag,
  unlinkBragsFromArc,
  formatBragDate,
  type BragAttachment,
  useCheers,
  useCreatedBrags,
  type BragPost,
} from "../../../../lib/brags";

function nameToSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function slugToTitle(slug: string) {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (/^\d+$/.test(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new window.Image();

      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not prepare image."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };

      image.onerror = () => reject(new Error("Could not load image."));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ArcPage() {
  const { slug, arcSlug } = useParams<{ slug: string; arcSlug: string }>();
  const router = useRouter();
  const boards = useCreatedBoards();
  const { preferences } = useBoardPreferences();
  const allBrags = useCreatedBrags();
  const { cheeredIds, toggleCheer } = useCheers();
  const { getArcMeta, getArcNamesForBoard, updateArcMeta } = useArcMeta();

  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeImage, setComposeImage] = useState("");
  const [composeImageLoading, setComposeImageLoading] = useState(false);
  const [composeImageError, setComposeImageError] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentPost, setCommentPost] = useState<BragPost | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editCompleted, setEditCompleted] = useState(false);
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [shareComplete, setShareComplete] = useState(false);
  const [shareText, setShareText] = useState("");

  const beginningRef = useRef<HTMLDivElement>(null);

  const board = boards.find((b) => nameToSlug(b.name) === slug);
  const pref = board ? preferences[board.name] : undefined;
  const displayName = pref?.title?.trim() || board?.name || "";
  const displayCover = board?.cover ?? pref?.cover;

  const arcName = useMemo(() => {
    if (!board) return "";
    const fromBrags = [...new Set(
      allBrags.filter((b) => b.board === board.name && b.arc).map((b) => b.arc as string)
    )];
    const fromMeta = getArcNamesForBoard(board.name);
    const allArcNames = [...new Set([...fromBrags, ...fromMeta])];
    return allArcNames.find((n) => nameToSlug(n) === arcSlug) ?? slugToTitle(arcSlug);
  }, [board, allBrags, arcSlug, getArcNamesForBoard]);

  // Newest first — oldest is at the bottom (the beginning of the journey)
  const arcBrags = useMemo(() => {
    if (!board || !arcName) return [];
    return allBrags.filter((b) => b.board === board.name && b.arc === arcName);
  }, [board, allBrags, arcName]);

  const arcMeta = board ? getArcMeta(board.name, arcName) : {};
  const displayArcTitle = arcMeta.title?.trim() || arcName;
  const isCompleted = Boolean(arcMeta.completed);

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

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setComposeImageLoading(true);
    setComposeImageError("");

    try {
      const image = await compressImage(file);
      setComposeImage(image);
    } catch {
      setComposeImageError("That photo could not be prepared. Try another.");
    } finally {
      setComposeImageLoading(false);
    }

    event.target.value = "";
  }

  function resetComposer() {
    setComposeText("");
    setComposeImage("");
    setComposeImageError("");
  }

  function handlePost() {
    const text = composeText.trim();
    if ((!text && !composeImage) || posting) return;
    setPosting(true);
    window.setTimeout(() => {
      const attachments: BragAttachment[] = composeImage
        ? [
            {
              id: String(Date.now()),
              url: composeImage,
              kind: "image",
              name: "photo.jpg",
              mimeType: "image/jpeg",
            },
          ]
        : [];

      createBrag({
        text,
        board: board!.name,
        visibility: "Clique only",
        attachments: attachments.length ? attachments : undefined,
        arc: arcName,
        bragToFeed: true,
      });
      resetComposer();
      setComposerOpen(false);
      setPosting(false);
    }, 560);
  }

  function openEdit() {
    setEditTitle(arcMeta.title?.trim() || arcName);
    setEditAbout(arcMeta.about?.trim() || "");
    setEditCompleted(Boolean(arcMeta.completed));
    setEditIsPublic(arcMeta.isPublic !== false);
    setEditOpen(true);
  }

  function saveEdit() {
    updateArcMeta(board!.name, arcName, {
      title: editTitle.trim() || arcName,
      about: editAbout.trim(),
      completed: editCompleted,
      isPublic: editIsPublic,
    });
    setEditOpen(false);
    setDeleteConfirm(false);
  }

  function handleDeleteArc() {
    unlinkBragsFromArc(board!.name, arcName);
    deleteArcMeta(board!.name, arcName);
    router.push(`/boards/${slug}?view=arcs`);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-6 sm:px-8">
        <AppNav active="Boards" />

        <header
          className="relative min-h-72 overflow-hidden rounded-[1.75rem] bg-cover bg-center text-white shadow-sm shadow-zinc-200"
          style={coverStyle}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.22)_38%,rgba(0,0,0,0.84)_100%)]" />
          {isCompleted ? <div className="absolute inset-0 bg-emerald-500/15" /> : null}
          <div className="relative z-10 flex min-h-72 flex-col justify-between p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push(`/boards/${slug}?view=arcs`)}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/14 px-4 text-sm font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/24"
              >
                <span aria-hidden="true">←</span>
                {displayName}
              </button>
              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-4 py-2 backdrop-blur-md">
                    <svg className="h-4 w-4 text-emerald-300" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    <span className="text-sm font-black text-emerald-300">Complete</span>
                    <button type="button" onClick={() => updateArcMeta(board.name, arcName, { completed: false })} className="ml-1 text-[10px] font-black uppercase tracking-wide text-emerald-300/60 transition hover:text-emerald-300">Undo</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { updateArcMeta(board.name, arcName, { completed: true }); setShareText(""); setShareComplete(true); }}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    Mark Complete
                  </button>
                )}
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
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {arcBrags.length} {arcBrags.length === 1 ? "brag" : "brags"}
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {arcMeta.isPublic === false ? "🔒 Private" : "🌎 Public"}
                </span>
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

        {/* Share completion moment */}
        {shareComplete ? (
          <div className="animate-modal-in overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm shadow-zinc-200">
            <div className="border-b border-emerald-50 bg-emerald-50 px-5 py-4">
              <p className="text-sm font-black text-emerald-800">🎉 Arc complete — want to share this moment?</p>
              <p className="mt-0.5 text-xs font-semibold text-emerald-600">Post a brag to your feed to celebrate finishing <span className="font-black">{displayArcTitle}</span>.</p>
            </div>
            <div className="p-5">
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder={`Just completed "${displayArcTitle}" — `}
                rows={3}
                autoFocus
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm font-semibold leading-6 text-zinc-950 outline-none transition focus:border-zinc-950 focus:bg-white"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShareComplete(false)}
                  className="text-sm font-black text-zinc-400 transition hover:text-zinc-700"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = shareText.trim() || `Just completed "${displayArcTitle}" — another arc done. 🎯`;
                    createBrag({ text, board: board.name, arc: arcName, visibility: "Public", bragToFeed: true });
                    setShareComplete(false);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Post to Feed
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={editCompleted}
                  onClick={() => setEditCompleted((current) => !current)}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                    editCompleted
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${editCompleted ? "bg-emerald-300" : "bg-zinc-400"}`} />
                  {editCompleted ? "Arc complete" : "Mark arc complete"}
                </button>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editIsPublic}
                  onClick={() => setEditIsPublic((v) => !v)}
                  className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-black transition ${
                    editIsPublic
                      ? "bg-zinc-950 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950"
                  }`}
                >
                  <span>{editIsPublic ? "🌎" : "🔒"}</span>
                  {editIsPublic ? "Public" : "Private"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-5 py-3 sm:px-6">
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-red-500">Delete this arc?</span>
                  <button type="button" onClick={handleDeleteArc} className="h-8 rounded-full bg-red-500 px-3 text-xs font-black text-white transition hover:bg-red-600">Yes, delete</button>
                  <button type="button" onClick={() => setDeleteConfirm(false)} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setDeleteConfirm(true)} className="h-8 rounded-full px-3 text-xs font-black text-red-400 transition hover:text-red-600">Delete arc</button>
              )}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setEditOpen(false); setDeleteConfirm(false); }} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
                <button type="button" onClick={saveEdit} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800">Save</button>
              </div>
            </div>
          </article>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">Timeline</h2>
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
            {composeImage ? (
              <div className="relative mx-5 mb-4 overflow-hidden rounded-xl bg-zinc-100 sm:mx-6" style={{ aspectRatio: "16/9" }}>
                <Image src={composeImage} alt="Selected" fill sizes="(min-width: 768px) 40rem, calc(100vw - 2.5rem)" className="object-cover" unoptimized />
                <button type="button" onClick={() => setComposeImage("")} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-zinc-950/75 text-white backdrop-blur-sm transition hover:bg-zinc-950" aria-label="Remove photo">×</button>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:px-6">
              <div>
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-black text-zinc-600 transition hover:bg-zinc-200">
                  {composeImageLoading ? "Loading…" : "Photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={composeImageLoading} className="sr-only" />
                </label>
                {composeImageError ? <p className="mt-2 text-xs font-bold text-red-600">{composeImageError}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { resetComposer(); setComposerOpen(false); }} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
                <button type="button" onClick={handlePost} disabled={(!composeText.trim() && !composeImage) || posting} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
                  {posting ? "Posting…" : "Brag"}
                </button>
              </div>
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

            <div className="flex flex-col gap-5">
              {arcBrags.map((post, index) => {
                const isCheered = cheeredIds.has(String(post.id));
                const isFirst = index === 0;
                const isLast = index === arcBrags.length - 1;
                const hasMedia = Boolean(post.attachments?.length) || (post.type === "photo" && Boolean(post.image));
                const isLongText = post.text.length > 110;
                return (
                  <div key={post.id} ref={isLast ? beginningRef : undefined} className="relative flex gap-4 pl-7">
                    {/* Newest = filled black dot, older = gray */}
                    <div className={`absolute left-0 top-5 h-[11px] w-[11px] rounded-full border-2 border-[#fbfbfb] ${isFirst ? "bg-zinc-950" : "bg-zinc-400"}`} />

                    <article className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-100 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
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
                        <p className={`mt-3 text-zinc-950 ${
                          hasMedia
                            ? "text-base font-semibold leading-7"
                            : isLongText
                              ? "text-lg font-semibold leading-8 sm:text-xl"
                              : "text-xl font-black leading-snug tracking-tight sm:text-2xl"
                        }`}>
                          {post.text}
                        </p>
                      ) : null}

                      <div className="mt-4 flex items-center gap-2">
                        <button type="button" onClick={() => toggleCheer(post.id)} className={`h-8 rounded-full px-3.5 text-xs font-black transition ${isCheered ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                          Cheer {post.cheers + (isCheered ? 1 : 0)}
                        </button>
                        <button type="button" onClick={() => setCommentPost(post)} className="h-8 rounded-full bg-zinc-100 px-3.5 text-xs font-black text-zinc-600 transition hover:bg-zinc-200">
                          Comment {post.comments}
                        </button>
                      </div>
                    </article>
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
