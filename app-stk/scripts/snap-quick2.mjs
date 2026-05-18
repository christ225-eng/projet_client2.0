/**
 * Second-pass smoke: desktop screens + mobile level 4 (5-card layout).
 */

import { chromium, devices } from "playwright";
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
];

(async () => {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "fr-FR",
    });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("[d pageerror]", e.message));

    console.log("→ desktop /");
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    await snap(page, "d-01-landing");

    console.log("→ desktop /play/1");
    await page.goto(`${BASE}/play/1`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    await snap(page, "d-02-play-l1");

    console.log("→ desktop modal wrong");
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(280);
    await page.getByRole("button", { name: PAIRS_LVL1[1][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "d-03-modal-wrong");

    await page.getByRole("button", { name: "Réessayer", exact: true }).click();
    await page.waitForTimeout(500);

    console.log("→ desktop modal right");
    await page.getByRole("button", { name: PAIRS_LVL1[0][0], exact: true }).click();
    await page.waitForTimeout(220);
    await page.getByRole("button", { name: PAIRS_LVL1[0][1], exact: true }).click();
    await page.waitForTimeout(900);
    await snap(page, "d-04-modal-right");

    await ctx.close();
  }

  // Mobile /play/4 — 5-card layout
  {
    const ctx = await browser.newContext({ ...devices["iPhone 13"], locale: "fr-FR" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.error("[m4 pageerror]", e.message));

    console.log("→ mobile /play/4");
    await page.goto(`${BASE}/play/4`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    await snap(page, "m-08-play-l4");
    await snapFull(page, "m-08-play-l4");

    await ctx.close();
  }

  await browser.close();
  console.log("✓ second pass saved");
})().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
