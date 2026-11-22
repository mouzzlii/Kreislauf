import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureProfile, setRegion as setRegionFn } from "./api";
import { DEFAULT_REGION } from "./types";
import { KreislaufContext, type Theme } from "./context-core";

const REGION_KEY = "kreislauf-region";
const THEME_KEY = "kreislauf-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

export function KreislaufProvider({ children }: { children: ReactNode }) {
  const { user } = useCurrentUserState();
  const [regionId, setRegionId] = useState(DEFAULT_REGION);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [version, setVersion] = useState(0);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedRegion = localStorage.getItem(REGION_KEY);
    if (storedRegion && /^[a-z0-9-]{2,48}$/.test(storedRegion)) setRegionId(storedRegion);
    const storedTheme = localStorage.getItem(THEME_KEY);
    const nextTheme = storedTheme === "light" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    setHydrated(true);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const next = await ensureProfile({
      data: {
        regionId,
        username: user.displayName || user.primaryEmail?.split("@")[0] || "Mitglied",
      },
    });
    setProfile(next);
    if (next.regionId !== regionId) {
      setRegionId(next.regionId);
      localStorage.setItem(REGION_KEY, next.regionId);
    }
  }, [regionId, user]);

  useEffect(() => {
    if (!hydrated) return;
    let cancel = false;
    if (!user) {
      setProfile(null);
      return;
    }
    refreshProfile().catch(() => {
      if (!cancel) setProfile(null);
    });
    return () => {
      cancel = true;
    };
    // refreshProfile changes with regionId; only re-ensure when the session identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user?.id]);

  const setRegion = useCallback(
    (id: string) => {
      setRegionId(id);
      localStorage.setItem(REGION_KEY, id);
      if (!user) return;
      void setRegionFn({ data: { regionId: id } })
        .then((next) => setProfile(next))
        .catch(() => undefined);
    },
    [user],
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return next;
    });
  }, []);

  const bump = useCallback(() => setVersion((value) => value + 1), []);

  const value = useMemo(
    () => ({
      regionId,
      setRegion,
      profile,
      refreshProfile,
      hydrated,
      version,
      bump,
      theme,
      toggleTheme,
    }),
    [regionId, setRegion, profile, refreshProfile, hydrated, version, bump, theme, toggleTheme],
  );

  return <KreislaufContext.Provider value={value}>{children}</KreislaufContext.Provider>;
}
