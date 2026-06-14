"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type BragAttachment = {
  id: string;
  url: string;
  kind: "image" | "video" | "audio" | "file";
  name: string;
  mimeType: string;
};

export type BragPost = {
  id: number;
  author: string;
  avatar: string;
  board: string;
  source: string;
  time: string;
  type: "photo" | "text" | "video";
  image?: string;
  mediaName?: string;
  attachments?: BragAttachment[];
  arc?: string;
  bragToFeed?: boolean;
  text: string;
  cheers: number;
  comments: number;
  pins?: number;
  title?: string;
};

const storageKey = "brag.created.v1";

function readCreatedBrags() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as BragPost[]) : [];
  } catch {
    return [];
  }
}

function writeCreatedBrags(brags: BragPost[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(brags));
  window.dispatchEvent(new Event("brags:updated"));
}

function makeTitle(text: string) {
  const firstSentence = text.split(/[.!?]/)[0]?.trim();
  if (!firstSentence) {
    return "New proof moment";
  }

  return firstSentence.length > 34
    ? `${firstSentence.slice(0, 31).trim()}...`
    : firstSentence;
}

export function createBrag(input: {
  text: string;
  board: string;
  visibility: string;
  attachments?: BragAttachment[];
  arc?: string;
  bragToFeed: boolean;
}) {
  const text = input.text.trim();
  const board = input.board;
  const source =
    input.visibility === "Clique only"
      ? "Clique"
      : input.visibility === "Private"
        ? "Private"
        : "Public";
  const primaryAttachment = input.attachments?.find(
    (attachment) =>
      attachment.kind === "image" || attachment.kind === "video",
  );

  const brag: BragPost = {
    id: Date.now(),
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board,
    source: input.arc ? `Arc: ${input.arc}` : source,
    time: "Just now",
    type:
      primaryAttachment?.kind === "video"
        ? "video"
        : primaryAttachment?.kind === "image"
          ? "photo"
          : "text",
    image: primaryAttachment?.url,
    mediaName: primaryAttachment?.name,
    attachments: input.attachments,
    arc: input.arc,
    bragToFeed: input.bragToFeed,
    text,
    cheers: 0,
    comments: 0,
    title: makeTitle(text),
  };

  writeCreatedBrags([brag, ...readCreatedBrags()]);
  return brag;
}

export function deleteBrag(id: number) {
  const next = readCreatedBrags().filter((b) => b.id !== id);
  writeCreatedBrags(next);
}

export function useBrags() {
  const [createdBrags, setCreatedBrags] = useState<BragPost[]>([]);

  useEffect(() => {
    const syncBrags = () => setCreatedBrags(readCreatedBrags());

    syncBrags();
    window.addEventListener("storage", syncBrags);
    window.addEventListener("brags:updated", syncBrags);

    return () => {
      window.removeEventListener("storage", syncBrags);
      window.removeEventListener("brags:updated", syncBrags);
    };
  }, []);

  return useMemo(() => createdBrags, [createdBrags]);
}

export function useCreatedBrags() {
  const [createdBrags, setCreatedBrags] = useState<BragPost[]>([]);

  useEffect(() => {
    const sync = () => setCreatedBrags(readCreatedBrags());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("brags:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("brags:updated", sync);
    };
  }, []);

  return useMemo(() => createdBrags, [createdBrags]);
}

const cheerStorageKey = "brag.cheers.v1";

function readCheeredIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(cheerStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeCheeredIds(ids: Set<string>) {
  window.localStorage.setItem(cheerStorageKey, JSON.stringify([...ids]));
  window.dispatchEvent(new Event("cheers:updated"));
}

export function useCheers() {
  const [cheeredIds, setCheeredIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setCheeredIds(readCheeredIds());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cheers:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cheers:updated", sync);
    };
  }, []);

  const toggleCheer = useCallback((id: number | string) => {
    const key = String(id);
    const next = new Set(readCheeredIds());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    writeCheeredIds(next);
    setCheeredIds(new Set(next));
  }, []);

  return useMemo(() => ({ cheeredIds, toggleCheer }), [cheeredIds, toggleCheer]);
}

export function formatBragDate(brag: BragPost): string {
  if (brag.id < 1e12) return brag.time;
  const date = new Date(brag.id);
  const diffMs = Date.now() - brag.id;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `Today · ${timeStr}`;
  if (diffDays === 1) return `Yesterday · ${timeStr}`;
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `${dateStr} · ${timeStr}`;
}

const PINS_KEY = "brag.pins.v1";
const DEFAULT_PINS = ["Ironman Training", "LSAT 170 Push"];

function readPinnedBoards(): Set<string> {
  if (typeof window === "undefined") return new Set(DEFAULT_PINS);
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    if (raw === null) return new Set(DEFAULT_PINS);
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : DEFAULT_PINS);
  } catch {
    return new Set(DEFAULT_PINS);
  }
}

function writePinnedBoards(boards: Set<string>) {
  window.localStorage.setItem(PINS_KEY, JSON.stringify([...boards]));
  window.dispatchEvent(new Event("pins:updated"));
}

export function usePinnedBoards() {
  const [pinnedBoards, setPinnedBoards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setPinnedBoards(new Set(readPinnedBoards()));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("pins:updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pins:updated", sync);
    };
  }, []);

  const togglePin = useCallback((boardName: string) => {
    const next = new Set(readPinnedBoards());
    if (next.has(boardName)) {
      next.delete(boardName);
    } else {
      next.add(boardName);
    }
    writePinnedBoards(next);
    setPinnedBoards(new Set(next));
  }, []);

  return useMemo(() => ({ pinnedBoards, togglePin }), [pinnedBoards, togglePin]);
}

export function boardHref(board: string) {
  const slug = board.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `/boards/${slug}`;
}
