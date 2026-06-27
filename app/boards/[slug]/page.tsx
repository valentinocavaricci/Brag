"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { BragAttachments } from "../../components/brag-attachments";
import { CommentsSheet } from "../../components/comments-sheet";
import {
  boardCoverBackground,
  useBoardPreferences,
  useCreatedBoards,
  JUNK_DRAWER_BOARD,
} from "../../lib/boards";
import { useArcMeta, deleteArcMeta } from "../../lib/arcs";
import {
  createBrag,
  deleteBrag,
  unlinkBragsFromArc,
  formatBragDate,
  type BragAttachment,
  type BragPost,
  useCheers,
  useCreatedBrags,
} from "../../lib/brags";

function nameToSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug ?? "");

  const createdBoards = useCreatedBoards();
  const createdBrags = useCreatedBrags();
  const { preferences } = useBoardPreferences();
  const { cheeredIds, toggleCheer } = useCheers();
  const { getArcMeta, getArcNamesForBoard, updateArcMeta } = useArcMeta();

  const board = createdBoards.find((candidate) => nameToSlug(candidate.name) === slug)
    ?? (slug === nameToSlug(JUNK_DRAWER_BOARD.name) ? JUNK_DRAWER_BOARD : undefined);
  const boardPreference = board ? preferences[board.name] : undefined;
  const displayName = boardPreference?.title?.trim() || board?.name || "Board";
  const displayDescription =
    boardPreference?.description?.trim() ||
    board?.description ||
    "A place to collect progress and proof.";
  const displayCover = board?.cover ?? boardPreference?.cover;
  const boardBrags = useMemo(() => {
    if (!board) return [];
    return createdBrags.filter(
      (brag) => brag.board === board.name || brag.board === displayName,
    );
  }, [board, createdBrags, displayName]);
  const arcs = useMemo(() => {
    if (!board) return [];
    const fromBrags = boardBrags.map((b) => b.arc).filter(Boolean) as string[];
    const fromMeta = getArcNamesForBoard(board.name);
    const allArcNames = [...new Set([...fromBrags, ...fromMeta])];
    return allArcNames.map((arcName) => {
      const arcBrags = boardBrags.filter((b) => b.arc === arcName);
      const meta = getArcMeta(board.name, arcName);
      return { name: arcName, brags: arcBrags, latest: arcBrags[0], meta };
    });
  }, [board, boardBrags, getArcMeta, getArcNamesForBoard]);

  const [activeView, setActiveView] = useState<"brags" | "arcs">(
    searchParams.get("view") === "arcs" ? "arcs" : "brags"
  );
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [composeImage, setComposeImage] = useState("");
  const [composeImageLoading, setComposeImageLoading] = useState(false);
  const [composeImageError, setComposeImageError] = useState("");
  const [composeArc, setComposeArc] = useState("");
  const [composeToFeed, setComposeToFeed] = useState(true);
  const [posting, setPosting] = useState(false);
  const [arcFormOpen, setArcFormOpen] = useState(false);
  const [openArcMenuName, setOpenArcMenuName] = useState<string | null>(null);
  const [arcFilter, setArcFilter] = useState<"all" | "active" | "complete">("all");
  const [newArcName, setNewArcName] = useState("");
  const [newArcAbout, setNewArcAbout] = useState("");
  const [newArcIsPublic, setNewArcIsPublic] = useState(true);
  const [creatingArc, setCreatingArc] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [commentPost, setCommentPost] = useState<BragPost | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (openMenuId === null) return;
    function closeMenu() {
      setOpenMenuId(null);
    }

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [openMenuId]);

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
    setComposeArc("");
    setComposeToFeed(true);
  }

  function handlePost() {
    const text = composeText.trim();
    if ((!text && !composeImage) || posting || !board) return;

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
        board: board.name,
        visibility: "Clique only",
        attachments: attachments.length ? attachments : undefined,
        arc: composeArc || undefined,
        bragToFeed: composeToFeed,
      });
      resetComposer();
      setComposerOpen(false);
      setPosting(false);
      setToast("Brag saved");
      window.setTimeout(() => setToast(""), 2200);
    }, 560);
  }

  function handleCreateArc() {
    const arcName = newArcName.trim();
    const arcAbout = newArcAbout.trim();
    if (!arcName || creatingArc || !board) return;

    setCreatingArc(true);
    window.setTimeout(() => {
      updateArcMeta(board.name, arcName, {
        title: arcName,
        about: arcAbout,
        isPublic: newArcIsPublic,
      });
      setNewArcName("");
      setNewArcAbout("");
      setNewArcIsPublic(true);
      setArcFormOpen(false);
      setCreatingArc(false);
      setToast("Arc started");
      window.setTimeout(() => setToast(""), 2200);
    }, 560);
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
        <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-6 sm:px-8">
          <AppNav active="Boards" />
          <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm shadow-zinc-200">
            <p className="text-2xl font-black text-zinc-950">Board not found.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-zinc-500">
              This prototype only opens boards you have created locally.
            </p>
            <Link
              href="/boards/new"
              className="profile-primary-button mt-6 inline-flex h-11 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Create a board
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const defaultCoverStyle = {
    backgroundImage:
      "radial-gradient(circle at 20% 24%, rgba(56,189,248,0.55), transparent 34%), linear-gradient(135deg, #07111f 0%, #12345b 54%, #0f766e 100%)",
  };
  const coverStyle =
    displayCover && displayCover.mode !== "emoji"
      ? { backgroundImage: boardCoverBackground(displayCover) }
      : defaultCoverStyle;

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-6 sm:px-8">
        <AppNav active="Boards" />

        <header
          className="relative min-h-72 overflow-hidden rounded-[1.75rem] bg-cover bg-center text-white shadow-sm shadow-zinc-200"
          style={coverStyle}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.22)_38%,rgba(0,0,0,0.84)_100%)]" />
          <div className="relative z-10 flex min-h-72 flex-col justify-between p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => router.push("/boards")}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/14 px-4 text-sm font-black text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/24"
              >
                <span aria-hidden="true">←</span>
                Boards
              </button>
            </div>

            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {boardBrags.length} {boardBrags.length === 1 ? "brag" : "brags"}
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {arcs.length} {arcs.length === 1 ? "arc" : "arcs"}
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-black backdrop-blur-md">
                  {(board.pinCount ?? 0).toLocaleString()} {(board.pinCount ?? 0) === 1 ? "pin" : "pins"}
                </span>
              </div>
              <h1 className="mt-4 break-words text-5xl font-black leading-none tracking-tight sm:text-6xl">
                {displayName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/74 sm:text-base">
                {displayDescription}
              </p>
            </div>
          </div>
        </header>

        <div
          key={activeView}
          className={activeView === "brags" ? "animate-profile-swipe-right" : "animate-profile-swipe-left"}
        >
          {/* Section header — same pattern as profile page */}
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <h2 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              {activeView === "brags" ? "Brags" : "Arcs"}
            </h2>

            <div className="flex shrink-0 items-center gap-2">
              <div className="inline-flex h-11 rounded-full border border-zinc-200 bg-white p-1 shadow-sm shadow-zinc-200">
                <button
                  type="button"
                  onClick={() => setActiveView("brags")}
                  aria-pressed={activeView === "brags"}
                  className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full text-zinc-600 transition ${activeView === "brags" ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
                  title="Brags"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("arcs")}
                  aria-pressed={activeView === "arcs"}
                  className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full text-zinc-600 transition ${activeView === "arcs" ? "bg-zinc-950 text-white shadow-sm shadow-zinc-300" : "hover:bg-zinc-100 hover:text-zinc-950"}`}
                  title="Arcs"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                </button>
              </div>

              {activeView === "brags" ? (
                <button
                  type="button"
                  onClick={() => setComposerOpen(true)}
                  className="profile-primary-button inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                  Quick Brag
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setArcFormOpen(true)}
                  className="profile-primary-button inline-flex h-11 items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  Start Arc
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </div>

          {/* Content — overlaid divs, same as profile */}
          <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">

            {/* Brags view */}
            <div
              className={`flex flex-col gap-3 transition duration-300 ${activeView === "brags" ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
              aria-hidden={activeView !== "brags"}
            >
              {composerOpen ? (
                <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200">
                  <div className="flex items-start gap-3 p-5 sm:p-6">
                    <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 ring-2 ring-zinc-100">
                      <Image src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg" alt="You" fill sizes="40px" className="object-cover" />
                    </div>
                    <textarea
                      autoFocus
                      value={composeText}
                      onChange={(e) => setComposeText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
                      placeholder={`What belongs in ${displayName}?`}
                      rows={4}
                      className="min-h-28 flex-1 resize-none bg-transparent text-base font-semibold leading-7 text-zinc-800 outline-none placeholder:text-zinc-400"
                    />
                  </div>
                  {composeImage ? (
                    <div className="relative mx-5 mb-4 overflow-hidden rounded-xl bg-zinc-100 sm:mx-6" style={{ aspectRatio: "16/9" }}>
                      <Image src={composeImage} alt="Selected" fill sizes="(min-width: 768px) 40rem, calc(100vw - 2.5rem)" className="object-cover" unoptimized />
                      <button type="button" onClick={() => setComposeImage("")} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-zinc-950/75 text-white backdrop-blur-sm transition hover:bg-zinc-950" aria-label="Remove photo">×</button>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:px-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-black text-zinc-600 transition hover:bg-zinc-200">
                        {composeImageLoading ? "Loading…" : "Photo"}
                        <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={composeImageLoading} className="sr-only" />
                      </label>
                      {arcs.length > 0 ? (
                        <select value={composeArc} onChange={(e) => setComposeArc(e.target.value)} className="h-8 rounded-full border border-zinc-200 bg-white px-3 text-xs font-black text-zinc-600 outline-none">
                          <option value="">Board only</option>
                          {arcs.map((arc) => <option key={arc.name} value={arc.name}>{arc.name}</option>)}
                        </select>
                      ) : null}
                      <button type="button" role="switch" aria-checked={composeToFeed} onClick={() => setComposeToFeed((v) => !v)} className={`h-8 rounded-full px-3 text-xs font-black transition ${composeToFeed ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                        Feed {composeToFeed ? "on" : "off"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => { resetComposer(); setComposerOpen(false); }} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
                      <button type="button" onClick={handlePost} disabled={(!composeText.trim() && !composeImage) || posting} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
                        {posting ? "Posting…" : "Brag"}
                      </button>
                    </div>
                  </div>
                  {composeImageError ? <p className="px-5 pb-3 text-xs font-bold text-red-600 sm:px-6">{composeImageError}</p> : null}
                </article>
              ) : null}

              {boardBrags.length === 0 && !composerOpen ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
                  <div>
                    <p className="mb-3 text-4xl">⭐</p>
                    <p className="text-xl font-black tracking-tight text-zinc-950">Nothing logged yet.</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-zinc-500">Log your first brag — text, photo, or both.</p>
                    <button type="button" onClick={() => setComposerOpen(true)} className="profile-primary-button mt-5 inline-flex h-10 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800">
                      Log first brag
                    </button>
                  </div>
                </div>
              ) : null}

              {boardBrags.map((post) => {
                const isCheered = cheeredIds.has(String(post.id));
                const hasMedia = Boolean(post.attachments?.length) || (post.type === "photo" && Boolean(post.image));
                const isLongText = post.text.length > 110;
                return (
                  <article key={post.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-100 transition">
                    {post.attachments?.length ? (
                      <BragAttachments attachments={post.attachments} />
                    ) : post.type === "photo" && post.image ? (
                      <div className="relative aspect-[4/3] w-full bg-zinc-100">
                        <Image src={post.image} alt="" fill sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className={hasMedia ? "p-4 sm:p-5" : "p-5 sm:p-6"}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">{formatBragDate(post)}</span>
                            {post.arc ? <span className="rounded-full bg-zinc-950 px-2.5 py-0.5 text-[10px] font-black text-white">{post.arc}</span> : null}
                            {post.bragToFeed === false ? <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-black text-zinc-500">Board only</span> : null}
                          </div>
                          {post.text ? (
                            <p className={`mt-3 text-zinc-950 ${
                              hasMedia
                                ? "text-base font-semibold leading-7"
                                : isLongText
                                  ? "text-lg font-semibold leading-8 sm:text-xl"
                                  : "text-xl font-black leading-snug tracking-tight sm:text-2xl"
                            }`}>{post.text}</p>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-zinc-400">Photo</p>
                          )}
                        </div>
                        <div className="relative shrink-0">
                          <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === post.id ? null : post.id); }} className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700" aria-label="Post options">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                          </button>
                          {openMenuId === post.id ? (
                            <div className="absolute right-0 top-full z-20 mt-1 min-w-40 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10">
                              <button type="button" onClick={(e) => { e.stopPropagation(); deleteBrag(post.id); setOpenMenuId(null); }} className="flex w-full items-center px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50">Delete</button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button type="button" onClick={() => toggleCheer(post.id)} className={`h-9 rounded-full px-4 text-xs font-black transition ${isCheered ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}>
                          Cheer {post.cheers + (isCheered ? 1 : 0)}
                        </button>
                        <button type="button" onClick={() => setCommentPost(post)} className="h-9 rounded-full bg-zinc-100 px-4 text-xs font-black text-zinc-600 transition hover:bg-zinc-200">
                          Comment {post.comments}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Arcs view */}
            <div
              className={`flex flex-col gap-3 transition duration-300 ${activeView === "arcs" ? "visible opacity-100" : "invisible pointer-events-none opacity-0"}`}
              aria-hidden={activeView !== "arcs"}
            >
              {arcFormOpen ? (
                <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200">
                  <div className="p-5 sm:p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">New Arc</p>
                    <input autoFocus value={newArcName} onChange={(e) => setNewArcName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCreateArc(); }} placeholder="Name this arc" className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-base font-black text-zinc-950 outline-none transition focus:border-zinc-950 focus:bg-white" />
                    <textarea value={newArcAbout} onChange={(e) => setNewArcAbout(e.target.value)} placeholder="What are you trying to build, finish, or track?" rows={2} className="mt-2 min-h-20 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold leading-6 text-zinc-700 outline-none transition focus:border-zinc-950 focus:bg-white" />
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewArcIsPublic(!newArcIsPublic)}
                        className={`flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-black transition ${newArcIsPublic ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-400"}`}
                      >
                        <span>{newArcIsPublic ? "🌎" : "🔒"}</span>
                        <span>{newArcIsPublic ? "Public" : "Private"}</span>
                      </button>
                      <span className="text-xs font-semibold text-zinc-400">{newArcIsPublic ? "Visible to everyone" : "Only visible to you"}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-3 sm:px-6">
                    <button type="button" onClick={() => setArcFormOpen(false)} className="h-8 rounded-full px-3 text-xs font-black text-zinc-400 transition hover:text-zinc-700">Cancel</button>
                    <button type="button" onClick={handleCreateArc} disabled={!newArcName.trim() || creatingArc} className="h-9 rounded-full bg-zinc-950 px-5 text-xs font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
                      {creatingArc ? "Creating…" : "Create Arc"}
                    </button>
                  </div>
                </article>
              ) : null}

              {arcs.length > 0 ? (
                <div className="flex items-center gap-2">
                  {(["all", "active", "complete"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setArcFilter(f)}
                      className={`h-8 rounded-full px-3.5 text-xs font-black transition ${arcFilter === f ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950"}`}
                    >
                      {f === "all" ? "All" : f === "active" ? "In Progress" : "Complete"}
                    </button>
                  ))}
                </div>
              ) : null}

              {arcs.length === 0 && !arcFormOpen ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
                  <div>
                    <p className="mb-3 text-4xl">🎯</p>
                    <p className="text-xl font-black tracking-tight text-zinc-950">No arcs yet.</p>
                    <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-zinc-500">An arc is a focused challenge inside this board — Ironman, a reading goal, a push toward something specific.</p>
                    <button type="button" onClick={() => setArcFormOpen(true)} className="profile-primary-button mt-5 inline-flex h-10 items-center rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-zinc-800">
                      Start first arc
                    </button>
                  </div>
                </div>
              ) : null}

              {arcs.filter((arc) => arcFilter === "all" || (arcFilter === "complete" ? arc.meta.completed : !arc.meta.completed)).map((arc) => (
                <article key={arc.name} className={`group cursor-pointer overflow-hidden rounded-2xl text-white shadow-sm shadow-zinc-200 transition-all duration-300 ease-out hover:scale-[1.015] hover:shadow-lg hover:shadow-zinc-300/60 ${arc.meta.completed ? "bg-zinc-800" : "bg-zinc-950"}`} onClick={() => router.push(`/boards/${slug}/arcs/${nameToSlug(arc.name)}`)}>
                  <div className={`flex min-h-36 flex-col justify-between p-5 ${
                    arc.meta.completed
                      ? "bg-[radial-gradient(circle_at_20%_20%,rgba(134,239,172,0.16),transparent_40%),linear-gradient(135deg,#18181b,#3f3f46)]"
                      : "bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.10),transparent_40%),linear-gradient(135deg,#09090b,#27272a)]"
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">{arc.meta.completed ? "Complete" : "Active"}</span>
                        <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">{arc.brags.length} {arc.brags.length === 1 ? "brag" : "brags"}</span>
                        <span className="rounded-full bg-white/14 px-2.5 py-1 text-xs font-black">{arc.meta.isPublic === false ? "🔒 Private" : "🌎 Public"}</span>
                      </div>
                      <div className="relative shrink-0 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setOpenArcMenuName(openArcMenuName === arc.name ? null : arc.name); }}
                          className="grid h-8 w-8 place-items-center rounded-full bg-white/14 text-white transition hover:bg-white/24"
                          aria-label="Arc options"
                        >
                          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                        </button>
                        {openArcMenuName === arc.name ? (
                          <div className="absolute right-0 top-full z-20 mt-1 min-w-36 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-950/10" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => { unlinkBragsFromArc(board!.name, arc.name); deleteArcMeta(board!.name, arc.name); setOpenArcMenuName(null); }}
                              className="flex w-full items-center px-4 py-3 text-sm font-black text-red-500 transition hover:bg-red-50"
                            >
                              Delete arc
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {arc.meta.title?.trim() || arc.name}
                      </h3>
                      {arc.meta.about?.trim() ? (
                        <p className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5 text-white/60">{arc.meta.about}</p>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </div>
      </section>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-5 md:bottom-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-zinc-950/20">
            {toast}
          </div>
        </div>
      ) : null}

      <CommentsSheet post={commentPost} onClose={() => setCommentPost(null)} />
    </main>
  );
}
