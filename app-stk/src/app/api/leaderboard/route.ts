import { NextResponse } from "next/server";
import { getServerSupabase, LEADERBOARD_TABLE } from "@/lib/supabase";

/**
 * Global leaderboard API — backed by Supabase.
 *
 *   GET  /api/leaderboard       → 100 best scores worldwide
 *   POST /api/leaderboard       → insert one score after validation
 *
 * Validation rules (anti-cheat / anti-spam, none of which require user
 * accounts):
 *   • Pseudonym 1..24 chars, trimmed.
 *   • Score must be plausible for 22 pairs:
 *       0  ≤ score ≤ 22 × 500 = 11_000
 *   • Time must be plausible:
 *       30s ≤ temps ≤ 4h (14_400s)
 *   • Errors: 0 ≤ erreurs ≤ 1000
 *   • Per-IP/per-pseudo: refuse if the same (pseudo, score, temps,
 *     erreurs) tuple was POSTed in the last 5 minutes — kills accidental
 *     double-submits from React strict mode / page reloads.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RawEntry {
  prenom?: unknown;
  score?: unknown;
  temps?: unknown;
  erreurs?: unknown;
}

interface CleanEntry {
  prenom: string;
  score: number;
  temps: number;
  erreurs: number;
}

const MAX_SCORE = 22 * 500; // 11_000
const MIN_TIME = 30;
const MAX_TIME = 4 * 3600;
const MAX_ERRORS = 1000;
const MAX_PSEUDO_LEN = 24;

// In-memory de-dup window — survives the lifetime of the lambda instance.
// Best-effort, not a security boundary.
const recentSubmissions = new Map<string, number>();
const RECENT_TTL_MS = 5 * 60 * 1000;

function pruneRecent(now: number) {
  for (const [key, ts] of recentSubmissions) {
    if (now - ts > RECENT_TTL_MS) recentSubmissions.delete(key);
  }
}

function clean(raw: RawEntry): CleanEntry | { error: string } {
  if (typeof raw.prenom !== "string") return { error: "prenom requis" };
  const prenom = raw.prenom.trim().slice(0, MAX_PSEUDO_LEN);
  if (prenom.length === 0) return { error: "prenom vide" };

  if (typeof raw.score !== "number" || !Number.isFinite(raw.score))
    return { error: "score invalide" };
  if (typeof raw.temps !== "number" || !Number.isFinite(raw.temps))
    return { error: "temps invalide" };
  if (typeof raw.erreurs !== "number" || !Number.isFinite(raw.erreurs))
    return { error: "erreurs invalide" };

  const score = Math.floor(raw.score);
  const temps = Math.floor(raw.temps);
  const erreurs = Math.floor(raw.erreurs);

  if (score < 0 || score > MAX_SCORE) return { error: "score hors plage" };
  if (temps < MIN_TIME || temps > MAX_TIME) return { error: "temps hors plage" };
  if (erreurs < 0 || erreurs > MAX_ERRORS) return { error: "erreurs hors plage" };

  return { prenom, score, temps, erreurs };
}

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { entries: [], backend: "none" },
      { status: 200 },
    );
  }

  const { data, error } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("prenom, score, temps, erreurs, created_at")
    .order("score", { ascending: false })
    .order("temps", { ascending: true })
    .order("erreurs", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { entries: [], backend: "supabase", error: error.message },
      { status: 500 },
    );
  }

  const entries = (data ?? []).map((row) => ({
    prenom: row.prenom as string,
    score: row.score as number,
    temps: row.temps as number,
    erreurs: row.erreurs as number,
    date: new Date(row.created_at as string).toLocaleDateString("fr-FR"),
  }));

  return NextResponse.json(
    { entries, backend: "supabase" },
    {
      status: 200,
      headers: {
        // Short edge cache to keep the leaderboard live but lighten the DB
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    },
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const result = clean(body as RawEntry);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const supabase = getServerSupabase();
  if (!supabase) {
    // Backend not configured. We still return 200 so the client can fall
    // back to localStorage transparently.
    return NextResponse.json(
      { ok: true, backend: "none" },
      { status: 200 },
    );
  }

  const now = Date.now();
  pruneRecent(now);
  const dedupKey = `${result.prenom}|${result.score}|${result.temps}|${result.erreurs}`;
  const recent = recentSubmissions.get(dedupKey);
  if (recent && now - recent < RECENT_TTL_MS) {
    return NextResponse.json(
      { ok: true, backend: "supabase", deduped: true },
      { status: 200 },
    );
  }
  recentSubmissions.set(dedupKey, now);

  const { error } = await supabase
    .from(LEADERBOARD_TABLE)
    .insert([result]);

  if (error) {
    return NextResponse.json(
      { error: error.message, backend: "supabase" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, backend: "supabase" },
    { status: 200 },
  );
}
