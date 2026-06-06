"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import { AppNav } from "../components/app-nav";
import {
  boardCoverBackground,
  type BoardCover,
  type BoardSize,
  useBoardPreferences,
  useCreatedBoards,
} from "../lib/boards";

const boards = [
  {
    name: "Gym",
    count: "12 brags",
    detail: "No active journey",
    privacy: "Private",
    href: "#",
    color: "bg-[#14532d]",
    size: "large",
  },
  {
    name: "Music",
    count: "1 journey",
    detail: "New Album?? 👀",
    privacy: "Public",
    href: "/tiles/music",
    color: "bg-[#18181b]",
    size: "medium",
  },
  {
    name: "Reading",
    count: "3 journeys",
    detail: "War and Peace, essays, classics",
    privacy: "Public",
    href: "/tiles/reading",
    color: "bg-[#4338ca]",
    size: "small",
  },
  {
    name: "Food",
    count: "5 brags",
    detail: "Sourdough Bread journey",
    privacy: "Public",
    href: "/tiles/food",
    color: "bg-[#9f1239]",
    size: "small",
  },
  {
    name: "Career",
    count: "2 journeys",
    detail: "Dashboard build, internship search",
    privacy: "Public",
    href: "#",
    color: "bg-[#7c2d12]",
    size: "medium",
  },
  {
    name: "Faith",
    count: "8 brags",
    detail: "General practice",
    privacy: "Private",
    href: "#",
    color: "bg-[#0f766e]",
    size: "medium",
  },
  {
    name: "Knitting",
    count: "4 brags",
    detail: "Patterns, stitches, finished pieces",
    privacy: "Public",
    href: "#",
    color: "bg-[#be185d]",
    size: "medium",
  },
  {
    name: "Singing",
    count: "6 brags",
    detail: "Voice practice, covers, performances",
    privacy: "Public",
    href: "#",
    color: "bg-[#2563eb]",
    size: "small",
  },
] as const;

type BoardCard = {
  id?: string;
  storageName: string;
  name: string;
  count: string;
  detail: string;
  privacy: string;
  href: string;
  color: string;
  size: keyof typeof boardTileSizes;
  cover?: BoardCover;
  order: number;
};

type CoverMode = "photo" | "color" | "gradient";

const boardTileSizes = {
  small: {
    tile: "col-span-1 row-span-1",
    body: "p-4",
    title: "text-xl sm:text-2xl",
    detail: "line-clamp-2 text-xs sm:text-sm",
    arrow: "h-9 w-9 text-base",
  },
  medium: {
    tile: "col-span-2 row-span-1",
    body: "p-4 sm:p-5",
    title: "text-2xl sm:text-3xl",
    detail: "line-clamp-2 text-sm",
    arrow: "h-10 w-10 text-lg sm:h-11 sm:w-11",
  },
  large: {
    tile: "col-span-2 row-span-2",
    body: "p-5 sm:p-6",
    title: "text-3xl sm:text-4xl",
    detail: "line-clamp-3 text-sm sm:text-base",
    arrow: "h-11 w-11 text-lg sm:h-12 sm:w-12",
  },
} as const;

const boardSizeOptions = [
  {
    value: "small",
    label: "Small",
    description: "A focused area that stays lightweight on your profile.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "A steady life area with regular progress.",
  },
  {
    value: "large",
    label: "Large",
    description: "A major domain that deserves the most visual weight.",
  },
] as const;

function compressCoverImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Could not prepare this cover image."));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };

      image.onerror = () => reject(new Error("Could not read this cover image."));
      image.src = String(reader.result);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function BoardsPage() {
  const createdBoards = useCreatedBoards();
  const { preferences, updateBoardPreference, setBoardOrder } =
    useBoardPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [draggedBoardName, setDraggedBoardName] = useState("");
  const [landingBoardId, setLandingBoardId] = useState("");
  const [editingBoardName, setEditingBoardName] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftSize, setDraftSize] = useState<BoardSize>("medium");
  const [draftCoverMode, setDraftCoverMode] = useState<CoverMode>("gradient");
  const [draftCoverImage, setDraftCoverImage] = useState("");
  const [draftSolidColor, setDraftSolidColor] = useState("#12345b");
  const [draftGradientStart, setDraftGradientStart] = useState("#07111f");
  const [draftGradientEnd, setDraftGradientEnd] = useState("#2563eb");
  const [draftGradientAngle, setDraftGradientAngle] = useState("135");
  const [editorError, setEditorError] = useState("");
  const rawBoardCards = [
    ...createdBoards.map((board) => ({
      id: board.id,
      storageName: board.name,
      name: board.name,
      count: "0 brags",
      detail: board.description || "New board",
      privacy: "Public",
      href: "#",
      color: "bg-zinc-950",
      size: board.size,
      cover: board.cover,
    })),
    ...boards.map((board) => ({
      ...board,
      storageName: board.name,
      cover: undefined,
    })),
  ];
  const boardCards: BoardCard[] = rawBoardCards
    .map((board, index) => {
      const preference = preferences[board.storageName];

      return {
        ...board,
        name: preference?.title?.trim() || board.name,
        detail: preference?.description?.trim() || board.detail,
        cover: preference?.cover ?? board.cover,
        size: preference?.size ?? board.size,
        order: preference?.order ?? index,
      };
    })
    .sort((first, second) => first.order - second.order);

  function moveDraggedBoard(targetName: string) {
    if (!draggedBoardName || draggedBoardName === targetName) return;

    const nextBoards = [...boardCards];
    const draggedIndex = nextBoards.findIndex(
      (board) => board.storageName === draggedBoardName,
    );
    const targetIndex = nextBoards.findIndex(
      (board) => board.storageName === targetName,
    );

    if (draggedIndex < 0 || targetIndex < 0) return;

    const [draggedBoard] = nextBoards.splice(draggedIndex, 1);
    nextBoards.splice(targetIndex, 0, draggedBoard);
    setBoardOrder(nextBoards.map((board) => board.storageName));
  }

  function getDraftCover(): BoardCover {
    if (draftCoverMode === "photo" && draftCoverImage) {
      return { mode: "photo", image: draftCoverImage };
    }

    if (draftCoverMode === "color") {
      return { mode: "color", color: draftSolidColor };
    }

    return {
      mode: "gradient",
      start: draftGradientStart,
      end: draftGradientEnd,
      angle: draftGradientAngle,
    };
  }

  function openBoardEditor(board: BoardCard) {
    const cover = board.cover ?? {
      mode: "gradient",
      start: "#07111f",
      end: "#2563eb",
      angle: "135",
    };

    setEditingBoardName(board.storageName);
    setDraftTitle(board.name);
    setDraftDescription(board.detail);
    setDraftSize(board.size);
    setEditorError("");

    if (cover.mode === "photo") {
      setDraftCoverMode("photo");
      setDraftCoverImage(cover.image);
    } else if (cover.mode === "color") {
      setDraftCoverMode("color");
      setDraftSolidColor(cover.color);
      setDraftCoverImage("");
    } else {
      setDraftCoverMode("gradient");
      setDraftGradientStart(cover.start);
      setDraftGradientEnd(cover.end);
      setDraftGradientAngle(cover.angle);
      setDraftCoverImage("");
    }
  }

  async function handleEditorCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressCoverImage(file);
      setDraftCoverImage(image);
      setDraftCoverMode("photo");
      setEditorError("");
    } catch {
      setEditorError("That photo could not be prepared. Try another image.");
    }

    event.target.value = "";
  }

  function saveBoardEdits() {
    if (!editingBoardName) return;

    if (!draftTitle.trim()) {
      setEditorError("Give this board a title.");
      return;
    }

    updateBoardPreference(editingBoardName, {
      title: draftTitle.trim(),
      description:
        draftDescription.trim() || "A place to collect progress and proof.",
      size: draftSize,
      cover: getDraftCover(),
    });
    setEditingBoardName("");
    setEditorError("");
  }

  useEffect(() => {
    const pendingBoardId = window.sessionStorage.getItem(
      "brag.pendingBoardLanding",
    );

    if (!pendingBoardId) return;

    window.sessionStorage.removeItem("brag.pendingBoardLanding");

    const frame = window.requestAnimationFrame(() => {
      setLandingBoardId(pendingBoardId);
    });
    const timer = window.setTimeout(() => setLandingBoardId(""), 1500);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [createdBoards]);

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Boards
          </p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                Your life domains.
              </h1>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-zinc-600">
                Boards hold general brags. Add journeys when a board has a
                specific goal worth tracking over time.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsEditing((current) => !current)}
                className="profile-soft-button inline-flex h-11 w-fit cursor-pointer items-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                {isEditing ? "Done Editing" : "Edit Boards"}
              </button>
              <Link
                href="/boards/new"
                className="profile-primary-button inline-flex h-11 w-fit items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  +
                </span>
                Create Board
              </Link>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 [grid-auto-flow:dense] [grid-auto-rows:minmax(0,calc((100vw-2.5rem-0.75rem)/2))] sm:gap-4 sm:[grid-auto-rows:minmax(0,calc((100vw-4rem-1rem)/2))] lg:grid-cols-5 lg:[grid-auto-rows:minmax(0,calc((min(100vw,80rem)-5rem-4rem)/5))]">
          {boardCards.map((board) => {
            const size = boardTileSizes[board.size];
            const hasCover = Boolean(board.cover);

            return (
              <article
                key={board.id ?? board.storageName}
                draggable={isEditing}
                onDragStart={(event) => {
                  setDraggedBoardName(board.storageName);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", board.storageName);
                }}
                onDragEnter={(event) => {
                  if (!isEditing) return;
                  event.preventDefault();
                  moveDraggedBoard(board.storageName);
                }}
                onDragOver={(event) => {
                  if (!isEditing) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  moveDraggedBoard(board.storageName);
                  setDraggedBoardName("");
                }}
                onDragEnd={() => setDraggedBoardName("")}
                className={`group relative min-w-0 overflow-hidden rounded-[1.35rem] border shadow-sm shadow-zinc-200 transition-[opacity,box-shadow,filter] duration-200 sm:rounded-[1.5rem] ${
                  isEditing
                    ? "board-widget-edit cursor-grab active:cursor-grabbing"
                    : "hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70"
                } ${
                  draggedBoardName === board.storageName
                    ? "opacity-50 saturate-50"
                    : ""
                } ${
                  hasCover
                    ? "border-white/70 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white"
                } ${
                  board.id && board.id === landingBoardId
                    ? "board-card-land"
                    : ""
                } ${size.tile}`}
              >
                {!isEditing ? (
                  <Link
                    href={board.href}
                    className="absolute inset-0 z-20"
                    aria-label={`Open ${board.name}`}
                  />
                ) : null}
                {board.cover ? (
                  <>
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: boardCoverBackground(board.cover),
                      }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.5)_100%)]" />
                  </>
                ) : null}
                <article
                  className={`board-widget-shell relative z-10 flex h-full min-h-0 flex-col justify-between ${size.body}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.7rem] font-black sm:px-3 sm:text-xs ${
                          hasCover
                            ? "bg-white/18 text-white backdrop-blur-md"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {board.count}
                      </span>
                      {board.privacy === "Private" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-[0.7rem] font-black text-white sm:px-3 sm:text-xs">
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
                            <rect x="5" y="10" width="14" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                          </svg>
                          Private
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`grid shrink-0 place-items-center rounded-full ${hasCover ? "bg-white/18 backdrop-blur-md" : board.color} ${size.arrow} font-semibold text-white transition group-hover:translate-x-1`}
                    >
                      {isEditing ? "↕" : "→"}
                    </span>
                  </div>

                  <div className="min-w-0">
                    {isEditing ? (
                      <button
                        type="button"
                        draggable={false}
                        onClick={(event) => {
                          event.stopPropagation();
                          openBoardEditor(board);
                        }}
                        className={`mb-3 inline-flex h-9 cursor-pointer items-center rounded-full px-4 text-sm font-black shadow-sm transition hover:-translate-y-0.5 ${
                          hasCover
                            ? "bg-white/90 text-zinc-950 shadow-zinc-950/20"
                            : "bg-zinc-950 text-white shadow-zinc-300"
                        }`}
                      >
                        Edit
                      </button>
                    ) : null}
                    <h2
                      className={`${size.title} break-words font-black leading-none tracking-tight`}
                    >
                      {board.name}
                    </h2>
                    <p
                      className={`mt-2 font-bold leading-5 sm:mt-3 ${
                        hasCover ? "text-white/72" : "text-zinc-500"
                      } ${size.detail}`}
                    >
                      {board.detail}
                    </p>
                  </div>
                </article>
              </article>
            );
          })}
        </section>
      </section>
      {editingBoardName ? (
        <section className="clique-editor-backdrop fixed inset-0 z-50 grid place-items-center bg-[#fbfbfb]/28 px-5 py-8 backdrop-blur-[5px]">
          <div className="clique-editor-modal animate-modal-in max-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-white/70 bg-white/72 p-5 shadow-2xl shadow-zinc-950/18 ring-1 ring-white/50 backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                  Edit Board
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                  Tune the board.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingBoardName("")}
                className="clique-editor-secondary inline-flex h-10 w-fit cursor-pointer items-center rounded-full border border-zinc-200/80 bg-white/80 px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-300/70 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="clique-editor-panel rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm shadow-zinc-300/70 backdrop-blur-xl sm:p-5">
                <label className="block text-sm font-black text-zinc-700">
                  Main Title
                  <input
                    value={draftTitle}
                    onChange={(event) => {
                      setDraftTitle(event.target.value);
                      setEditorError("");
                    }}
                    className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                    placeholder="Reading, Gym, Music..."
                    type="text"
                  />
                </label>

                <label className="mt-5 block text-sm font-black text-zinc-700">
                  Description
                  <textarea
                    value={draftDescription}
                    onChange={(event) => {
                      setDraftDescription(event.target.value);
                      setEditorError("");
                    }}
                    className="board-input mt-3 min-h-24 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base font-medium leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
                    placeholder="What belongs on this board?"
                  />
                </label>

                <div className="mt-5">
                  <p className="text-sm font-black text-zinc-700">Cover</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1">
                    {(["photo", "color", "gradient"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDraftCoverMode(mode)}
                        className={`min-h-10 cursor-pointer rounded-xl text-sm font-black capitalize transition ${
                          draftCoverMode === mode
                            ? "bg-white text-zinc-950 shadow-sm"
                            : "text-zinc-500 hover:text-zinc-950"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {draftCoverMode === "photo" ? (
                    <label className="board-secondary mt-3 inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300">
                      Select photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditorCoverChange}
                        className="sr-only"
                      />
                    </label>
                  ) : null}

                  {draftCoverMode === "color" ? (
                    <label className="board-input mt-3 flex h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-black text-zinc-700">
                      Pick any color
                      <input
                        type="color"
                        value={draftSolidColor}
                        onChange={(event) => {
                          setDraftSolidColor(event.target.value);
                          setDraftCoverImage("");
                        }}
                        className="h-9 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                      />
                    </label>
                  ) : null}

                  {draftCoverMode === "gradient" ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <label className="board-input flex h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-black text-zinc-700">
                        From
                        <input
                          type="color"
                          value={draftGradientStart}
                          onChange={(event) => {
                            setDraftGradientStart(event.target.value);
                            setDraftCoverImage("");
                          }}
                          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                      </label>
                      <label className="board-input flex h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-black text-zinc-700">
                        To
                        <input
                          type="color"
                          value={draftGradientEnd}
                          onChange={(event) => {
                            setDraftGradientEnd(event.target.value);
                            setDraftCoverImage("");
                          }}
                          className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                        />
                      </label>
                      <label className="board-input flex h-14 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-black text-zinc-700">
                        Angle
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={draftGradientAngle}
                          onChange={(event) => {
                            setDraftGradientAngle(event.target.value);
                            setDraftCoverImage("");
                          }}
                          className="min-w-0 flex-1 cursor-pointer"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-black text-zinc-700">Importance</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                    This controls how much space the board takes up on your
                    profile.
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {boardSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDraftSize(option.value)}
                        className={`min-h-24 cursor-pointer rounded-2xl border p-4 text-left transition ${
                          draftSize === option.value
                            ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                            : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        <span className="block text-sm font-black">
                          {option.label}
                        </span>
                        <span
                          className={`mt-2 block text-xs font-semibold leading-5 ${
                            draftSize === option.value
                              ? "text-white/68"
                              : "text-zinc-500"
                          }`}
                        >
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {editorError ? (
                  <p className="mt-4 text-sm font-bold text-red-600">
                    {editorError}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={saveBoardEdits}
                  className="board-primary mt-5 h-12 w-full cursor-pointer rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  Save Board
                </button>
              </div>

              <aside className="clique-editor-panel rounded-3xl border border-white/80 bg-white/78 p-4 shadow-sm shadow-zinc-300/70 backdrop-blur-xl sm:p-5">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                  Preview
                </p>
                <div
                  className="mt-4 flex aspect-square w-full overflow-hidden rounded-[1.5rem] bg-cover bg-center text-white shadow-sm"
                  style={{ backgroundImage: boardCoverBackground(getDraftCover()) }}
                >
                  <div className="flex h-full w-full flex-col justify-between p-5">
                    <div className="flex gap-2">
                      <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        0 brags
                      </span>
                      <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold capitalize backdrop-blur-md">
                        {draftSize}
                      </span>
                    </div>
                    <div>
                      <h3 className="break-words text-3xl font-black leading-none tracking-tight">
                        {draftTitle.trim() || "Board Title"}
                      </h3>
                      <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-white/78">
                        {draftDescription.trim() ||
                          "A place to collect progress and proof."}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
