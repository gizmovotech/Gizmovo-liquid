import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";

// Horizontal-scroll rail on mobile, grid on desktop.
export default function ProductRail({ overline, title, description, products, cta, ctaLabel = "View all", testId }) {
  if (!products || products.length === 0) return null;
  return (
    <section className="container-gizmo py-14 lg:py-20" data-testid={testId}>
      <div className="flex items-end justify-between gap-4">
        <div>
          {overline && <p className="overline">{overline}</p>}
          <h2 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-3 max-w-md text-navy-900/60">{description}</p>
          )}
        </div>
        {cta && (
          <Link
            to={cta}
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-navy-900 link-underline sm:flex"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Single render: horizontal snap-scroll on mobile, grid on desktop */}
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible lg:grid-cols-4">
        {products.map((p, i) => (
          <div key={p.slug} className="w-[62%] shrink-0 snap-start sm:w-auto sm:shrink">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>

      {cta && (
        <div className="mt-8 sm:hidden">
          <Link to={cta} className="btn-secondary w-full">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
}
