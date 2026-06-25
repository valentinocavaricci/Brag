"use client";

import { useCallback, useEffect, useState } from "react";

const arcMetaKey = "brag.arcMeta.v1";

export type ArcMeta = {
  title?: string;
  about?: string;
  completed?: boolean;
  isPublic?: boolean;
};

type ArcMetaStore = Record<string, ArcMeta>;

function storeKey(board: string, arc: string) {
  return `${board}::${arc}`;
}

function readArcMeta(): ArcMetaStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(arcMetaKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as ArcMetaStore) : {};
  } catch {
    return {};
  }
}

function writeArcMeta(meta: ArcMetaStore) {
  window.localStorage.setItem(arcMetaKey, JSON.stringify(meta));
  window.dispatchEvent(new Event("arcMeta:updated"));
}

export function deleteArcMetaForBoards(boardNames: string[]) {
  const names = new Set(boardNames);
  const current = readArcMeta();
  const next = Object.fromEntries(
    Object.entries(current).filter(([key]) => {
      const boardName = key.split("::")[0];
      return !names.has(boardName);
    }),
  );
  writeArcMeta(next);
}

export function deleteArcMeta(board: string, arc: string) {
  const current = readArcMeta();
  const { [storeKey(board, arc)]: _, ...next } = current;
  writeArcMeta(next);
}

export function useArcMeta() {
  const [meta, setMeta] = useState<ArcMetaStore>({});

  useEffect(() => {
    const sync = () => setMeta(readArcMeta());
    sync();
    window.addEventListener("arcMeta:updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("arcMeta:updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updateArcMeta = useCallback((board: string, arc: string, data: ArcMeta) => {
    const current = readArcMeta();
    const key = storeKey(board, arc);
    writeArcMeta({ ...current, [key]: { ...current[key], ...data } });
  }, []);

  const getArcMeta = useCallback(
    (board: string, arc: string): ArcMeta => meta[storeKey(board, arc)] ?? {},
    [meta],
  );

  const getArcNamesForBoard = useCallback(
    (board: string): string[] => {
      const prefix = `${board}::`;
      return Object.keys(meta)
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length));
    },
    [meta],
  );

  return { getArcMeta, getArcNamesForBoard, updateArcMeta };
}
