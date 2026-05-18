import path from "node:path";
import type { NextConfig } from "next";

/**
 * STK Architecture — Apprendre du Vivant
 *
 * `turbopack.root` is pinned to this directory so Next never infers a
 * higher workspace root from a stray lockfile in the user's home folder.
 * That misdetection was the source of the "inferred your workspace root"
 * warning and could leave Turbopack scanning unrelated trees, which in
 * turn destabilises the static-page worker pool (Jest worker child
 * process exceptions) on Windows.
 *
 * We use `path.resolve("./")` instead of `__dirname` because the config
 * loader's module format varies between local Node, Turbopack dev, and
 * Vercel's build container, where `__dirname` is not always defined.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("./"),
  },
  images: {
    qualities: [75, 92],
  },
};

export default nextConfig;
