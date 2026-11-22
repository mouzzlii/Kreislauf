import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Field, fieldClass } from "@/components/ui";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <Shell>
        <div className="h-40 animate-pulse rounded-3xl bg-elev" />
      </Shell>
    );
  }
  if (!authEnabled) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest">KREISLAUF · Testversion</p>
          <h1 className="mt-2 font-display text-4xl text-fg">Demo-Zugang</h1>
          <p className="mt-3 text-muted">
            Diese Vorschau verwendet derzeit ein gemeinsames Testkonto. Eine persönliche Registrierung und private Konten sind noch nicht freigeschaltet.
            Änderungen können in dieser Demo für andere Testbesucher sichtbar sein.
          </p>
          <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-lg bg-forest px-5 text-sm font-medium text-paper">
            Demo öffnen
          </Link>
        </div>
      </Shell>
    );
  }
  if (user) return <Navigate to="/" />;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (mode === "up") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Mitglied",
          callbackURL: "/",
        });
        if (result.error) {
          setError(result.error.message ?? "Konto konnte nicht angelegt werden");
          return;
        }
      } else {
        const result = await authClient.signIn.email({ email, password, callbackURL: "/" });
        if (result.error) {
          setError(result.error.message ?? "Anmeldung fehlgeschlagen");
          return;
        }
      }
      window.location.assign("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="mx-auto max-w-sm">
        <h1 className="font-display text-4xl text-fg">
          {mode === "up" ? "Mitmachen" : "Anmelden"}
        </h1>
        <p className="mt-2 text-muted">
          Erst mit Konto kannst du tauschen, buchen und Karma halten. Der Markt selbst bleibt sichtbar.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {mode === "up" ? (
            <Field label="Name in der Region">
              <input className={fieldClass} value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
            </Field>
          ) : null}
          <Field label="E-Mail">
            <input
              className={fieldClass}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="Passwort">
            <input
              className={fieldClass}
              type="password"
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </Field>
          {error ? <p className="text-sm text-copper">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Einen Moment…" : mode === "up" ? "Konto anlegen" : "Anmelden"}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-muted underline-offset-4 hover:underline"
          onClick={() => setMode((value) => (value === "up" ? "in" : "up"))}
        >
          {mode === "up" ? "Ich habe schon ein Konto" : "Noch kein Konto"}
        </button>
        <div className="mt-8 space-y-2">
          {GROK_PROVIDERS.map((provider) => (
            <Button
              key={provider.providerId}
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}
            >
              Weiter mit {provider.label}
            </Button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
