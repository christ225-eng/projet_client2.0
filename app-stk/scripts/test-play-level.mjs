/**
 * E2E smoke test — walks a fresh player through Level 1 of "Apprendre du
 * Vivant" using Playwright. The browser runs visible (headless: false) so
 * the flow can be watched live; screenshots land in `test-screenshots/`.
 *
 *   node scripts/test-play-level.mjs
 *
 * Pre-requisites:
 *   • dev server up at http://localhost:3000 (npm run dev)
 *   • playwright installed (already in devDependencies)
 *   • chromium downloaded (npx playwright install chromium)
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STK_URL ?? "http://localhost:3000";
const SHOTS = "test-screenshots";

/** Pair order from src/data/pairs.ts — Level 1, 4 pairs. */
const PAIRS_LVL1 = [
  ["Fruits de bardane", "Velcro"],
  ["Gekko", "Adhésif Geckskin"],
  ["Peau du requin", "Combinaisons de natation"],
  ["Martin-pêcheur", "TGV japonais"],
];

const snap = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });

(async () => {
  await mkdir(SHOTS, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 280,
    args: ["--window-position=120,60"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  });
  const page = await context.newPage();

  // Surface browser-side errors during the run
  page.on("pageerror", (e) => console.error("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.error("[console.error]", m.text());
  });

  // ── 1. Pseudo screen ─────────────────────────────────────────────────────
  console.log("→ /pseudo");
  await page.goto(`${BASE}/pseudo`);
  await page.waitForLoadState("networkidle");
  await snap(page, "01-pseudo-empty");

  const pseudoInput = page.getByLabel("Entrez votre pseudo");
  await pseudoInput.fill("TestPlayer");
  await snap(page, "02-pseudo-filled");
  await pseudoInput.press("Enter");

  // ── 2. Intro — 3 steps ───────────────────────────────────────────────────
  console.log("→ /intro");
  await page.waitForURL(/\/intro$/);
  await page.waitForTimeout(800);
  await snap(page, "03-intro-step1");

  for (let step = 1; step <= 3; step++) {
    const arrow = page
      .locator(
        'button[aria-label="Étape suivante"], button[aria-label="Commencer le jeu"]',
      )
      .first();
    await arrow.click();
    await page.waitForTimeout(800);
    if (step < 3) await snap(page, `04-intro-step${step + 1}`);
  }

  // ── 3. Hub des niveaux ───────────────────────────────────────────────────
  console.log("→ /levels");
  await page.waitForURL(/\/levels$/);
  await page.waitForTimeout(600);
  await snap(page, "05-levels-hub");

  // ── 4. Play level 1 ──────────────────────────────────────────────────────
  console.log("→ /play/1");
  await page.locator('a[href="/play/1"]').click();
  await page.waitForURL(/\/play\/1$/);
  await page.waitForTimeout(1500); // give cards & images time to settle
  await snap(page, "06-play-fresh");

  for (let i = 0; i < PAIRS_LVL1.length; i++) {
    const [vivant, application] = PAIRS_LVL1[i];
    console.log(`  pair ${i + 1}/4 — ${vivant} ↔ ${application}`);

    await page.getByRole("button", { name: vivant, exact: true }).click();
    await page.waitForTimeout(350);
    await page.getByRole("button", { name: application, exact: true }).click();
    await page.waitForTimeout(900);

    await snap(
      page,
      `07-pair${i + 1}-modal-${vivant.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "")}`,
    );

    // Modal "Continuer" for a correct pair
    await page.getByRole("button", { name: "Continuer", exact: true }).click();
    await page.waitForTimeout(700);
  }

  // ── 5. GAGNÉ screen ──────────────────────────────────────────────────────
  console.log("→ GAGNÉ !!");
  await page.waitForTimeout(1500);
  await snap(page, "08-gagne");

  // ── 6. Transition to Level 2 ─────────────────────────────────────────────
  const nextBtn = page.getByRole("button", {
    name: "Passer au niveau suivant",
    exact: true,
  });
  if ((await nextBtn.count()) > 0) {
    await nextBtn.click();
    await page.waitForURL(/\/play\/2$/, { timeout: 5000 });
    await page.waitForTimeout(1200);
    await snap(page, "09-play-level2");
    console.log("→ Level 2 reached");
  }

  await page.waitForTimeout(1200);
  await browser.close();
  console.log("✓ flow completed");
})().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
