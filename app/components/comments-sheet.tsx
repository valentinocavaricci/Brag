"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BragPost } from "../lib/brags";

const SAMPLE_COMMENTS: Record<string, { author: string; avatar: string; text: string; time: string }[]> = {
  default: [
    { author: "Sofia", avatar: "/girl1.png", text: "okay this is actually incredible", time: "2h" },
    { author: "Marco", avatar: "/guy1.png", text: "keep going!!", time: "1h" },
    { author: "Leo", avatar: "/guy2.png", text: "proud of you fr", time: "45m" },
  ],
  Gym: [
    { author: "Elena", avatar: "/girl4.png", text: "the form looked clean too 👀", time: "3h" },
    { author: "Luca", avatar: "/guy6.png", text: "bro we're going tomorrow right", time: "2h" },
    { author: "Marco", avatar: "/guy1.png", text: "this is the one 🔥", time: "1h" },
  ],
  Music: [
    { author: "Gianna", avatar: "/girl2.png", text: "need to hear this NOW", time: "4h" },
    { author: "Nico", avatar: "/guy3.png", text: "the shape of it sounds so good already", time: "2h" },
    { author: "Bella", avatar: "/girl5.png", text: "this album is going to be insane", time: "30m" },
  ],
  Reading: [
    { author: "Dante", avatar: "/guy5.png", text: "war and peace absolutely destroyed me", time: "5h" },
    { author: "Sofia", avatar: "/girl1.png", text: "okay you're inspiring me to actually start", time: "3h" },
    { author: "Anthony", avatar: "/guy4.png", text: "the streak is the hard part. respect.", time: "1h" },
  ],
  Food: [
    { author: "Mia", avatar: "/girl3.png", text: "okay i need this recipe", time: "2h" },
    { author: "Elena", avatar: "/girl4.png", text: "the crust on that is PERFECT", time: "1h" },
    { author: "Sofia", avatar: "/girl1.png", text: "coming over next time you make this", time: "20m" },
  ],
};

type Comment = { author: string; avatar: string; text: string; time: string };

type Props = {
  post: BragPost | null;
  onClose: () => void;
};

export function CommentsSheet({ post, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [addedComments, setAddedComments] = useState<Record<string, Comment[]>>(
    {},
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const postKey = post ? String(post.id) : "";
  const localComments = useMemo(() => {
    if (!post) return [];

    const base = SAMPLE_COMMENTS[post.board] ?? SAMPLE_COMMENTS.default;
    return [...base, ...(addedComments[postKey] ?? [])];
  }, [addedComments, post, postKey]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(Boolean(post)));
    return () => cancelAnimationFrame(frame);
  }, [post]);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 280);
  }

  function handlePost() {
    const text = commentText.trim();
    if (!text) return;
    setAddedComments((current) => ({
      ...current,
      [postKey]: [
        ...(current[postKey] ?? []),
        {
          author: "Valentino",
          avatar: "/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg",
          text,
          time: "Just now",
        },
      ],
    }));
    setCommentText("");
  }

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-zinc-950/30 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`relative z-10 flex max-h-[82vh] flex-col rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Handle */}
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-zinc-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 pb-3">
          <p className="text-sm font-black text-zinc-950">
            Comments <span className="ml-1 font-semibold text-zinc-400">{localComments.length}</span>
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-7 w-7 place-items-center rounded-full bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Post preview */}
        <div className="border-b border-zinc-100 px-5 py-3">
          <p className="text-xs font-black text-zinc-500">{post.author} · {post.board}</p>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-700">{post.text}</p>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {localComments.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-zinc-400">No comments yet. Be the first.</p>
          ) : (
            <div className="flex flex-col gap-5">
              {localComments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                    <Image src={c.avatar} alt={c.author} fill sizes="32px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-black text-zinc-950">{c.author}</span>
                      <span className="text-xs font-semibold text-zinc-400">{c.time}</span>
                    </div>
                    <p className="mt-0.5 text-sm leading-5 text-zinc-700">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="border-t border-zinc-100 px-4 py-3 pb-safe">
          <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-200">
              <Image src="/6A85CB5E-12A6-4793-B441-913A0D8DD07E_1_105_c.jpeg" alt="You" fill sizes="28px" className="object-cover" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handlePost(); }}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent text-sm font-semibold text-zinc-700 outline-none placeholder:font-medium placeholder:text-zinc-400"
            />
            {commentText.trim() && (
              <button
                type="button"
                onClick={handlePost}
                className="shrink-0 text-xs font-black text-zinc-950 transition hover:text-zinc-600"
              >
                Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
