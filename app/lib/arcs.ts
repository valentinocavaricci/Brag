"use client";

import { useCallback, useEffect, useState } from "react";

const arcMetaKey = "brag.arcMeta.v1";

export type ArcMeta = {
  title?: string;
  about?: string;
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

  return { getArcMeta, updateArcMeta };
}
