"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "../../components/app-nav";
import { BackButton } from "../../components/back-button";
import {
  boardHref,
  boardOptions,
  type BragAttachment,
  createBrag,
} from "../../lib/brags";
import { boardCoverBackground, useCreatedBoards } from "../../lib/boards";

const steps = ["Write", "Media", "Board", "Journey", "Review"];
const boardDetails: Record<string, string> = {
  Gym: "Training, movement, and strength",
  Music: "Songs, demos, and practice",
  Food: "Cooking, baking, and meals",
  Reading: "Books, notes, and reflections",
  Career: "Work, projects, and learning",
  Faith: "Reflection, gratitude, and practice",
  Knitting: "Patterns, stitches, and finished pieces",
  Singing: "Voice practice, covers, and performances",
};
const boardImages: Record<string, string> = {
  Gym: "/gym.jpg",
  Music: "/music.png",
  Food: "/food.png",
  Reading: "/reading.jpg",
  Career: "/career.jpg",
  Faith: "/headshot.jpg",
  Knitting: "/knitting.png",
  Singing: "/singing.png",
};
const existingJourneys = [
  { name: "New Album??", board: "Music" },
  { name: "Sourdough Bread", board: "Food" },
  { name: "War and Peace", board: "Reading" },
  { name: "Ironman Training", board: "Gym" },
  { name: "LSAT 170 Push", board: "Career" },
];

function SelectionMark() {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full bg-zinc-950 text-white shadow-md shadow-black/20 ring-2 ring-white">
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m7 12 3 3 7-7" />
      </svg>
    </span>
  );
}

