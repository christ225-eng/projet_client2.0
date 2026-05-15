import type { NextConfig } from "next";
import path from "node:path";

/**
 * STK Architecture — Apprendre du Vivant
 *
 * `turbopack.root` pins Turbopack to this project so the lockfile in
 * C:\Users\HP doesn't get picked up as a "higher" workspace root.
 */
const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
