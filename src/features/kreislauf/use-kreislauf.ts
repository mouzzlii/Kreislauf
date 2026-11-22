import { useContext } from "react";
import { KreislaufContext, type KreislaufContextValue } from "./context-core";

export function useKreislauf(): KreislaufContextValue {
  const value = useContext(KreislaufContext);
  if (!value) throw new Error("KreislaufProvider fehlt");
  return value;
}
