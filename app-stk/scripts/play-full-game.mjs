/**
 * Full E2E — plays the entire game (5 levels, 22 pairs), then verifies
 * the leaderboard renders the player's real persisted score. Runtime is
 * roughly 2 minutes; the browser stays visible so the flow can be watched.
 *
 *   node scripts/play-full-game.mjs
 *
 * Snapshots:
 *   13-leaderboard-empty.png         — fresh localStorage, empty state
 *   14-gagne-final.png               — GAGNÉ overlay after the last pair
 *   15-leaderboard-with-real-score.png — podium with the player entry
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STK_URL ?? "http://localhost:3000";
const SHOTS = "test-screenshots";

/** Exact labels from src/data/pairs.ts — `getByRole({ exact: true })` matches them. */
const PAIRS = {
  1: [
    ["Fruits de bardane", "Velcro"],
    ["Gekko", "Adhésif Geckskin"],
    ["Peau du requin", "Combinaisons de natation"],
    ["Martin-pêcheur", "TGV japonais"],
  ],
  2: [
    ["Trompe du moustique", "Aiguille médicale indolore"],
    ["Termitière", "Eastgate Building"],
    ["Lucioles", "Lampes LED"],
    ["Nageoires de baleines à bosse", "Éoliennes"],
  ],
  3: [
    ["Nautile", "Turboréacteurs"],
    ["Papillon Greta oto", "Verres anti-reflet"],
    ["Effet lotus", "Surface hydrophobe"],
    ["Os humain (fémur)", "Tour Eiffel"],
  ],
  4: [
    ["Moule", "Colle forte bio-inspirée"],
    ["Coléoptère de Namibie", "Filets capteurs de rosée"],
    ["Corail", "Ciment neutre en carbone"],
    ["Aile de papillon morpho", "Panneaux solaires"],
    ["Manchot", "District 11"],
  ],
  5: [
    ["Corbeille de Vénus", "30 St Mary Axe"],
    ["Cicatrice", "Béton cicatrisant"],
    ["Zèbre", "Camouflage architectural"],
    ["Champignon", "Maggie's Centre"],
    ["Orchidée", "Gardens by the Bay"],
  ],
};

const snap = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });

(async () => {
  await mkdir(SHOTS, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    slowMo: 75,
    args: ["--window-position=120,60"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "fr-FR",
  });
  const page = await ctx.newPage();

  page.on("pageerror", (e) => console.error("[pageerror]", e.message));

  // Reset persisted scores so the run is reproducible
  console.log("→ clearing localStorage");
  await page.goto(BASE);
  await page.evaluate(() => {
    try {
      window.localStorage.removeItem("stk-leaderboard-v1");
    } catch {
      /* noop */
    }
  });

  // Empty state — must show "Aucun score pour le moment"
  console.log("→ /leaderboard (empty state)");
  await page.goto(`${BASE}/leaderboard`);
  await page.waitForTimeout(1200);
  await snap(page, "13-leaderboard-empty");

  // Onboarding
  console.log("→ /pseudo");
  await page.goto(`${BASE}/pseudo`);
  await page.getByLabel("Entrez votre pseudo").fill("Christ");
  await page.getByLabel("Entrez votre pseudo").press("Enter");
  await page.waitForURL(/\/intro$/);
  for (let i = 0; i < 3; i++) {
    await page
      .locator(
        'button[aria-label="Étape suivante"], button[aria-label="Commencer le jeu"]',
      )
      .first()
      .click();
    await page.waitForTimeout(160);
  }
  await page.waitForURL(/\/levels$/);

  // Play every level
  for (let level = 1; level <= 5; level++) {
    console.log(`→ Level ${level}`);
    if (level === 1) {
      await page.locator('a[href="/play/1"]').click();
    }
    await page.waitForURL(new RegExp(`/play/${level}$`));
    await page.waitForTimeout(800);

    const pairs = PAIRS[level];
    for (const [vivant, application] of pairs) {
      await page.getByRole("button", { name: vivant, exact: true }).click();
      await page.waitForTimeout(300);
      await page
        .getByRole("button", { name: application, exact: true })
        .click();
      await page.waitForTimeout(700);
      await page
        .getByRole("button", { name: "Continuer", exact: true })
        .click();
      await page.waitForTimeout(450);
    }

    // Wait for GAGNÉ overlay to settle
    await page.waitForTimeout(1100);

    if (level === 5) {
      await snap(page, "14-gagne-final");
      await page
        .getByRole("button", { name: "Voir le classement", exact: true })
        .click();
    } else {
      await page
        .getByRole("button", {
          name: "Passer au niveau suivant",
          exact: true,
        })
        .click();
    }
  }

  // Final leaderboard, populated with the real player entry
  console.log("→ /leaderboard (real score)");
  await page.waitForURL(/\/leaderboard$/);
  await page.waitForTimeout(1800);
  await snap(page, "15-leaderboard-with-real-score");

  // Read back from localStorage to prove persistence
  const stored = await page.evaluate(() =>
    window.localStorage.getItem("stk-leaderboard-v1"),
  );
  console.log("localStorage contents:");
  console.log(stored);

  await page.waitForTimeout(800);
  await browser.close();
  console.log("✓ done");
})().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