export default function NewBragPage() {
  const router = useRouter();
  const createdBoards = useCreatedBoards();
  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [text, setText] = useState("");
  const [confirmNoText, setConfirmNoText] = useState(false);
  const [boardMode, setBoardMode] = useState<"existing" | "new">("existing");
  const [board, setBoard] = useState(boardOptions[0]);
  const [newBoard, setNewBoard] = useState("");
  const [journeyMode, setJourneyMode] = useState<"none" | "existing" | "new">(
    "none",
  );
  const [journey, setJourney] = useState(existingJourneys[3].name);
  const [newJourney, setNewJourney] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [bragToFeed, setBragToFeed] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [attachments, setAttachments] = useState<BragAttachment[]>([]);
  const [error, setError] = useState("");
  const createdBoardByName = useMemo(
    () => new Map(createdBoards.map((createdBoard) => [createdBoard.name, createdBoard])),
    [createdBoards],
  );
  const allBoardOptions = useMemo(
    () => [
      ...createdBoards.map((createdBoard) => createdBoard.name),
      ...boardOptions.filter((option) => !createdBoardByName.has(option)),
    ],
    [createdBoardByName, createdBoards],
  );

  const destinationBoard = useMemo(() => {
    if (boardMode === "new") {
      return newBoard.trim();
    }

    return board;
  }, [board, boardMode, newBoard]);

  const destinationJourney = useMemo(() => {
    if (journeyMode === "new") {
      return newJourney.trim();
    }

    if (journeyMode === "existing") {
      return journey;
    }

    return "";
  }, [journey, journeyMode, newJourney]);
  const matchingJourneys = useMemo(
    () =>
      existingJourneys.filter((option) => option.board === destinationBoard),
    [destinationBoard],
  );

  function goNext() {
    if (step === 0 && !text.trim()) {
      setConfirmNoText(true);
      return;
    }

    if (step === 1 && !text.trim() && attachments.length === 0) {
      setError("Attach something for a media-only brag, or go back and add text.");
      return;
    }

    if (step === 2 && !destinationBoard) {
      setError("Pick or create a board.");
      return;
    }

    if (step === 3 && journeyMode === "new" && !destinationJourney) {
      setError("Name the new journey, or choose no journey.");
      return;
    }

    if (step === 3 && journeyMode === "existing" && !destinationJourney) {
      setError("Choose a journey, or choose no journey.");
      return;
    }

    setError("");
    const nextStep = Math.min(step + 1, steps.length - 1);
    setStep(nextStep);
    setFurthestStep((current) => Math.max(current, nextStep));
  }

  function goBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleMediaChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const nextAttachments = await Promise.all(
      files.map(
        (file) =>
          new Promise<BragAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const kind = file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                  ? "video"
                  : file.type.startsWith("audio/")
                    ? "audio"
                    : "file";

              resolve({
                id: `${Date.now()}-${file.name}-${file.lastModified}`,
                url: String(reader.result),
                kind,
                name: file.name,
                mimeType: file.type || "application/octet-stream",
              });
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );

    setAttachments((current) => [...current, ...nextAttachments]);
    setError("");
    event.target.value = "";
  }

  async function handleBrag() {
    if (isLaunching || step !== steps.length - 1) return;

    if (!text.trim() && attachments.length === 0) {
      setStep(0);
      setError("Add text or media before saving this brag.");
      return;
    }

    if (!destinationBoard) {
      setStep(2);
      setError("Pick or create a board.");
      return;
    }

    if (journeyMode !== "none" && !destinationJourney) {
      setStep(3);
      setError("Finish choosing the journey.");
      return;
    }

    setError("");
    setIsLaunching(true);

    await new Promise((resolve) => window.setTimeout(resolve, 1650));

    try {
      const brag = createBrag({
        text,
        board: destinationBoard,
        visibility,
        attachments,
        journey: destinationJourney || undefined,
        bragToFeed,
      });

      router.push(brag.bragToFeed ? "/" : boardHref(brag.board));
    } catch {
      setIsLaunching(false);
      setError(
        "These attachments are too large for local prototype storage. Smaller files will save normally.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Brag" />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
          <header className="px-1 py-4 sm:px-4">
            <BackButton />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              New Brag
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Build the proof, then place it.
            </h1>
          </header>

          <section>
            <form
              className="brag-flow-card rounded-3xl border border-zinc-200 bg-white shadow-sm shadow-zinc-200"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="brag-flow-header border-b border-zinc-100 p-5 sm:p-6">
                {isLaunching ? (
                  <div className="brag-launch-track" aria-label="Posting brag">
                    <span className="brag-launch-fill" />
                    <span className="brag-launch-glint" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {steps.map((label, index) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          if (index <= furthestStep) {
                            setStep(index);
                            setError("");
                          }
                        }}
                        disabled={index > furthestStep}
                        className={`brag-flow-step h-2 flex-1 rounded-full transition ${
                          index <= step
                            ? "brag-flow-step-active bg-zinc-950"
                            : "bg-zinc-200"
                        }`}
                        aria-label={`Go to ${label}`}
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                    {isLaunching ? "Bragging" : steps[step]}
                  </p>
                  <p className="text-sm font-bold text-zinc-500">
                    {isLaunching ? "Making it official" : `${step + 1} / ${steps.length}`}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{
                    width: `${steps.length * 100}%`,
                    transform: `translateX(-${step * (100 / steps.length)}%)`,
                  }}
                >
                  <section
                    className="flex-none p-5 sm:p-6"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <label className="block text-sm font-black text-zinc-700">
                      Brag text
                      <textarea
                        value={text}
                        onChange={(event) => {
                          setText(event.target.value);
                          setError("");
                        }}
                        className="brag-flow-input mt-3 min-h-56 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-lg font-semibold leading-8 outline-none transition focus:border-zinc-950 focus:bg-white"
                        placeholder="What did you prove, finish, attempt, repair, ship, practice, or move forward?"
                      />
                    </label>
                    {confirmNoText ? (
                      <div className="brag-flow-surface mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-sm font-black text-zinc-950">
                          Continue without text?
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                          That works. Just attach something on the next step.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirmNoText(false)}
                            className="brag-flow-secondary h-10 rounded-full border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-600"
                          >
                            Add text
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmNoText(false);
                              setError("");
                              setStep(1);
                              setFurthestStep((current) =>
                                Math.max(current, 1),
                              );
                            }}
                            className="brag-flow-primary h-10 rounded-full bg-zinc-950 px-4 text-sm font-black text-white"
                          >
                            Continue attachment-only
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </section>

                  <section
                    className="flex-none p-5 sm:p-6"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <div>
                      <p className="text-xl font-black tracking-tight">
                        Add attachments
                      </p>
                      <p className="mt-1 text-sm font-semibold text-zinc-500">
                        Photos, videos, audio, project files, or documents.
                      </p>
                    </div>

                    <label className="brag-flow-surface mt-4 flex min-h-24 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 transition hover:border-zinc-400 hover:bg-white">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.wav,.mp3,.m4a,.aiff,.als,.logicx"
                        onChange={handleMediaChange}
                        className="sr-only"
                      />
                      <span>
                        <span className="block text-sm font-black text-zinc-950">
                          Choose files
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-zinc-500">
                          Select one or several
                        </span>
                      </span>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-950 text-xl font-semibold text-white">
                        +
                      </span>
                    </label>

                    {attachments.length > 0 ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {attachments.map((attachment) => (
                          <article
                            key={attachment.id}
                            className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                          >
                            {attachment.kind === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={attachment.url}
                                alt=""
                                className="aspect-[16/9] w-full object-cover"
                              />
                            ) : attachment.kind === "video" ? (
                              <video
                                src={attachment.url}
                                controls
                                className="aspect-[16/9] w-full bg-zinc-950 object-cover"
                              />
                            ) : attachment.kind === "audio" ? (
                              <div className="flex min-h-24 items-center bg-zinc-950 px-4">
                                <audio
                                  src={attachment.url}
                                  controls
                                  className="w-full"
                                />
                              </div>
                            ) : (
                              <div className="grid min-h-24 place-items-center bg-zinc-100 text-xs font-black uppercase text-zinc-500">
                                File
                              </div>
                            )}
                            <div className="flex items-center justify-between gap-3 p-3">
                              <p className="min-w-0 truncate text-xs font-black text-zinc-700">
                                {attachment.name}
                              </p>
                              <button
                                type="button"
                                onClick={() =>
                                  setAttachments((current) =>
                                    current.filter(
                                      (item) => item.id !== attachment.id,
                                    ),
                                  )
                                }
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-950 hover:text-white"
                                aria-label={`Remove ${attachment.name}`}
                              >
                                ×
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-zinc-400">
                        No attachments yet. Text-only is fine too.
                      </p>
                    )}
                  </section>

                  <section
                    className="flex-none p-5 sm:p-6"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <p className="text-xl font-black tracking-tight">
                      Choose a board
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      This is where the progress will always live.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100 p-1">
                      {(["existing", "new"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setBoardMode(mode);
                            setJourneyMode("none");
                            setError("");
                          }}
                          className={`min-h-10 rounded-xl text-sm font-black transition ${
                            boardMode === mode
                              ? "bg-white text-zinc-950 shadow-sm"
                              : "text-zinc-500"
                          }`}
                        >
                          {mode === "existing" ? "My boards" : "Create new"}
                        </button>
                      ))}
                    </div>

                    {boardMode === "existing" ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {allBoardOptions.map((option) => {
                          const selected = board === option;
                          const createdBoard = createdBoardByName.get(option);
                          const backgroundImage = createdBoard
                            ? boardCoverBackground(createdBoard.cover)
                            : `url(${boardImages[option]})`;

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setBoard(option);
                                setJourneyMode("none");
                                setError("");
                              }}
                              className={`relative aspect-[4/3] overflow-hidden rounded-2xl border text-left transition ${
                                selected
                                  ? "border-zinc-950 ring-2 ring-zinc-950"
                                  : "border-zinc-200 hover:border-zinc-400"
                              }`}
                            >
                              <span
                                className="absolute inset-0 bg-cover bg-center"
                                style={{
                                  backgroundImage,
                                }}
                              />
                              <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_20%,rgba(0,0,0,0.82)_100%)]" />
                              {selected ? (
                                <span className="absolute right-2 top-2">
                                  <SelectionMark />
                                </span>
                              ) : null}
                              <span className="absolute inset-x-0 bottom-0 p-3 text-white">
                                <span className="block text-sm font-black">
                                  {option}
                                </span>
                                <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-white/70">
                                  {createdBoard?.description ||
                                    boardDetails[option] ||
                                    "Progress and proof"}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <label className="mt-3 block rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm font-black text-zinc-700">
                        Start a new board with this brag
                        <input
                          value={newBoard}
                          onChange={(event) => {
                            setNewBoard(event.target.value);
                            setJourneyMode("none");
                            setError("");
                          }}
                          className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold outline-none transition focus:border-zinc-950"
                          placeholder="Board name"
                        />
                      </label>
                    )}
                  </section>

                  <section
                    className="flex-none p-5 sm:p-6"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <p className="text-xl font-black tracking-tight">
                      Add it to a journey?
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-500">
                      Optional. This brag is already going to {destinationBoard}.
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          setJourneyMode("none");
                          setError("");
                        }}
                        className={`relative min-h-24 rounded-2xl border p-4 text-left transition ${
                          journeyMode === "none"
                            ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                        }`}
                      >
                        {journeyMode === "none" ? (
                          <span className="absolute right-3 top-3">
                            <SelectionMark />
                          </span>
                        ) : null}
                        <span className="block text-sm font-black">
                          Board only
                        </span>
                        <span
                          className={`mt-1 block text-xs font-semibold ${
                            journeyMode === "none"
                              ? "text-white/65"
                              : "text-zinc-500"
                          }`}
                        >
                          Save as a standalone update
                        </span>
                      </button>

                      {matchingJourneys.map((option) => {
                        const selected =
                          journeyMode === "existing" &&
                          journey === option.name;

                        return (
                          <button
                            key={option.name}
                            type="button"
                            onClick={() => {
                              setJourneyMode("existing");
                              setJourney(option.name);
                              setError("");
                            }}
                            className={`relative min-h-24 overflow-hidden rounded-2xl border text-left transition ${
                              selected
                                ? "border-zinc-950 ring-2 ring-zinc-950"
                                : "border-zinc-200 hover:border-zinc-400"
                            }`}
                          >
                            <span
                              className="absolute inset-0 bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${boardImages[option.board]})`,
                              }}
                            />
                            <span className="absolute inset-0 bg-black/60" />
                            {selected ? (
                              <span className="absolute right-3 top-3">
                                <SelectionMark />
                              </span>
                            ) : null}
                            <span className="relative flex min-h-24 flex-col justify-end p-4 text-white">
                              <span className="text-sm font-black">
                                {option.name}
                              </span>
                              <span className="mt-1 text-xs font-semibold text-white/65">
                                Existing journey
                              </span>
                            </span>
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setJourneyMode("new");
                          setError("");
                        }}
                        className={`relative min-h-24 rounded-2xl border p-4 text-left transition ${
                          journeyMode === "new"
                            ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950"
                            : "border-zinc-200 bg-zinc-50 hover:border-zinc-400"
                        }`}
                      >
                        {journeyMode === "new" ? (
                          <span className="absolute right-3 top-3">
                            <SelectionMark />
                          </span>
                        ) : null}
                        <span className="block text-sm font-black">
                          Start a new journey
                        </span>
                        <span
                          className={`mt-1 block text-xs font-semibold ${
                            journeyMode === "new"
                              ? "text-white/65"
                              : "text-zinc-500"
                          }`}
                        >
                          Begin inside {destinationBoard}
                        </span>
                      </button>
                    </div>

                    {journeyMode === "new" ? (
                      <input
                        value={newJourney}
                        onChange={(event) => {
                          setNewJourney(event.target.value);
                          setError("");
                        }}
                        className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                        placeholder="Journey name"
                      />
                    ) : null}
                  </section>

                  <section
                    className="flex-none p-5 sm:p-6"
                    style={{ width: `${100 / steps.length}%` }}
                  >
                    <div className="grid gap-4">
                      <div>
                        <p className="text-2xl font-black tracking-tight">
                          Review your brag
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
                          This is how the update will feel when it is saved.
                        </p>
                      </div>

                      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                        {attachments.length > 0 ? (
                          <div className="grid gap-px bg-zinc-200 sm:grid-cols-2">
                            {attachments.map((attachment, index) => (
                              <div
                                key={attachment.id}
                                className={`bg-zinc-950 ${
                                  attachments.length % 2 === 1 && index === 0
                                    ? "sm:col-span-2"
                                    : ""
                                }`}
                              >
                                {attachment.kind === "image" ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={attachment.url}
                                    alt=""
                                    className="max-h-[24rem] w-full object-cover"
                                  />
                                ) : attachment.kind === "video" ? (
                                  <video
                                    src={attachment.url}
                                    controls
                                    className="max-h-[24rem] w-full"
                                  />
                                ) : attachment.kind === "audio" ? (
                                  <div className="flex min-h-28 items-center px-4">
                                    <audio
                                      src={attachment.url}
                                      controls
                                      className="w-full"
                                    />
                                  </div>
                                ) : (
                                  <a
                                    href={attachment.url}
                                    download={attachment.name}
                                    className="flex min-h-28 items-center justify-between gap-3 bg-zinc-100 p-4 text-zinc-800"
                                  >
                                    <span className="min-w-0 truncate text-sm font-black">
                                      {attachment.name}
                                    </span>
                                    <span className="shrink-0 text-xs font-black uppercase text-zinc-500">
                                      File
                                    </span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div className="p-4 sm:p-5">
                          {text.trim() ? (
                            <p className="text-base font-semibold leading-7 text-zinc-800">
                              {text}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-zinc-400">
                              Attachment-only brag
                            </p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                              {destinationBoard || "No board"}
                            </span>
                            {destinationJourney ? (
                              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                                {destinationJourney}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="brag-flow-surface flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <span>
                          <span className="block text-sm font-black text-zinc-950">
                            Share to feed
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-zinc-500">
                            {bragToFeed
                              ? "Your clique can see this update."
                              : "Save only to its board or journey."}
                          </span>
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={bragToFeed}
                          aria-label="Share to feed"
                          onClick={() => setBragToFeed((current) => !current)}
                          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                            bragToFeed ? "bg-zinc-950" : "bg-zinc-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                              bragToFeed ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        <p className="text-sm font-black text-zinc-700">
                          Who can see it?
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-zinc-100 p-1">
                          {["Public", "Clique only", "Private"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setVisibility(option)}
                              className={`min-h-11 rounded-xl px-2 text-xs font-black transition sm:text-sm ${
                                visibility === option
                                  ? "bg-white text-zinc-950 shadow-sm"
                                  : "text-zinc-500"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {error ? (
                <p className="px-5 pb-2 text-sm font-bold text-red-600 sm:px-6">
                  {error}
                </p>
              ) : null}

              <div className="brag-flow-footer sticky bottom-20 z-20 flex items-center justify-between gap-3 rounded-b-3xl border-t border-zinc-100 bg-white/95 p-5 backdrop-blur-xl sm:p-6 md:bottom-0">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0 || isLaunching}
                  className="brag-flow-secondary h-12 rounded-full border border-zinc-200 px-5 text-sm font-black text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={isLaunching}
                    className="brag-flow-primary h-12 rounded-full bg-zinc-950 px-6 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="brag-flow-primary h-12 rounded-full bg-zinc-950 px-7 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
                    type="button"
                    disabled={isLaunching}
                    onClick={handleBrag}
                  >
                    {isLaunching ? "Bragging..." : "Brag"}
                  </button>
                )}
              </div>
            </form>

          </section>
        </div>
      </section>
    </main>
  );
}
