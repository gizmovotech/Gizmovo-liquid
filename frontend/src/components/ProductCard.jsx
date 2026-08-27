import { Link } from "react-router-dom";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatMoney, savingsPercent, imgUrl } from "@/lib/format";

export default function ProductCard({ product, index = 0 }) {
  const { addItem, addingId } = useCart();
  const hasSecond = product.images && product.images.length > 1;
  const saving = savingsPercent(product.price, product.compare_at_price);
  const isAdding = addingId === product.id;
  const soldOut = product.available === false;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem(product, { openDrawer: true });
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group flex h-full flex-col"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/5">
        <img
          src={imgUrl(product.images[0], 640)}
          alt={product.name}
          loading={index < 4 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.04] ${
            hasSecond ? "group-hover:opacity-0" : ""
          } ${soldOut ? "opacity-70 grayscale-[35%]" : ""}`}
        />
        {hasSecond && !soldOut && (
          <img
            src={imgUrl(product.images[1], 640)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
          />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-navy-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream">
              Sold out
            </span>
          ) : (
            <>
              {product.badge && (
                <span
                  data-testid={`badge-${product.slug}`}
                  className="rounded-full bg-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy-900"
                >
                  {product.badge}
                </span>
              )}
              {saving > 0 && (
                <span
                  data-testid={`save-badge-${product.slug}`}
                  className="rounded-full bg-navy-900 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-cream"
                >
                  Save {saving}%
                </span>
              )}
            </>
          )}
        </div>

        {/* Quick add / sold out */}
        {soldOut ? (
          <span
            data-testid={`soldout-${product.slug}`}
            className="absolute bottom-3 right-3 rounded-full bg-cream/95 px-4 py-2.5 text-sm font-semibold text-navy-900/60 shadow-lg backdrop-blur"
          >
            Out of stock
          </span>
        ) : (
          <button
            onClick={quickAdd}
            disabled={isAdding}
            data-testid={`quick-add-${product.slug}`}
            aria-label={`Add ${product.name} to bag`}
            className="absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full bg-cream/95 px-4 text-sm font-semibold text-navy-900 shadow-lg backdrop-blur transition-[transform,opacity] duration-300 hover:bg-navy-900 hover:text-cream md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            {isAdding ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="hidden sm:inline">{isAdding ? "Added" : "Quick add"}</span>
          </button>
        )}
      </div>

      <div className="mt-3.5 flex flex-1 flex-col">
        <p className="overline">{product.category}</p>
        <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug text-navy-900">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-navy-900/60">
          {product.tagline}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-2.5">
          <span className="font-display text-base font-bold text-navy-900">
            {formatMoney(product.price)}
          </span>
          {product.compare_at_price > product.price && (
            <span className="text-sm text-navy-900/50 line-through">
              {formatMoney(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
