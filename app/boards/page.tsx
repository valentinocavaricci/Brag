"use client";

import Link from "next/link";
import { type ChangeEvent, useEffect, useState } from "react";
import { AppNav } from "../components/app-nav";
import {
  boardCoverBackground,
  boardTileSizes,
  type BoardCover,
  type BoardSize,
  useBoardPreferences,
  useCreatedBoards,
} from "../lib/boards";
import { boardHref, useCreatedBrags } from "../lib/brags";
import { BoardsEmptyState } from "../components/boards-empty-state";
import { deleteBoard, updateBoard } from "../lib/boards";

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

const boardArrowSizes = {
  small: "h-9 w-9 text-base",
  medium: "h-10 w-10 text-lg sm:h-11 sm:w-11",
  large: "h-11 w-11 text-lg sm:h-12 sm:w-12",
} as const;

const boardSizeOptions = [
  {
    value: "small",
    label: "Small",
    description: "A focused area you want to track without making it central.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "A steady part of your life that deserves regular proof.",
  },
  {
    value: "large",
    label: "Large",
    description: "A major life domain. This should take visual priority.",
  },
] as const;

const boardPreviewSizes: Record<BoardSize, string> = {
  small: "aspect-square max-w-44",
  medium: "aspect-[2/1] max-w-md",
  large: "aspect-square max-w-md",
};

