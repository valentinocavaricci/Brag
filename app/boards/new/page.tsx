"use client";

import { type ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { BackButton } from "../../components/back-button";
import {
  boardCoverBackground,
  createBoard,
  type BoardCover,
  type BoardSize,
} from "../../lib/boards";

const sizeOptions = [
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

type CoverMode = "photo" | "color" | "gradient";

const previewSizes: Record<BoardSize, string> = {
  small: "aspect-square max-w-44",
  medium: "aspect-[2/1] max-w-md",
  large: "aspect-square max-w-md",
};

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

export default function NewBoardPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverMode, setCoverMode] = useState<CoverMode>("gradient");
  const [solidColor, setSolidColor] = useState("#12345b");
  const [gradientStart, setGradientStart] = useState("#07111f");
  const [gradientEnd, setGradientEnd] = useState("#0f766e");
  const [gradientAngle] = useState("135");
  const [activeStop, setActiveStop] = useState<"start" | "end">("start");
  const [size, setSize] = useState<BoardSize>("medium");
  const [error, setError] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const previewTitle = title.trim() || "Board Title";
  const previewDescription =
    description.trim() ||
    "Describe what kind of progress, proof, and arcs belong here.";
  const previewBackground = { backgroundImage: boardCoverBackground(getCover()) };

  function getCover(): BoardCover {
    if (coverMode === "photo" && coverImage) {
      return { mode: "photo", image: coverImage };
    }

    if (coverMode === "color") {
      return { mode: "color", color: solidColor };
    }

    return {
      mode: "gradient",
      start: gradientStart,
      end: gradientEnd,
      angle: gradientAngle,
    };
  }

  async function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressCoverImage(file);
      setCoverImage(image);
      setCoverMode("photo");
      setError("");
    } catch {
      setError("That photo could not be prepared. Try another image.");
    }

    event.target.value = "";
  }

  function handleCreateBoard() {
    if (isLaunching) return;

    if (!title.trim()) {
      setError("Give this board a title before creating it.");
      return;
    }

    setError("");
    setIsLaunching(true);

    window.setTimeout(() => {
      try {
        const board = createBoard({
          name: title,
          description:
            description.trim() || "A new place to collect progress and proof.",
          size,
          cover: getCover(),
        });

        window.sessionStorage.setItem("brag.pendingBoardLanding", board.id);
        router.push("/boards");
      } catch (caughtError) {
        setIsLaunching(false);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "This board could not be saved locally.",
        );
      }
    }, 720);
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <header className="px-1 py-4 sm:px-4">
            <BackButton />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              New Board
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Build the container.
            </h1>
          </header>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <form className="board-form rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 sm:p-6">
              <label className="block text-sm font-black text-zinc-700">
                Main Title
                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setError("");
                  }}
                  className="board-input mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  placeholder="Knitting, Singing, Career..."
                  type="text"
                />
              </label>

              <label className="mt-5 block text-sm font-black text-zinc-700">
                Description
                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setError("");
                  }}
                  className="board-input mt-3 min-h-28 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base font-medium leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
                  placeholder="What kind of proof belongs on this board?"
                />
              </label>

              <div className="mt-5">
                <p className="text-sm font-black text-zinc-700">Cover</p>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1">
                  {(["photo", "color", "gradient"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      disabled={isLaunching}
                      onClick={() => setCoverMode(mode)}
                      className={`min-h-10 cursor-pointer rounded-xl text-sm font-black capitalize transition ${
                        coverMode === mode
                          ? "bg-white text-zinc-950 shadow-sm"
                          : "text-zinc-500"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {coverMode === "photo" ? (
                  <label className="board-secondary mt-3 inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 shadow-sm shadow-zinc-200 transition hover:-translate-y-0.5 hover:border-zinc-300">
                    Select photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="sr-only"
                    />
                  </label>
                ) : null}

                {(coverMode === "color" || coverMode === "gradient") ? (
                  <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    {coverMode === "gradient" && (
                      <div className="mb-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveStop("start")}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${activeStop === "start" ? "bg-zinc-950 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"}`}
                        >
                          <span className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: gradientStart }} />
                          From
                        </button>
                        <div className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` }} />
                        <button
                          type="button"
                          onClick={() => setActiveStop("end")}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition ${activeStop === "end" ? "bg-zinc-950 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-zinc-400"}`}
                        >
                          <span className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: gradientEnd }} />
                          To
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        "#09090b", "#3f3f46", "#71717a", "#d4d4d8", "#ffffff",
                        "#1e3a5f", "#1d4ed8", "#3b82f6", "#0ea5e9", "#06b6d4",
                        "#14532d", "#15803d", "#22c55e", "#10b981", "#0d9488",
                        "#7c2d12", "#b91c1c", "#be185d", "#9333ea", "#7c3aed",
                      ].map((color) => {
                        const isSelected = coverMode === "color"
                          ? solidColor === color
                          : activeStop === "start" ? gradientStart === color : gradientEnd === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setCoverImage("");
                              if (coverMode === "color") {
                                setSolidColor(color);
                              } else if (activeStop === "start") {
                                setGradientStart(color);
                              } else {
                                setGradientEnd(color);
                              }
                            }}
                            style={{ background: color }}
                            className={`aspect-square rounded-xl transition hover:scale-105 ${isSelected ? "ring-2 ring-zinc-950 ring-offset-2" : ""}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-black text-zinc-700">Board size</p>
                  <p className="text-sm font-semibold leading-6 text-zinc-500">
                    Size shows how much importance this area takes up in your
                    life.
                  </p>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSize(option.value)}
                      disabled={isLaunching}
                      className={`min-h-28 cursor-pointer rounded-2xl border p-4 text-left transition ${
                        size === option.value
                          ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {option.label}
                      </span>
                      <span
                        className={`mt-2 block text-xs font-semibold leading-5 ${
                          size === option.value
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

              <button
                className="board-primary mt-6 h-12 w-full rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                type="button"
                onClick={handleCreateBoard}
                disabled={isLaunching}
              >
                {isLaunching ? "Placing Board..." : "Create Board"}
              </button>
              {error ? (
                <p className="mt-3 text-sm font-bold text-red-600">{error}</p>
              ) : null}
            </form>

            <aside className="board-form rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-500">
                {size === "large"
                  ? "Large boards get the most visual weight."
                  : size === "medium"
                    ? "Medium boards sit wide but not dominant."
                    : "Small boards stay compact."}
              </p>
              <div
                className={`mt-5 flex w-full overflow-hidden rounded-[1.5rem] bg-cover bg-center text-white shadow-sm transition-all duration-300 ${
                  isLaunching ? "board-preview-launch" : ""
                } ${previewSizes[size]}`}
                style={previewBackground}
              >
                <div className="flex h-full min-h-0 w-full flex-col justify-between p-5">
                  <div className="flex gap-2">
                    <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                      0 brags
                    </span>
                    <span className="rounded-full bg-white/18 px-3 py-1 text-xs font-semibold capitalize backdrop-blur-md">
                      {size}
                    </span>
                  </div>
                  <div>
                    <h2 className="break-words text-3xl font-black leading-none tracking-tight">
                      {previewTitle}
                    </h2>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold leading-5 text-white/78">
                      {previewDescription}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
