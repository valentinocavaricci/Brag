import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Explore", href: "/explore", icon: "compass" },
  { label: "Brag", href: "/brags/new", icon: "plus", primary: true },
  { label: "Messages", href: "/messages", icon: "message" },
  { label: "Boards", href: "/boards", icon: "grid" },
  { label: "Profile", href: "/profile", icon: "user" },
];

function NavIcon({ icon }: { icon: string }) {
  const commonProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  if (icon === "home") {
    return (
      <svg {...commonProps}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (icon === "compass") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2.2 5-4.8 2 2.2-5 4.8-2Z" />
      </svg>
    );
  }

  if (icon === "plus") {
    return (
      <svg {...commonProps}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (icon === "grid") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
      </svg>
    );
  }

  if (icon === "message") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="5" width="16" height="14" rx="4" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
        <path d="m9 19-3 3" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function AppNav({ active = "Home" }: { active?: string }) {
  return (
    <>
      <nav className="sticky top-0 z-30 -mx-5 bg-[#fbfbfb]/92 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-zinc-950"
            aria-label="BRAG home"
          >
            BRAG
          </Link>

          <div className="flex items-center justify-end gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const isActive = item.label === active;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      item.primary
                        ? "nav-primary-button ml-2 inline-flex h-11 items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800"
                        : `inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-bold transition hover:bg-white hover:text-zinc-950 ${
                            isActive
                              ? "bg-white text-zinc-950 shadow-sm shadow-zinc-200"
                              : "text-zinc-600"
                          }`
                    }
                  >
                    <NavIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <ThemeToggle />

            <Link
              href="/brags/new"
              className="grid h-11 w-11 place-items-center rounded-full bg-zinc-950 text-white shadow-sm shadow-zinc-300 transition hover:-translate-y-0.5 hover:bg-zinc-800 md:hidden"
              aria-label="Create a brag"
            >
              <NavIcon icon="plus" />
            </Link>
          </div>
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-[#fbfbfb]/94 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(24,24,27,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 items-end gap-1">
          {navItems.map((item) => {
            const isActive = item.label === active;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  item.primary
                    ? "group -mt-7 flex min-w-0 flex-col items-center gap-1 text-xs font-black text-zinc-950"
                    : `flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-xs font-bold transition hover:bg-white hover:text-zinc-950 ${
                        isActive ? "text-zinc-950" : "text-zinc-500"
                      }`
                }
              >
                <span
                  className={
                    item.primary
                      ? "nav-primary-button grid h-14 w-14 place-items-center rounded-full bg-zinc-950 text-white shadow-lg shadow-zinc-300 transition group-hover:-translate-y-0.5 group-hover:bg-zinc-800"
                      : `grid h-7 w-7 place-items-center rounded-full ${
                          isActive ? "bg-white shadow-sm shadow-zinc-200" : ""
                        }`
                  }
                >
                  <NavIcon icon={item.icon} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
