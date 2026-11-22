import { createContext } from "react";
import type { Profile } from "./types";

export type Theme = "dark" | "light";

export type KreislaufContextValue = {
  regionId: string;
  setRegion: (id: string) => void;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  hydrated: boolean;
  version: number;
  bump: () => void;
  theme: Theme;
  toggleTheme: () => void;
};

export const KreislaufContext = createContext<KreislaufContextValue | null>(null);
