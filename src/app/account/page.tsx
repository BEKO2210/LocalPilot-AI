"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  LogOut,
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getBrowserSupabaseClient } from "@/core/database/supabase-browser";
import {
  fetchBusinessesForUser,
  roleLabel,
  shouldRedirectToSingle,
  tierLabel,
  type BusinessMembership,
  type MembershipRole,
} from "@/lib/account-businesses";

/**
 * Account-Page (Code-Session 43, erweitert in 46).
 *
 * Client Component — kein Server-Render-Pfad, weil Static-Export
 * keine dynamischen Server Components mag. Auth + Memberships
 * werden client-side geladen.
 *
 * **Code-Session 46**: Nach erfolgreichem Auth-Check wird die
 * Liste der Betriebe pro User aus Supabase geholt
 * (`business_owners ⨝ businesses`, RLS-gefiltert auf den
 * eigenen User). Empty-State zeigt einen prominenten
 * Onboarding-CTA.
 */

type AuthState =
  | { kind: "loading" }
  | { kind: "authed"; email: string; userId: string }
  | { kind: "guest" }
  | { kind: "unconfigured" };

type BusinessesState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready"; list: readonly BusinessMembership[] }
  | { kind: "error"; message: string };

export default function AccountPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ kind: "loading" });
  const [businesses, setBusinesses] = useState<BusinessesState>({ kind: "idle" });
  const [redirecting, setRedirecting] = useState(false);

  // Auth-Check
  useEffect(() => {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setAuth({ kind: "unconfigured" });
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error } = await client.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setAuth({ kind: "guest" });
        return;
      }
      setAuth({
        kind: "authed",
        email: data.user.email ?? "(keine E-Mail)",
        userId: data.user.id,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Betrieb-Liste laden, sobald wir den User kennen
  useEffect(() => {
    if (auth.kind !== "authed") return;
    const client = getBrowserSupabaseClient();
    if (!client) return;
    let cancelled = false;
    setBusinesses({ kind: "loading" });
    void (async () => {
      try {
        const list = await fetchBusinessesForUser(client, auth.userId);
        if (cancelled) return;
        setBusinesses({ kind: "ready", list });
      } catch (err) {
        if (cancelled) return;
        setBusinesses({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Konnte Betriebe nicht laden.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth]);

  // Single-Business-Default-Redirect (Code-Session 63).
  //
  // Wenn der Owner nur einen Betrieb hat, ist die Account-Liste
  // nur ein Klick zwischen Login und Dashboard. Springen wir
  // direkt durch — außer der User ist absichtlich hier
  // (Query-Param `?stay=1`, z.B. „Neuen Betrieb anlegen" oder
  // einen vorhandenen verlassen). `router.replace` statt `push`,
  // damit die Account-URL nicht im Browser-Verlauf landet —
  // sonst würde Back-Navigation in einer Schleife zwischen
  // Account und Dashboard hängen.
  useEffect(() => {
    if (businesses.kind !== "ready") return;
    const stay =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("stay") === "1";
    const target = shouldRedirectToSingle(businesses.list, { stay });
    if (target) {
      setRedirecting(true);
      router.replace(target);
    }
  }, [businesses, router]);

  async function handleSignOut() {
    const client = getBrowserSupabaseClient();
    if (!client) return;
    await client.auth.signOut();
    router.push("/login");
  }

  return (
    <main id="main-content" className="lp-container max-w-3xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
        Dein Account
      </h1>

      {auth.kind === "loading" ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Login-Status wird geprüft …
        </p>
      ) : redirecting ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Du hast nur einen Betrieb — wir öffnen direkt das
          Dashboard …
        </p>
      ) : auth.kind === "authed" ? (
        <>
          <AuthedHeader
            email={auth.email}
            userId={auth.userId}
            onSignOut={() => void handleSignOut()}
          />

          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-ink-900">
                Meine Betriebe
              </h2>
              <Link
                href="/onboarding"
                className="lp-focus-ring inline-flex items-center gap-1 rounded-sm text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Neuer Betrieb
              </Link>
            </div>
            <BusinessesBlock state={businesses} />
          </section>
        </>
      ) : auth.kind === "unconfigured" ? (
        <UnconfiguredCard />
      ) : (
        <GuestCard />
      )}
    </main>
  );
}

function AuthedHeader({
  email,
  userId,
  onSignOut,
}: {
  email: string;
  userId: string;
  onSignOut: () => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-emerald-900">
          <ShieldCheck className="h-5 w-5" aria-hidden />
          <p className="font-semibold">Eingeloggt</p>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-900">
          <Mail className="h-4 w-4 flex-none" aria-hidden />
          <span className="truncate">{email}</span>
        </p>
        <p className="mt-1 break-all text-xs text-emerald-800/80">
          User-ID: <code className="font-mono">{userId}</code>
        </p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="lp-focus-ring inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 hover:bg-ink-50 sm:self-start"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        Abmelden
      </button>
    </div>
  );
}

function BusinessesBlock({ state }: { state: BusinessesState }) {
  if (state.kind === "idle" || state.kind === "loading") {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-ink-600">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Lade deine Betriebe …
      </p>
    );
  }
  if (state.kind === "error") {
    return (
      <div
        role="alert"
        className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
        <div>
          <p className="font-medium">Konnte Betriebe nicht laden.</p>
          <p className="mt-0.5 text-xs opacity-90">{state.message}</p>
        </div>
      </div>
    );
  }
  if (state.list.length === 0) {
    return <EmptyBusinessesCard />;
  }
  return (
    <ul className="mt-4 space-y-3">
      {state.list.map((m) => (
        <li key={m.businessId}>
          <BusinessCard membership={m} />
        </li>
      ))}
    </ul>
  );
}

function EmptyBusinessesCard() {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-ink-300 bg-ink-50 p-6">
      <div className="flex items-center gap-2 text-ink-800">
        <Sparkles className="h-5 w-5" aria-hidden />
        <p className="font-semibold">Noch kein Betrieb</p>
      </div>
      <p className="mt-2 text-sm text-ink-700">
        Lege deinen ersten Betrieb in unter zwei Minuten an. Branche, Theme
        und Slogan reichen für den Start — Adresse und Kontakt kannst du in
        Ruhe ergänzen.
      </p>
      <Link
        href="/onboarding"
        className="lp-focus-ring mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Betrieb anlegen
      </Link>
    </div>
  );
}

function BusinessCard({ membership }: { membership: BusinessMembership }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-ink-200 bg-white p-5 shadow-soft sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-ink-900">
            {membership.name}
          </h3>
          <RoleBadge role={membership.role} />
          <TierBadge tier={membership.packageTier} />
          <PublishBadge isPublished={membership.isPublished} />
        </div>
        {membership.tagline ? (
          <p className="mt-1 text-sm text-ink-600">{membership.tagline}</p>
        ) : null}
        <p className="mt-1 text-xs text-ink-500">
          Slug: <code className="font-mono">{membership.slug}</code>
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <Link
          href={`/dashboard/${membership.slug}`}
          className="lp-focus-ring inline-flex h-11 items-center gap-1.5 rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Dashboard öffnen
          <ExternalLink className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href={`/site/${membership.slug}`}
          className="lp-focus-ring inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
        >
          Public-Site
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function RoleBadge({ role }: { role: MembershipRole }) {
  const Icon =
    role === "owner" ? CheckCircle2 : role === "editor" ? Pencil : Eye;
  const styles =
    role === "owner"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : role === "editor"
        ? "border-sky-200 bg-sky-50 text-sky-900"
        : "border-ink-200 bg-ink-50 text-ink-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {roleLabel(role)}
    </span>
  );
}

function TierBadge({ tier }: { tier: BusinessMembership["packageTier"] }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2 py-0.5 text-[11px] font-medium text-ink-700">
      {tierLabel(tier)}
    </span>
  );
}

function PublishBadge({ isPublished }: { isPublished: boolean }) {
  if (isPublished) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">
      Entwurf
    </span>
  );
}

function GuestCard() {
  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-ink-700">Du bist nicht eingeloggt.</p>
      <Link
        href="/login"
        className="lp-focus-ring inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Zum Login
      </Link>
    </div>
  );
}

function UnconfiguredCard() {
  return (
    <div className="mt-8 rounded-2xl border border-ink-200 bg-ink-50 p-6">
      <div className="flex items-center gap-2 text-ink-800">
        <AlertTriangle className="h-5 w-5" aria-hidden />
        <p className="font-semibold">Demo-Modus</p>
      </div>
      <p className="mt-3 text-sm text-ink-700">
        Diese Vorschau hat kein Auth-Backend. Echte Logins funktionieren
        nur auf der Vercel-Production-URL, sobald
        <code className="ml-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
        <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
        gesetzt sind.
      </p>
      <Link
        href="/demo"
        className="lp-focus-ring mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-medium underline underline-offset-2"
      >
        → Demo-Betriebe ansehen
      </Link>
    </div>
  );
}
