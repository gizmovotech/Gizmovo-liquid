import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProduct } from "@/lib/api";
import { formatMoney, savingsPercent, imgUrl } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import QuantityStepper from "@/components/QuantityStepper";
import ProductCard from "@/components/ProductCard";
import ReviewsBlock from "@/components/ReviewsBlock";
import FaqAccordion from "@/components/FaqAccordion";
import { FAQS } from "@/lib/faqs";
import { PageLoader, Spinner } from "@/components/Loaders";
import { Reveal } from "@/components/Reveal";
import {
  Truck, RotateCcw, ShieldCheck, Check, ShoppingBag, Zap, ChevronRight, Package,
} from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, addingId, cartId, refresh } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState({});
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    setQty(1);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        const initial = {};
        (p.variants || []).forEach((v) => (initial[v.name] = v.options[0]));
        setVariant(initial);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <PageLoader />;
  if (notFound || !product)
    return (
      <div className="container-gizmo py-24 text-center" data-testid="product-notfound">
        <h1 className="font-display text-3xl font-bold text-navy-900">Product not found</h1>
        <p className="mt-3 text-navy-900/60">It may have sold out or moved.</p>
        <Link to="/shop" className="btn-primary mt-6">Back to shop</Link>
      </div>
    );

  const saving = savingsPercent(product.price, product.compare_at_price);
  const soldOut = product.available === false;
  const variantLabel = Object.values(variant).join(" · ") || null;

  const handleAdd = ({ openDrawer = true } = {}) =>
    addItem(product, { variant: variantLabel, quantity: qty, openDrawer });

  const handleBuyNow = async () => {
    setBuying(true);
    await addItem(product, { variant: variantLabel, quantity: qty, openDrawer: false });
    await refresh();
    setBuying(false);
    navigate("/checkout");
  };

  const specs = product.specs || [];

  return (
    <div data-testid="product-detail" className="pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="container-gizmo pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-navy-900/50" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-navy-900">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/collections/${product.category_slug}`} className="hover:text-navy-900">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-navy-900">{product.name}</span>
        </nav>
      </div>

      {/* Main: gallery + purchase */}
      <section className="container-gizmo grid gap-8 py-6 lg:grid-cols-2 lg:gap-14 lg:py-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-navy-900/5">
            <img
              key={activeImg}
              src={imgUrl(product.images[activeImg], 1000)}
              alt={product.name}
              className="h-full w-full object-cover"
              data-testid="pdp-main-image"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  data-testid={`pdp-thumb-${i}`}
                  aria-label={`View image ${i + 1}`}
                  className={`h-20 w-20 overflow-hidden rounded-xl bg-white ring-2 transition-all ${
                    activeImg === i ? "ring-navy-900" : "ring-transparent hover:ring-navy-900/30"
                  }`}
                >
                  <img src={imgUrl(img, 160)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase panel */}
        <div className="max-w-lg">
          <div className="flex flex-wrap items-center gap-2">
            <p className="overline">{product.category}</p>
            {product.badge && (
              <span data-testid="pdp-badge" className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy-900">
                {product.badge}
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-navy-900/65">{product.short_benefit}</p>

          {/* Price */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-display text-3xl font-bold text-navy-900" data-testid="pdp-price">
              {formatMoney(product.price)}
            </span>
            {product.compare_at_price > product.price && (
              <>
                <span className="text-lg text-navy-900/40 line-through">
                  {formatMoney(product.compare_at_price)}
                </span>
                <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">
                  Save {saving}%
                </span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-sm text-navy-900/55">Free shipping · Taxes included</p>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-navy-900" data-testid="pdp-delivery">
            <Truck className="h-4 w-4 text-gold" />
            {soldOut ? "Currently out of stock" : "Ships in 24–48 hrs · Free delivery across India"}
          </p>

          {/* Variants */}
          {(product.variants || []).map((v) => (
            <div key={v.name} className="mt-6">
              <p className="text-sm font-semibold text-navy-900">{v.name}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVariant((prev) => ({ ...prev, [v.name]: opt }))}
                    data-testid={`variant-${v.name}-${opt}`}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      variant[v.name] === opt
                        ? "border-navy-900 bg-navy-900 text-cream"
                        : "border-navy-900/20 text-navy-900 hover:border-navy-900"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + actions */}
          <div className="mt-7 flex items-center gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold text-navy-900">Quantity</p>
              <QuantityStepper value={qty} onChange={setQty} max={5} testId="pdp-qty" />
            </div>
            <p className="mt-6 text-xs text-navy-900/45">Max 5 per order</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {soldOut ? (
              <div
                data-testid="pdp-sold-out"
                className="w-full rounded-full bg-navy-900/10 px-7 py-4 text-center text-base font-semibold text-navy-900/60"
              >
                Sold out — check back soon
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleAdd()}
                  disabled={addingId === product.id}
                  data-testid="pdp-add-to-cart"
                  className="btn-primary w-full text-base"
                >
                  {addingId === product.id ? (
                    <><Check className="h-5 w-5" /> Added to bag</>
                  ) : (
                    <><ShoppingBag className="h-5 w-5" /> Add to bag</>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={buying}
                  data-testid="pdp-buy-now"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-navy-900 bg-transparent px-7 py-3.5 text-base font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-cream disabled:opacity-50"
                >
                  {buying ? <Spinner /> : <Zap className="h-5 w-5" />} Buy it now
                </button>
              </>
            )}
          </div>

          {/* Trust row */}
          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-navy-900/10 bg-white p-4">
            {[
              { icon: Truck, label: "Free shipping", sub: "Across India" },
              { icon: RotateCcw, label: "7-day returns", sub: "No hassle" },
              { icon: ShieldCheck, label: "Secure pay", sub: "Encrypted" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5 text-center">
                <t.icon className="h-5 w-5 text-navy-900" strokeWidth={1.75} />
                <span className="text-xs font-semibold text-navy-900">{t.label}</span>
                <span className="text-[11px] text-navy-900/50">{t.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + benefits (navy) */}
      <section className="bg-navy-900 text-cream" data-testid="pdp-story">
        <div className="container-gizmo grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">The idea</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              What is it?
            </h2>
            <p className="mt-5 leading-relaxed text-cream/75">{product.description}</p>
            <p className="mt-4 leading-relaxed text-cream/75">{product.story}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Why you'll like it</p>
            <ul className="mt-5 space-y-3.5">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cream/10">
                    <Check className="h-3.5 w-3.5 text-gold" />
                  </span>
                  <span className="text-cream/85">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      {product.how_it_works?.length > 0 && (
        <section className="container-gizmo py-16 lg:py-20" data-testid="pdp-how">
          <Reveal>
            <p className="overline">Simple to use</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              How it works
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {product.how_it_works.map((step, i) => (
              <Reveal key={i} delay={i * 0.08} className="rounded-3xl border border-navy-900/10 bg-white p-7">
                <span className="font-display text-4xl font-bold text-navy-900/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 text-navy-900/75">{step}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Specs + what's included (beige) */}
      <section className="bg-beige py-16 lg:py-20" data-testid="pdp-specs">
        <div className="container-gizmo grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-900">Specifications</h2>
            <dl className="mt-6 divide-y divide-navy-900/10 border-t border-navy-900/10">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-4 py-3.5">
                  <dt className="text-sm text-navy-900/60">{s.label}</dt>
                  <dd className="text-sm font-semibold text-navy-900">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-900">What's in the box</h2>
            <ul className="mt-6 space-y-3">
              {product.whats_included.map((w) => (
                <li key={w} className="flex items-center gap-3 rounded-2xl border border-navy-900/10 bg-white px-4 py-3.5">
                  <Package className="h-5 w-5 shrink-0 text-navy-900/50" strokeWidth={1.75} />
                  <span className="text-sm text-navy-900/80">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reviews + FAQ */}
      <section className="container-gizmo grid gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <ReviewsBlock product={product} />
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Common questions</h2>
          <div className="mt-4">
            <FaqAccordion items={FAQS.slice(1, 6)} testId="pdp-faq" />
          </div>
        </div>
      </section>

      {/* Related */}
      {product.related_products?.length > 0 && (
        <section className="bg-beige py-16 lg:py-20" data-testid="pdp-related">
          <div className="container-gizmo">
            <p className="overline">Pairs well with</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Complete the setup
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {product.related_products.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-900/10 bg-cream/95 px-4 py-3 backdrop-blur-lg lg:hidden" data-testid="pdp-sticky-bar">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-navy-900/60">{product.name}</p>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-navy-900">{formatMoney(product.price)}</span>
              {product.compare_at_price > product.price && (
                <span className="text-xs text-navy-900/50 line-through">{formatMoney(product.compare_at_price)}</span>
              )}
            </div>
          </div>
          {soldOut ? (
            <span className="rounded-full bg-navy-900/10 px-6 py-3 text-sm font-semibold text-navy-900/60">Sold out</span>
          ) : (
            <button
              onClick={() => handleAdd()}
              disabled={addingId === product.id}
              data-testid="pdp-sticky-add"
              className="btn-primary flex-shrink-0"
            >
              {addingId === product.id ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingBag className="h-4 w-4" /> Add to bag</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
