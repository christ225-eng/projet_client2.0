import Image from "next/image";

/**
 * Persistent organic background — the visual anchor of the whole experience.
 * Image: projet_client2.0/Maquettes/Background color du jeu.jpeg (copied to
 * /public/images/background/organic.jpeg as part of asset setup).
 *
 * Renders as a fixed full-viewport layer behind every page so transitions
 * between routes never break the immersion.
 *
 * `priority` is on because this is the LCP for every screen.
 */
export function OrganicBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <Image
        src="/images/background/organic.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Soft ivory wash so foreground content stays legible regardless of bg variation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(246,241,230,0.35)_0%,rgba(246,241,230,0.05)_60%)]" />
    </div>
  );
}
