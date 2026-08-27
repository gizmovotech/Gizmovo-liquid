import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

// Editorial bento grid of categories.
export default function CategoryBento({ categories }) {
  if (!categories || categories.length === 0) return null;
  const [first, ...rest] = categories;

  const Card = ({ cat, large }) => (
    <Link
      to={`/collections/${cat.slug}`}
      data-testid={`category-card-${cat.slug}`}
      className={`group relative overflow-hidden rounded-3xl bg-navy-900 ${
        large ? "row-span-2 min-h-[320px] lg:min-h-full" : "min-h-[180px]"
      }`}
    >
      <img
        src={cat.image}
        alt={cat.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/20 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-5 lg:p-6">
        <h3 className={`font-display font-bold text-cream ${large ? "text-2xl lg:text-3xl" : "text-lg"}`}>
          {cat.name}
        </h3>
        {large && <p className="mt-1 max-w-xs text-sm text-cream/75">{cat.tagline}</p>}
        <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-cream/90">
          Shop {cat.name}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );

  return (
    <section className="bg-beige py-14 lg:py-20" data-testid="category-bento">
      <div className="container-gizmo">
        <Reveal>
          <p className="overline">Shop by category</p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Find your kind of useful.
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <Card cat={first} large />
          {rest.slice(0, 4).map((c) => (
            <Card key={c.slug} cat={c} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
