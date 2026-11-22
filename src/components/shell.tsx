import { Link, useRouterState } from "@tanstack/react-router";
import { Map, Moon, Plus, Store, Sun, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useKreislauf } from "@/features/kreislauf/use-kreislauf";
import { formatKarma } from "@/features/kreislauf/format";
import type { Region } from "@/features/kreislauf/types";

const NAV = [
  { to: "/", label: "Markt", icon: Store },
  { to: "/karte", label: "Karte", icon: Map },
  { to: "/inserat/neu", label: "Inserieren", icon: Plus },
  { to: "/konto", label: "Konto", icon: Wallet },
] as const;

export function Shell({
  children,
  regions,
}: {
  children: ReactNode;
  regions?: Region[];
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, isPending } = useCurrentUserState();
  const { regionId, setRegion, profile, theme, toggleTheme } = useKreislauf();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-9 w-9 shrink-0" />
            <span className="truncate font-display text-xl leading-none tracking-tight">Kreislauf</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm ${active ? "bg-elev-2 text-fg" : "text-muted"}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            {isPending ? (
              <span className="h-9 w-16 animate-pulse rounded-lg bg-elev-2" />
            ) : profile && user ? (
              <Link
                to="/konto"
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-elev px-3 text-sm tabular-nums text-copper"
              >
                {formatKarma(profile.karmaBalance)}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={toggleTheme}
              className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-elev"
              aria-label={theme === "dark" ? "Helles Erscheinungsbild" : "Dunkles Erscheinungsbild"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {regions && regions.length > 0 ? (
          <div className="mx-auto w-full max-w-5xl px-4 pb-3">
            <label className="flex items-center gap-3 text-sm text-muted">
              <span className="shrink-0">Region</span>
              <select
                value={regions.some((region) => region.id === regionId) ? regionId : regions[0]?.id}
                onChange={(event) => setRegion(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-elev px-3 text-base text-fg"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 md:pb-16">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-xs ${active ? "text-fg" : "text-subtle"}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <span className="sr-only">
        <SignedIn>Angemeldet</SignedIn>
        <SignedOut>Gast</SignedOut>
      </span>
    </div>
  );
}
