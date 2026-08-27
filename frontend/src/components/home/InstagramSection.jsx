import { Instagram, ArrowUpRight } from "lucide-react";
import { BRAND } from "@/lib/config";
import { Reveal } from "@/components/Reveal";
import { imgUrl } from "@/lib/format";

// Placeholder tiles — wire real posts / Shopify Instagram feed here later.
const TILES = [
  "https://images.unsplash.com/photo-1784805576223-65971a7f31c9?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1694590562605-f5618235f84a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1587522384446-64daf3e2689a?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
  "https://images.unsplash.com/photo-1694590562484-458e40d7f087?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
];

export default function InstagramSection() {
  return (
    <section className="bg-cream py-14 lg:py-20" data-testid="instagram-section">
      <div className="container-gizmo">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="overline">In the wild</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Gizmovo, in real life.
            </h2>
            <p className="mt-3 max-w-md text-navy-900/60">
              Tag <span className="font-semibold text-navy-900">@gizmovo</span> to
              be featured. We love seeing where our little upgrades end up.
            </p>
          </div>
          <a
            href={BRAND.instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="instagram-follow-btn"
            className="btn-secondary"
          >
            <Instagram className="h-4 w-4" /> Follow along
          </a>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {TILES.map((src, i) => (
            <a
              key={i}
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl bg-navy-900"
              aria-label="View on Instagram"
            >
              <img
                src={imgUrl(src, 500)}
                alt="Gizmovo community"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-navy-900/0 transition-colors duration-300 group-hover:bg-navy-900/40">
                <Instagram className="h-6 w-6 text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
