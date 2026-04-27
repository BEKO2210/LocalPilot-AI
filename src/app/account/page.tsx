"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/core/database/supabase-browser";

/**
 * Account-Page (Code-Session 43).
 *
 * Client Component — kein Server-Render-Pfad, weil Static-Export
 * keine dynamischen Server Components mag. Wir holen den User
 * client-side über den Browser-Supabase-Client.
 *
 * Drei Zustände:
 *   - loading: Anfangs-Spinner.
 *   - authed: User-Info + Logout-Button.
 *   - guest: Hinweis + Link zu /login.
 *
 * Wenn der Browser-Client `null` ist (ENV nicht konfiguriert,
 * z. B. statische GitHub-Pages-Vorschau), zeigen wir eine
 * „Demo-Modus"-Karte mit Hinweis auf Vercel-URL.
 */

type State =
  | { kind: "loading" }
  | { kind: "authed"; email: string; userId: string }
  | { kind: "guest" }
  | { kind: "unconfigured" };

export default function AccountPage() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setState({ kind: "unconfigured" });
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error } = await client.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setState({ kind: "guest" });
        return;
      }
      setState({
        kind: "authed",
        email: data.user.email ?? "(keine E-Mail)",
        userId: data.user.id,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignOut() {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="lp-container max-w-md py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Dein Account
      </h1>

      {state.kind === "loading" ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Login-Status wird geprüft …
        </p>
      ) : state.kind === "authed" ? (
        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 text-emerald-900">
              <ShieldCheck className="h-5 w-5" aria-hidden />
              <p className="font-semibold">Eingeloggt</p>
            </div>
            <p className="mt-3 flex items-center gap-2 text-sm text-emerald-900">
              <Mail className="h-4 w-4" aria-hidden />
              {state.email}
            </p>
            <p className="mt-1 break-all text-xs text-emerald-800/80">
              User-ID: <code className="font-mono">{state.userId}</code>
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-ink-50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Abmelden
          </button>

          <p className="text-xs text-ink-500">
            Hinweis: Multi-Tenant-Bindung (welche Betriebe siehst du im
            Dashboard?) folgt mit der nächsten Session. Aktuell zeigen
            die Dashboard-Routen die Demo-Betriebe für alle.
          </p>
        </div>
      ) : state.kind === "unconfigured" ? (
        <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 p-6">
          <div className="flex items-center gap-2 text-ink-800">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <p className="font-semibold">Demo-Modus</p>
          </div>
          <p className="mt-3 text-sm text-ink-700">
            Diese Vorschau hat kein Auth-Backend. Echte Logins
            funktionieren nur auf der Vercel-Production-URL, sobald
            <code className="ml-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            +{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            gesetzt sind.
          </p>
          <Link
            href="/demo"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-2"
          >
            → Demo-Betriebe ansehen
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-ink-700">
            Du bist nicht eingeloggt.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Zum Login
          </Link>
        </div>
      )}
    </main>
  );
}
