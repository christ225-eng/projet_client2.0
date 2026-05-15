import type { NextConfig } from "next";

/**
 * STK Architecture — Apprendre du Vivant
 *
 * Kept minimal so production builds on Vercel mirror local builds. If a
 * dev warning about an "inferred workspace root" reappears (because a
 * lockfile higher up the filesystem is picked up), pass `turbopack.root`
 * as a string path — but do NOT use `__dirname` in this file: the config
 * loader's module format varies between local Node, Turbopack dev, and
 * Vercel's build container, so `__dirname` is not always defined.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
