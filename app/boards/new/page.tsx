import { AppNav } from "../../components/app-nav";
import { BackButton } from "../../components/back-button";

const visibilityOptions = ["Public", "Clique only", "Private"];

export default function NewBoardPage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Boards" />

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
          <header className="px-1 py-4 sm:px-4">
            <BackButton />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              New Board
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
              Create a life domain.
            </h1>
          </header>

          <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
            <form className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 sm:p-6">
              <label className="block text-sm font-black text-zinc-700">
                Board name
                <input
                  className="mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-base font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                  placeholder="Fitness, Education, Cooking..."
                  type="text"
                />
              </label>

              <label className="mt-5 block text-sm font-black text-zinc-700">
                What kind of progress belongs here?
                <textarea
                  className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-base font-medium leading-7 outline-none transition focus:border-zinc-950 focus:bg-white"
                  placeholder="General brags and any specific journeys in this area..."
                />
              </label>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-black text-zinc-700">
                  Visibility
                  <select className="mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-zinc-950 focus:bg-white">
                    {visibilityOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-black text-zinc-700">
                  Optional first journey
                  <input
                    className="mt-3 h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-bold outline-none transition focus:border-zinc-950 focus:bg-white"
                    placeholder="LSAT, Ironman, Series 65..."
                    type="text"
                  />
                </label>
              </div>

              <button
                className="mt-6 h-12 w-full rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                type="button"
              >
                Create Board
              </button>
            </form>

            <aside className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
                Board Setup
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-3xl font-black tracking-tight">4</p>
                  <p className="text-sm font-bold text-zinc-500">
                    current boards
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">7</p>
                  <p className="text-sm font-bold text-zinc-500">
                    active journeys
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}
