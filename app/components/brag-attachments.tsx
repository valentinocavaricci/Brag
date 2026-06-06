import type { BragAttachment } from "../lib/brags";

export function BragAttachments({
  attachments,
}: {
  attachments: BragAttachment[];
}) {
  return (
    <div className="grid gap-px bg-zinc-200 sm:grid-cols-2">
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id}
          className={`bg-zinc-950 ${
            attachments.length % 2 === 1 && index === 0 ? "sm:col-span-2" : ""
          }`}
        >
          {attachment.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.url}
              alt=""
              className="max-h-[30rem] w-full object-cover"
            />
          ) : attachment.kind === "video" ? (
            <video
              src={attachment.url}
              controls
              className="max-h-[30rem] w-full"
            />
          ) : attachment.kind === "audio" ? (
            <div className="flex min-h-28 items-center px-4">
              <audio src={attachment.url} controls className="w-full" />
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
                Download
              </span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
