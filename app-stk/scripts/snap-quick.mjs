/**
 * Quick headless smoke captures used to verify the UX/UI overhaul:
 *   • mobile 390×844 (iPhone 13): landing, pseudo, intro, level 1, modal-wrong, modal-right, level 4
 *   • desktop 1440×900: landing, gameplay, modal
 */

import { chromium, devices } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.STK_URL ?? "http://localhost:3000";
const SHOTS = "test-screenshots";

const snap = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `qa-${name}.png`), fullPage: false });
const snapFull = (page, name) =>
  page.screenshot({ path: path.join(SHOTS, `qa-${name}-full.png`), fullPage: true });

const PAIRS_LVL1 = [
  ["Fruits de bardane", "Velcro"],
  ["Gekko", "Adhésif Geckskin"],
  ["Peau du requin", "Combinaisons de natation"],
  ["Martin-pêcheur", "TGV japonais"],
];

(async () => {
  await mkdir(SHOTS, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ── Mobile run (iPhone 13) ────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("[mobile pageerror]", e.message));

    await page.goto(BASE);
    await page.evaluate(() => {
      try { window.localStorage.removeItem("stk-leaderboard-v1"); } catch {}
    });

    console.log("→ mobile /");
    await page.goto(BASE);
    await page.waitForTimeout(900);
    await snap(page, "m-01-landing");

    console.log("→ mobile /pseudo");
    await page.goto(`${BASE}/pseudo`);
    await page.waitForTimeout(900);
    await snap(page, "m-02-pseudo");

    console.log("→ mobile filled");
    await page.getByLabel("Entrez votre pseudo").fill("Christ");
    await snap(page, "m-02b-pseudo-filled");
    await page.getByLabel("Entrez votre pseudo").press("Enter");

    console.log("→ mobile /intro");
    await page.waitForURL(/\/intro$/);
    await page.waitForTimeout(700);
    await snap(page, "m-03-intro");

    // navigate to level 1
    await page.locator('button[aria-label="Étape suivante"]').first().click();
    await page.waitForTimeout(450);
    await page.locator('button[aria-label="Étape suivante"]').first().click();
    await page.waitForTimeout(450);
    await page.locator('button[aria-label="Commencer le jeu"]').first().click();
    await page.waitForURL(/\/levels$/);
    await page.waitForTimeout(550);
    await snap(page, "m-04-levels");

    console.log("→ mobile /play/1");
    await page.locator('a[href="/play/1"]').click();
    await page.waitForURL(/\/play\/1$/);
    await page.waitForTimeout(1400);
    await snap(page, "m-05-play-l1");
    await snapFull(page, "m-05-play-l1");

    // Wrong pair modal
    console.log("→ mobile modal wrong");
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(280);
    await page.getByRole("button", { name: PAIRS_LVL1[1][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "m-06-modal-wrong");

    // Retry — then correct pair
    await page.getByRole("button", { name: "Réessayer", exact: true }).click();
    await page.waitForTimeout(550);
    console.log("→ mobile modal right");
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(220);
    await page.getByRole("button", { name: PAIRS_LVL1[0][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "m-07-modal-right");

    // Go to play/4 directly to validate the 5-card 2-col layout
    await ctx.close();
  }

  // mobile level 4 — set completed levels in localStorage and visit directly
  {
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/play/4`);
    await page.waitForTimeout(1400);
    await snap(page, "m-08-play-l4");
    await snapFull(page, "m-08-play-l4");
    await ctx.close();
  }

  // ── Desktop run (1440×900) ───────────────────────────────────────────────
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "fr-FR",
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("[desktop pageerror]", e.message));

    console.log("→ desktop /");
    await page.goto(BASE);
    await page.waitForTimeout(900);
    await snap(page, "d-01-landing");

    console.log("→ desktop /play/1");
    await page.goto(`${BASE}/play/1`);
    await page.waitForTimeout(1400);
    await snap(page, "d-02-play-l1");

    // wrong pair modal
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(220);
    await page.getByRole("button", { name: PAIRS_LVL1[1][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "d-03-modal-wrong");

    await page.getByRole("button", { name: "Réessayer", exact: true }).click();
    await page.waitForTimeout(450);
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(220);
    await page.getByRole("button", { name: PAIRS_LVL1[0][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "d-04-modal-right");

    await ctx.close();
  }

  await browser.close();
  console.log("✓ quick QA snaps saved");
})().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
