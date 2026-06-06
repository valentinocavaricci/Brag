"use client";

import { useEffect, useMemo, useState } from "react";

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
  journey?: string;
  bragToFeed?: boolean;
  text: string;
  cheers: number;
  comments: number;
  pins?: number;
  title?: string;
};

export const boardOptions = [
  "Gym",
  "Music",
  "Food",
  "Reading",
  "Career",
  "Faith",
  "Knitting",
  "Singing",
];

const storageKey = "brag.created.v1";

export const initialBrags: BragPost[] = [
  {
    id: 1,
    author: "Marco",
    avatar: "/guy1.png",
    board: "Gym",
    source: "Clique",
    time: "18m",
    type: "photo",
    image: "/gym.jpg",
    text: "Added five pounds to my working set and kept the form clean. Tiny jump, real momentum.",
    cheers: 12,
    comments: 3,
  },
  {
    id: 2,
    author: "Leo",
    avatar: "/guy2.png",
    board: "Reading",
    source: "Clique",
    time: "42m",
    type: "text",
    text: "Finished the chapter I kept putting off. Not dramatic, but I showed up before checking my phone and that feels like the win.",
    cheers: 9,
    comments: 1,
  },
  {
    id: 3,
    author: "Nico",
    avatar: "/guy3.png",
    board: "Career",
    source: "Clique",
    time: "1h",
    type: "photo",
    image: "/career.jpg",
    text: "Shipped the first pass of the dashboard. It is not perfect yet, but it is finally real enough to improve.",
    cheers: 18,
    comments: 5,
  },
  {
    id: 4,
    author: "Anthony",
    avatar: "/guy4.png",
    board: "Faith",
    source: "Clique",
    time: "2h",
    type: "text",
    text: "Ten quiet minutes this morning. Wrote down three things I am grateful for and carried that into the day.",
    cheers: 15,
    comments: 2,
  },
  {
    id: 5,
    author: "Dante",
    avatar: "/guy5.png",
    board: "Reading",
    source: "Clique",
    time: "3h",
    type: "text",
    text: "Read twenty pages after dinner instead of drifting. The streak is starting to feel like identity, not effort.",
    cheers: 11,
    comments: 4,
  },
  {
    id: 6,
    author: "Luca",
    avatar: "/guy6.png",
    board: "Gym",
    source: "Clique",
    time: "4h",
    type: "photo",
    image: "/gym.jpg",
    text: "Hit the planned session even with low energy. Kept it simple, finished every set, and left proud.",
    cheers: 14,
    comments: 2,
  },
  {
    id: 7,
    author: "Sofia",
    avatar: "/girl1.png",
    board: "Reading",
    source: "Clique",
    time: "5h",
    type: "text",
    text: "Finished the essay notes before lunch. Small deadline, handled cleanly.",
    cheers: 16,
    comments: 3,
  },
  {
    id: 8,
    author: "Gianna",
    avatar: "/girl2.png",
    board: "Faith",
    source: "Clique",
    time: "6h",
    type: "text",
    text: "Made time to journal when the day got loud. Five minutes was enough to reset the whole mood.",
    cheers: 13,
    comments: 2,
  },
  {
    id: 9,
    author: "Mia",
    avatar: "/girl3.png",
    board: "Career",
    source: "Clique",
    time: "7h",
    type: "photo",
    image: "/career.jpg",
    text: "Sent the follow-up I had been overthinking. Clear, direct, done.",
    cheers: 20,
    comments: 6,
  },
  {
    id: 10,
    author: "Elena",
    avatar: "/girl4.png",
    board: "Gym",
    source: "Clique",
    time: "8h",
    type: "photo",
    image: "/gym.jpg",
    text: "Showed up for cardio before the excuses got organized. Future me gets the credit.",
    cheers: 17,
    comments: 4,
  },
  {
    id: 11,
    author: "Bella",
    avatar: "/girl5.png",
    board: "Reading",
    source: "Clique",
    time: "9h",
    type: "text",
    text: "Started a new book and actually put the phone in another room. That was the real achievement.",
    cheers: 12,
    comments: 1,
  },
  {
    id: 12,
    author: "Sarah",
    avatar: "/girl4.png",
    board: "Ironman Training",
    source: "Pinned Journey",
    time: "10h",
    type: "text",
    text: "Longest swim of the block is done. I wanted to quit at 1,500 yards and finished the whole plan anyway.",
    cheers: 41,
    comments: 9,
    pins: 493,
  },
  {
    id: 13,
    author: "Maya",
    avatar: "/girl3.png",
    board: "LSAT 170 Push",
    source: "Pinned Journey",
    time: "11h",
    type: "text",
    text: "Timed logic games finally clicked today. Not perfect, but it felt like proof that the reps are compounding.",
    cheers: 36,
    comments: 7,
    pins: 301,
  },
  {
    id: 14,
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board: "Music",
    source: "Clique",
    time: "12h",
    type: "photo",
    image: "/music.png",
    text: "Bounced the first rough sequence. Still messy, but the project finally has a shape.",
    cheers: 22,
    comments: 5,
    title: "First rough sequence",
  },
  {
    id: 15,
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board: "Food",
    source: "Clique",
    time: "13h",
    type: "photo",
    image: "/food.png",
    text: "Cooked instead of ordering and actually plated it like I cared. Small thing, real proof.",
    cheers: 19,
    comments: 3,
    title: "Dinner worth repeating",
  },
];

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
  journey?: string;
  bragToFeed: boolean;
}) {
  const text = input.text.trim();
  const source =
    input.visibility === "Clique only" || input.visibility === "Private"
      ? input.visibility
      : "Public";
  const primaryAttachment = input.attachments?.find(
    (attachment) =>
      attachment.kind === "image" || attachment.kind === "video",
  );

  const brag: BragPost = {
    id: Date.now(),
    author: "Valentino",
    avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
    board: input.board,
    source: input.journey ? `Journey: ${input.journey}` : source,
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
    journey: input.journey,
    bragToFeed: input.bragToFeed,
    text,
    cheers: 0,
    comments: 0,
    title: makeTitle(text),
  };

  writeCreatedBrags([brag, ...readCreatedBrags()]);
  return brag;
}

export function useBrags(baseBrags = initialBrags) {
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

  return useMemo(() => [...createdBrags, ...baseBrags], [baseBrags, createdBrags]);
}

export function boardHref(board: string) {
  const boardRoutes: Record<string, string> = {
    Food: "/tiles/food",
    Music: "/tiles/music",
    Reading: "/tiles/reading",
  };

  return boardRoutes[board] ?? "/";
}
