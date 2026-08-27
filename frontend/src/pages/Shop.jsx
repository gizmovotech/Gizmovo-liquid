import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { getProducts, getCategories } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Loaders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A–Z" },
];

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterBest = searchParams.get("filter") === "best";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  const activeCat = category || "all";

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (activeCat !== "all") params.category = activeCat;
    if (filterBest) params.best_seller = true;
    getProducts(params)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCat, sort, filterBest]);

  const currentCat = useMemo(
    () => categories.find((c) => c.slug === activeCat),
    [categories, activeCat]
  );

  const heading = filterBest
    ? "Best Sellers"
    : currentCat
    ? currentCat.name
    : "All Products";
  const sub = filterBest
    ? "The pieces people keep coming back for."
    : currentCat
    ? currentCat.tagline
    : "Every genuinely-useful thing we make room for.";

  const selectCat = (slug) => {
    if (slug === "all") navigate("/shop");
    else navigate(`/collections/${slug}`);
  };

  return (
    <div data-testid="shop-page">
      {/* Header */}
      <section className="bg-beige">
        <div className="container-gizmo py-12 lg:py-16">
          <nav className="flex items-center gap-2 text-xs text-navy-900/50" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-900">Home</Link>
            <span>/</span>
            <span className="text-navy-900">{heading}</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            {heading}
          </h1>
          <p className="mt-3 max-w-md text-navy-900/60">{sub}</p>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-16 z-20 border-y border-navy-900/10 bg-cream/90 backdrop-blur-lg lg:top-[72px]">
        <div className="container-gizmo flex items-center gap-3 overflow-x-auto py-3 no-scrollbar">
          <button
            onClick={() => selectCat("all")}
            data-testid="filter-all"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCat === "all" && !filterBest
                ? "bg-navy-900 text-cream"
                : "border border-navy-900/15 text-navy-900/75 hover:border-navy-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => navigate("/shop?filter=best")}
            data-testid="filter-best"
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filterBest
                ? "bg-navy-900 text-cream"
                : "border border-navy-900/15 text-navy-900/75 hover:border-navy-900"
            }`}
          >
            Best Sellers
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => selectCat(c.slug)}
              data-testid={`filter-${c.slug}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCat === c.slug
                  ? "bg-navy-900 text-cream"
                  : "border border-navy-900/15 text-navy-900/75 hover:border-navy-900"
              }`}
            >
              {c.name}
            </button>
          ))}

          <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
            <SlidersHorizontal className="h-4 w-4 text-navy-900/50" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                data-testid="sort-select"
                className="h-9 w-[130px] rounded-full border-navy-900/15 bg-white text-sm sm:w-[170px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value} data-testid={`sort-${s.value}`}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="container-gizmo py-10 lg:py-14">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center" data-testid="shop-empty">
            <p className="font-display text-2xl font-semibold text-navy-900">
              Nothing here yet.
            </p>
            <p className="mt-2 text-navy-900/60">Try another category or browse everything.</p>
            <button onClick={() => selectCat("all")} className="btn-primary mt-6">
              View all products
            </button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-navy-900/50" data-testid="shop-count">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
