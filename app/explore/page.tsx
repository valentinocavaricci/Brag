import { AppNav } from "../components/app-nav";

const boardRows = [
  {
    title: "Fitness",
    boards: [
      {
        name: "Maya Chen",
        board: "Marathon Build",
        brags: "27 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Leo Carter",
        board: "Strength Season",
        brags: "19 brags",
        color: "bg-[#14532d]",
      },
      {
        name: "Nico Lane",
        board: "5K Comeback",
        brags: "12 brags",
        color: "bg-[#155e75]",
      },
      {
        name: "Bella Cruz",
        board: "Mobility Work",
        brags: "22 brags",
        color: "bg-[#6d28d9]",
      },
      {
        name: "Dante Ford",
        board: "Boxing Basics",
        brags: "16 brags",
        color: "bg-[#854d0e]",
      },
    ],
  },
  {
    title: "Food",
    boards: [
      {
        name: "Elena Rossi",
        board: "Sunday Meal Prep",
        brags: "18 brags",
        color: "bg-[#9f1239]",
      },
      {
        name: "Marco Reed",
        board: "Protein Kitchen",
        brags: "25 brags",
        color: "bg-[#7c2d12]",
      },
      {
        name: "Ari Stone",
        board: "Cooking Basics",
        brags: "11 brags",
        color: "bg-[#be123c]",
      },
      {
        name: "Mia Torres",
        board: "No Takeout Month",
        brags: "21 brags",
        color: "bg-[#365314]",
      },
      {
        name: "Gianna Park",
        board: "Family Recipes",
        brags: "13 brags",
        color: "bg-[#86198f]",
      },
    ],
  },
  {
    title: "Education",
    boards: [
      {
        name: "Ari Stone",
        board: "52 Books",
        brags: "31 brags",
        color: "bg-[#4338ca]",
      },
      {
        name: "Sofia Alvarez",
        board: "Spanish Daily",
        brags: "28 brags",
        color: "bg-[#1e3a8a]",
      },
      {
        name: "Anthony Diaz",
        board: "Math Refresh",
        brags: "10 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Luca Vela",
        board: "Design Studies",
        brags: "17 brags",
        color: "bg-[#854d0e]",
      },
      {
        name: "Maya Chen",
        board: "History Notes",
        brags: "14 brags",
        color: "bg-[#14532d]",
      },
    ],
  },
  {
    title: "Career",
    boards: [
      {
        name: "Jordan Ellis",
        board: "Founder Notes",
        brags: "14 brags",
        color: "bg-[#7c2d12]",
      },
      {
        name: "Nico Lane",
        board: "Portfolio Push",
        brags: "20 brags",
        color: "bg-[#1e3a8a]",
      },
      {
        name: "Elena Rossi",
        board: "Interview Prep",
        brags: "8 brags",
        color: "bg-[#4338ca]",
      },
      {
        name: "Dante Ford",
        board: "Sales Reps",
        brags: "23 brags",
        color: "bg-[#155e75]",
      },
      {
        name: "Bella Cruz",
        board: "Client Wins",
        brags: "15 brags",
        color: "bg-[#6d28d9]",
      },
    ],
  },
  {
    title: "Faith & Wellness",
    boards: [
      {
        name: "Sofia Alvarez",
        board: "Quiet Mornings",
        brags: "9 brags",
        color: "bg-[#14532d]",
      },
      {
        name: "Gianna Park",
        board: "Gratitude Log",
        brags: "24 brags",
        color: "bg-[#86198f]",
      },
      {
        name: "Mia Torres",
        board: "Sleep Reset",
        brags: "12 brags",
        color: "bg-[#365314]",
      },
      {
        name: "Anthony Diaz",
        board: "Prayer Walks",
        brags: "16 brags",
        color: "bg-[#0f766e]",
      },
      {
        name: "Leo Carter",
        board: "Mindful Minutes",
        brags: "18 brags",
        color: "bg-[#854d0e]",
      },
    ],
  },
];

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#fbfbfb] pb-28 text-zinc-950 md:pb-0">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <AppNav active="Explore" />

        <header className="px-1 py-4 sm:px-4 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Explore
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Find boards worth following.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
            Discover public progress from people building discipline, skill,
            faith, fitness, and momentum.
          </p>
        </header>

        <section className="flex flex-col gap-9">
          {boardRows.map((row) => (
            <section key={row.title}>
              <div className="mb-3 flex items-center justify-between gap-4 px-1 sm:px-4 lg:px-10">
                <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                  {row.title}
                </h2>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-500 shadow-sm shadow-zinc-200"
                >
                  View all
                </button>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-4">
                  {row.boards.map((item) => (
                    <article
                      key={`${row.title}-${item.name}-${item.board}`}
                      className="group flex h-64 w-64 shrink-0 flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/70 sm:w-72"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`grid h-14 w-14 place-items-center rounded-2xl ${item.color} text-lg font-black text-white shadow-sm shadow-zinc-200 transition group-hover:rotate-3 group-hover:scale-105`}
                        >
                          {item.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                        </div>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-600">
                          {item.brags}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-zinc-500">
                          {item.name}
                        </p>
                        <h3 className="mt-2 text-3xl font-black leading-none tracking-tight text-zinc-950">
                          {item.board}
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </section>
      </section>
    </main>
  );
}
