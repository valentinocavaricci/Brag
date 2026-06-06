import Link from "next/link";
import Image from "next/image";
import { AppNav } from "../../components/app-nav";

const brags = [
  {
    marker: "Starter",
    title: "Starter finally woke up",
    body: "It doubled on schedule for the first time. Tiny bubbles, huge morale boost.",
    image: "/food2.png",
  },
  {
    marker: "Loaf 02",
    title: "Better shape, better rise",
    body: "Still learning the scoring, but the dough held itself together and the crust had real color.",
    image: "/food.png",
  },
  {
    marker: "Next",
    title: "Dialing fermentation",
    body: "The next goal is a more open crumb without losing structure. Slow progress, very edible.",
    image: "/food2.png",
  },
];

export default function SourdoughBreadPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/tiles/food"
          className="mt-5 inline-block text-sm font-semibold text-zinc-500 transition hover:text-zinc-950"
        >
          ← Back to Food
        </Link>

        <header className="mt-5 rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-sm md:p-9">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold text-zinc-700">
              Food
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              Active journey
            </span>
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Sourdough Bread
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            A small but specific journey for starter care, fermentation, crust,
            and proof that each loaf teaches the next one.
          </p>
        </header>

        <section className="mt-10 grid gap-5">
          {brags.map((brag) => (
            <article
              key={brag.title}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] bg-zinc-100">
                <Image
                  src={brag.image}
                  alt={brag.title}
                  fill
                  sizes="(min-width: 768px) 896px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="mb-2 text-sm font-semibold text-zinc-500">
                  {brag.marker}
                </p>
                <h3 className="text-2xl font-black tracking-tight">
                  {brag.title}
                </h3>
                <p className="mt-3 leading-7 text-zinc-600">{brag.body}</p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