const boardPalette = [
  "#09090b",
  "#3f3f46",
  "#71717a",
  "#d4d4d8",
  "#ffffff",
  "#1e3a5f",
  "#1d4ed8",
  "#3b82f6",
  "#0ea5e9",
  "#06b6d4",
  "#14532d",
  "#15803d",
  "#22c55e",
  "#10b981",
  "#0d9488",
  "#7c2d12",
  "#b91c1c",
  "#be185d",
  "#9333ea",
  "#7c3aed",
];

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
  const createdBrags = useCreatedBrags();
  const { preferences, updateBoardPreference, setBoardOrder } =
    useBoardPreferences();
  const [isEditing, setIsEditing] = useState(false);
  const [draggedBoardName, setDraggedBoardName] = useState("");
  const [landingBoardId, setLandingBoardId] = useState("");
  const [editingBoardName, setEditingBoardName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftSize, setDraftSize] = useState<BoardSize>("medium");
  const [draftCoverMode, setDraftCoverMode] = useState<CoverMode>("gradient");
  const [draftCoverImage, setDraftCoverImage] = useState("");
  const [draftSolidColor, setDraftSolidColor] = useState("#12345b");
  const [draftGradientStart, setDraftGradientStart] = useState("#07111f");
  const [draftGradientEnd, setDraftGradientEnd] = useState("#2563eb");
  const [draftGradientAngle, setDraftGradientAngle] = useState("135");
  const [draftActiveStop, setDraftActiveStop] = useState<"start" | "end">(
    "start",
  );
  const [editorError, setEditorError] = useState("");
  const rawBoardCards = createdBoards.map((board) => ({
    id: board.id,
    storageName: board.name,
    name: board.name,
    count: `${createdBrags.filter((b) => b.board === board.name).length} brags`,
    detail: board.description || "New board",
    privacy: "Public",
    href: boardHref(board.name),
    color: "bg-zinc-950",
    size: board.size,
    cover: board.cover,
  }));
  const boardCards: BoardCard[] = rawBoardCards
    .map((board, index) => {
      const preference = preferences[board.storageName];

      return {
        ...board,
        name: preference?.title?.trim() || board.name,
        detail: preference?.description?.trim() || board.detail,
        cover: board.cover ?? preference?.cover,
        size: board.size,
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
    setEditingBoardId(board.id ?? "");
    setDraftTitle(board.name);
    setDraftDescription(board.detail);
    setDraftSize(board.size);
    setDraftActiveStop("start");
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

    if (editingBoardId) {
      updateBoard(editingBoardId, {
        description: draftDescription.trim() || "A place to collect progress and proof.",
        size: draftSize,
        cover: getDraftCover(),
      });
    }
    updateBoardPreference(editingBoardName, {
      title: draftTitle.trim(),
      description: draftDescription.trim() || "A place to collect progress and proof.",
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
                Boards hold general brags. Add arcs when a board has a
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

        {boardCards.length === 0 ? (
          <div className="lg:mx-10">
            <BoardsEmptyState />
          </div>
        ) : (
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
                      className={`grid shrink-0 place-items-center rounded-full ${hasCover ? "bg-white/18 backdrop-blur-md" : board.color} ${boardArrowSizes[board.size]} font-semibold text-white transition group-hover:translate-x-1`}
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
                      className={`mt-2 font-black uppercase tracking-[0.13em] sm:mt-3 ${
                        hasCover ? "text-white/70" : "text-zinc-500"
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
        )}
      </section>
      {editingBoardName ? (
        <section className="clique-editor-backdrop fixed inset-0 z-50 grid place-items-center bg-[#fbfbfb]/28 px-5 py-8 backdrop-blur-[5px]">
          <div className="animate-modal-in max-h-[calc(100vh-4rem)] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-zinc-200 bg-[#fbfbfb]/90 p-5 shadow-2xl shadow-zinc-950/18 ring-1 ring-white/50 backdrop-blur-2xl sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Edit Board
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
                  Update the container.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingBoardName("")}
                className="board-secondary inline-flex h-10 w-fit cursor-pointer items-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:text-zinc-950"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="board-form rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 sm:p-6">
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

                  {draftCoverMode === "color" || draftCoverMode === "gradient" ? (
                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      {draftCoverMode === "gradient" ? (
                        <div className="mb-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setDraftActiveStop("start")}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                              draftActiveStop === "start"
                                ? "bg-zinc-950 text-white"
                                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full ring-1 ring-white/20"
                              style={{ background: draftGradientStart }}
                            />
                            From
                          </button>
                          <div
                            className="h-1.5 flex-1 rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${draftGradientStart}, ${draftGradientEnd})`,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setDraftActiveStop("end")}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${
                              draftActiveStop === "end"
                                ? "bg-zinc-950 text-white"
                                : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full ring-1 ring-white/20"
                              style={{ background: draftGradientEnd }}
                            />
                            To
                          </button>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-5 gap-2">
                        {boardPalette.map((color) => {
                          const isSelected =
                            draftCoverMode === "color"
                              ? draftSolidColor === color
                              : draftActiveStop === "start"
                                ? draftGradientStart === color
                                : draftGradientEnd === color;

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setDraftCoverImage("");
                                if (draftCoverMode === "color") {
                                  setDraftSolidColor(color);
                                } else if (draftActiveStop === "start") {
                                  setDraftGradientStart(color);
                                } else {
                                  setDraftGradientEnd(color);
                                }
                              }}
                              style={{ background: color }}
                              className={`aspect-square cursor-pointer rounded-xl transition hover:scale-105 ${
                                isSelected
                                  ? "ring-2 ring-zinc-950 ring-offset-2"
                                  : ""
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-black text-zinc-700">
                      Board size
                    </p>
                    <p className="text-sm font-semibold leading-6 text-zinc-500">
                      Size shows how much importance this area takes up in your
                      life.
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {boardSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDraftSize(option.value)}
                        className={`min-h-28 cursor-pointer rounded-2xl border p-4 text-left transition ${
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
                {editingBoardId && (
                  <button
                    type="button"
                    onClick={() => {
                      deleteBoard(editingBoardId);
                      setEditingBoardName("");
                      setEditingBoardId("");
                    }}
                    className="mt-3 h-12 w-full cursor-pointer rounded-full border border-red-200 bg-white px-5 text-sm font-black text-red-500 transition hover:bg-red-50"
                  >
                    Delete Board
                  </button>
                )}
              </div>

              <aside className="board-form rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                  Preview
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-500">
                  {draftSize === "large"
                    ? "Large boards get the most visual weight."
                    : draftSize === "medium"
                      ? "Medium boards sit wide but not dominant."
                      : "Small boards stay compact."}
                </p>
                <div
                  className={`mt-5 flex w-full overflow-hidden rounded-[1.5rem] bg-cover bg-center text-white shadow-sm transition-all duration-300 ${boardPreviewSizes[draftSize]}`}
                  style={{ backgroundImage: boardCoverBackground(getDraftCover()) }}
                >
                  <div className="flex h-full min-h-0 w-full flex-col justify-between p-5">
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
