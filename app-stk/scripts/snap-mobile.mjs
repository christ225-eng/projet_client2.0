/**
 * Mobile responsive snapshot — iPhone 13 viewport (390×844 @ DPR 3).
 * Captures every screen so we can verify:
 *   • no horizontal overflow
 *   • 2-col card grid
 *   • labels wrap instead of truncating to "P…"
 *   • header pills fit on a single line
 *   • podium fits with 3 cards visible
 */

import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STK_URL ?? "http://localhost:3000";
const SHOTS = "test-screenshots";

const PAIRS_LVL1 = [
  ["Fruits de bardane", "Velcro"],
  ["Gekko", "Adhésif Geckskin"],
  ["Peau du requin", "Combinaisons de natation"],
  ["Martin-pêcheur", "TGV japonais"],
];

const snap = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `mobile-${name}.png`), fullPage: false });
const snapFull = (page, name) =>
  page.screenshot({
    path: path.join(SHOTS, `mobile-${name}-full.png`),
    fullPage: true,
  });

(async () => {
  await mkdir(SHOTS, { recursive: true });

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const ctx = await browser.newContext({
    ...devices["iPhone 13"],
    locale: "fr-FR",
  });
  const page = await ctx.newPage();

  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  // Wipe stored scores so the empty leaderboard state is reproducible
  await page.goto(BASE);
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem("stk-leaderboard-v1");
    } catch {
      /* noop */
    }
  });

  // ── Landing ──────────────────────────────────────────────────────────────
  console.log("→ /");
  await page.goto(BASE);
  await page.waitForTimeout(1000);
  await snap(page, "01-landing");

  // ── Pseudo ───────────────────────────────────────────────────────────────
  console.log("→ /pseudo");
  await page.goto(`${BASE}/pseudo`);
  await page.waitForTimeout(900);
  await snap(page, "02-pseudo");
  await page.getByLabel("Entrez votre pseudo").fill("Christ");
  await snap(page, "02-pseudo-filled");
  await page.getByLabel("Entrez votre pseudo").press("Enter");

  // ── Intro ────────────────────────────────────────────────────────────────
  console.log("→ /intro");
  await page.waitForURL(/\/intro$/);
  await page.waitForTimeout(800);
  await snap(page, "03-intro-step1");
  for (let i = 0; i < 2; i++) {
    await page
      .locator(
        'button[aria-label="Étape suivante"], button[aria-label="Commencer le jeu"]',
      )
      .first()
      .click();
    await page.waitForTimeout(450);
  }
  await snap(page, "04-intro-step3");
  await page
    .locator(
      'button[aria-label="Étape suivante"], button[aria-label="Commencer le jeu"]',
    )
    .first()
    .click();

  // ── Levels hub ───────────────────────────────────────────────────────────
  console.log("→ /levels");
  await page.waitForURL(/\/levels$/);
  await page.waitForTimeout(600);
  await snap(page, "05-levels-hub");
  await snapFull(page, "05-levels-hub");

  // ── Play L1 ──────────────────────────────────────────────────────────────
  console.log("→ /play/1");
  await page.locator('a[href="/play/1"]').click();
  await page.waitForURL(/\/play\/1$/);
  await page.waitForTimeout(1400);
  await snap(page, "06-play-l1");
  await snapFull(page, "06-play-l1");

  // First pair — open modal
  console.log("  → modal");
  const [v0, a0] = PAIRS_LVL1[0];
  await page.getByRole("button", { name: v0, exact: true }).click();
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: a0, exact: true }).click();
  await page.waitForTimeout(1000);
  await snap(page, "07-modal-success");

  // Finish the level for the GAGNÉ overlay
  await page.getByRole("button", { name: "Continuer", exact: true }).click();
  await page.waitForTimeout(500);
  for (const [v, a] of PAIRS_LVL1.slice(1)) {
    await page.getByRole("button", { name: v, exact: true }).click();
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: a, exact: true }).click();
    await page.waitForTimeout(700);
    await page.getByRole("button", { name: "Continuer", exact: true }).click();
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(1200);
  await snap(page, "08-gagne");

  // ── Leaderboard (empty state) ────────────────────────────────────────────
  console.log("→ /leaderboard (empty)");
  await page.evaluate(() => {
    window.localStorage.removeItem("stk-leaderboard-v1");
  });
  await page.goto(`${BASE}/leaderboard`);
  await page.waitForTimeout(1000);
  await snap(page, "09-leaderboard-empty");

  // ── Leaderboard (populated) — inject realistic entries to inspect layout ─
  await page.evaluate(() => {
    const entries = [
      { prenom: "Inès", score: 11800, temps: 266, erreurs: 3, date: "15/05/2026" },
      { prenom: "Camille", score: 12200, temps: 252, erreurs: 2, date: "15/05/2026" },
      { prenom: "Marwan", score: 11300, temps: 326, erreurs: 2, date: "14/05/2026" },
      { prenom: "Christ", score: 9640, temps: 345, erreurs: 5, date: "15/05/2026" },
    ];
    window.localStorage.setItem("stk-leaderboard-v1", JSON.stringify(entries));
    window.dispatchEvent(new Event("stk-leaderboard-changed"));
  });
  await page.waitForTimeout(1000);
  await snap(page, "10-leaderboard-populated");
  await snapFull(page, "10-leaderboard-populated");

  await browser.close();
  console.log("✓ mobile snaps saved");
})().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
