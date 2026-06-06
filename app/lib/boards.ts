"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type BoardSize = "small" | "medium" | "large";

export type BoardCover =
  | { mode: "photo"; image: string }
  | { mode: "color"; color: string }
  | { mode: "gradient"; start: string; end: string; angle: string };

export type CreatedBoard = {
  id: string;
  name: string;
  description: string;
  size: BoardSize;
  cover: BoardCover;
  createdAt: number;
};

const storageKey = "brag.createdBoards.v1";
const preferenceStorageKey = "brag.boardPreferences.v1";

export type BoardPreference = {
  size?: BoardSize;
  order?: number;
  title?: string;
  description?: string;
  cover?: BoardCover;
};

export type BoardPreferences = Record<string, BoardPreference>;

function readCreatedBoards() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CreatedBoard[]) : [];
  } catch {
    return [];
  }
}

function writeCreatedBoards(boards: CreatedBoard[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(boards));
  } catch (error) {
    throw new Error(
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "That board cover is too large to save locally. Try a smaller photo or use a color/gradient."
        : "This board could not be saved locally.",
    );
  }

  window.dispatchEvent(new Event("boards:updated"));
}

function readBoardPreferences() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(preferenceStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object"
      ? (parsed as BoardPreferences)
      : {};
  } catch {
    return {};
  }
}

function writeBoardPreferences(preferences: BoardPreferences) {
  window.localStorage.setItem(preferenceStorageKey, JSON.stringify(preferences));
  window.dispatchEvent(new Event("boards:updated"));
}

export function createBoard(input: {
  name: string;
  description: string;
  size: BoardSize;
  cover: BoardCover;
}) {
  const board: CreatedBoard = {
    id: `${Date.now()}-${input.name.trim().toLowerCase().replace(/\s+/g, "-")}`,
    name: input.name.trim(),
    description: input.description.trim(),
    size: input.size,
    cover: input.cover,
    createdAt: Date.now(),
  };

  writeCreatedBoards([board, ...readCreatedBoards()]);
  return board;
}

export function useCreatedBoards() {
  const [createdBoards, setCreatedBoards] = useState<CreatedBoard[]>([]);

  useEffect(() => {
    const syncBoards = () => setCreatedBoards(readCreatedBoards());

    syncBoards();
    window.addEventListener("storage", syncBoards);
    window.addEventListener("boards:updated", syncBoards);

    return () => {
      window.removeEventListener("storage", syncBoards);
      window.removeEventListener("boards:updated", syncBoards);
    };
  }, []);

  return useMemo(() => createdBoards, [createdBoards]);
}

export function useBoardPreferences() {
  const [preferences, setPreferences] = useState<BoardPreferences>({});

  useEffect(() => {
    const syncPreferences = () => setPreferences(readBoardPreferences());

    syncPreferences();
    window.addEventListener("storage", syncPreferences);
    window.addEventListener("boards:updated", syncPreferences);

    return () => {
      window.removeEventListener("storage", syncPreferences);
      window.removeEventListener("boards:updated", syncPreferences);
    };
  }, []);

  const updateBoardPreference = useCallback(
    (name: string, preference: BoardPreference) => {
      const nextPreferences = {
        ...readBoardPreferences(),
        [name]: {
          ...readBoardPreferences()[name],
          ...preference,
        },
      };

      writeBoardPreferences(nextPreferences);
      setPreferences(nextPreferences);
    },
    [],
  );

  const setBoardOrder = useCallback((names: string[]) => {
    const currentPreferences = readBoardPreferences();
    const nextPreferences = names.reduce<BoardPreferences>(
      (next, name, index) => ({
        ...next,
        [name]: {
          ...currentPreferences[name],
          order: index,
        },
      }),
      { ...currentPreferences },
    );

    writeBoardPreferences(nextPreferences);
    setPreferences(nextPreferences);
  }, []);

  return useMemo(
    () => ({ preferences, updateBoardPreference, setBoardOrder }),
    [preferences, setBoardOrder, updateBoardPreference],
  );
}

export function boardCoverBackground(cover: BoardCover) {
  if (cover.mode === "photo") {
    return `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.8) 100%), url(${cover.image})`;
  }

  if (cover.mode === "color") {
    return `linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.52) 100%), linear-gradient(135deg, ${cover.color}, ${cover.color})`;
  }

  return `radial-gradient(circle at 24% 28%, color-mix(in srgb, ${cover.end} 46%, white), transparent 34%), linear-gradient(${cover.angle}deg, ${cover.start} 0%, ${cover.end} 100%)`;
}
