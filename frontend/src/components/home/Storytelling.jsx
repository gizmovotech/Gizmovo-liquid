import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const STORY_IMG =
  "https://images.unsplash.com/photo-1633381638729-27f730955c23?crop=entropy&cs=srgb&fm=jpg&q=90&w=1200";

// Navy storytelling break — "understand" moment in the journey.
export default function Storytelling() {
  return (
    <section className="bg-navy-900 text-cream" data-testid="storytelling">
      <div className="container-gizmo grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square overflow-hidden rounded-3xl lg:aspect-[4/5]"
        >
          <img src={STORY_IMG} alt="A charger sitting neatly on a desk" loading="lazy" className="h-full w-full object-cover" />
        </motion.div>

        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Why it clicks</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Things you didn't know you needed.
          </h2>
          <p className="mt-5 leading-relaxed text-cream/70">
            We don't chase trends or fill a warehouse. We look for the small,
            clever products that quietly fix an everyday annoyance — the tangled
            cables, the messy desk, the dead phone at 4pm.
          </p>
          <p className="mt-4 leading-relaxed text-cream/70">
            If it doesn't earn its place in your day, it doesn't make the shelf.
            Simple. Useful. Done.
          </p>
          <Link to="/about" className="mt-8 inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-navy-900">
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
