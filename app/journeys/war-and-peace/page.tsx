import Link from "next/link";
import { AppNav } from "../../components/app-nav";

const brags = [
  {
    marker: "Day 1",
    title: "Started the book",
    body: "Bought War and Peace today. It is huge and honestly intimidating, but I am proud that I actually started.",
  },
  {
    marker: "Page 100",
    title: "First milestone",
    body: "Hit page 100. Still confused sometimes, but I am starting to get into the rhythm of the book.",
  },
  {
    marker: "Finished",
    title: "Completed War and Peace",
    body: "Finished the whole book. This was one of the hardest books I have ever read, and I am proud I stuck with it.",
  },
];

export default function WarAndPeacePage() {
  return (
    <main className="min-h-screen bg-white pb-28 text-black md:pb-0">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />
        <Link
          href="/tiles/reading"
          className="mt-5 inline-block text-sm text-gray-500 transition hover:text-black"
        >
          ← Back to Reading
        </Link>

        <header className="mt-5 rounded-[2rem] border border-gray-200 bg-gray-50 p-8 md:p-10">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700">
              Reading
            </span>
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700">
              Completed journey
            </span>
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
            Reading War and Peace
          </h1>

          <p className="mt-5 max-w-2xl text-xl leading-8 text-gray-600">
            A scrollable BRAG journey showing the full arc from starting the book
            to finishing it.
          </p>
        </header>

        <section className="mt-10">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">Journey Timeline</h2>
            <p className="mt-2 text-gray-500">
              Each card is a brag: a moment of progress worth remembering.
            </p>
          </div>

          <div className="relative space-y-5 before:absolute before:left-5 before:top-2 before:h-full before:w-px before:bg-gray-200">
            {brags.map((brag) => (
              <article key={brag.title} className="relative pl-14">
                <div className="absolute left-2 top-7 h-6 w-6 rounded-full border border-gray-300 bg-white" />
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:bg-gray-50">
                  <p className="mb-2 text-sm font-medium text-gray-500">
                    {brag.marker}
                  </p>
                  <h3 className="text-2xl font-bold">{brag.title}</h3>
                  <p className="mt-3 leading-7 text-gray-600">{brag.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
