import Link from "next/link";
import { AppNav } from "../../components/app-nav";

const demos = [
  {
    marker: "Demo 01",
    title: "Voice memo became a verse",
    body: "Started with a melody into the phone and built enough around it to know there is a song here.",
  },
  {
    marker: "Demo 03",
    title: "Found the sound",
    body: "The drums finally stopped fighting the guitar part. First time the project felt like it had a palette.",
  },
  {
    marker: "Demo 06",
    title: "Hook finally landed",
    body: "Rewrote the chorus three times and the last pass actually felt like the song talking back.",
  },
  {
    marker: "Rough sequence",
    title: "The album has a shape",
    body: "Put the demos in an order. Not finished, not polished, but the arc is starting to make sense.",
  },
];

export default function NewAlbumPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/tiles/music"
          className="mt-5 inline-block text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Music
        </Link>

        <header className="mt-5 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
          <div
            className="relative flex min-h-72 flex-col justify-end bg-cover bg-center p-7 text-white md:p-9"
            style={{ backgroundImage: "url(/music.png)" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.18)_40%,rgba(0,0,0,0.78)_100%)]" />
            <div className="relative z-10">
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-md">
                  Music
                </span>
                <span className="rounded-full bg-white/18 px-3 py-1 text-sm font-semibold backdrop-blur-md">
                  Active journey
                </span>
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
                New Album?? 👀
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
                A running proof trail for demos, rough mixes, and the tiny
                decisions that turn sketches into a project.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-3xl font-black tracking-tight">
              Demo Timeline
            </h2>
            <p className="mt-2 text-zinc-500">
              Each update is a brag: proof that the album moved.
            </p>
          </div>

          <div className="relative space-y-5 before:absolute before:left-5 before:top-2 before:h-full before:w-px before:bg-zinc-200">
            {demos.map((demo) => (
              <article key={demo.title} className="relative pl-14">
                <div className="absolute left-2 top-7 h-6 w-6 rounded-full border border-zinc-300 bg-white" />
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:bg-zinc-50">
                  <p className="mb-2 text-sm font-semibold text-zinc-500">
                    {demo.marker}
                  </p>
                  <h3 className="text-2xl font-black tracking-tight">
                    {demo.title}
                  </h3>
                  <p className="mt-3 leading-7 text-zinc-600">{demo.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
