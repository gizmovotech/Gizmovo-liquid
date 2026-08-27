import { Star, PenLine } from "lucide-react";

// Reviews architecture — shows honest empty state until real reviews exist.
// When product.rating / review_count are populated (e.g. from Shopify reviews),
// this renders the real summary automatically.
export default function ReviewsBlock({ product }) {
  const hasReviews = product.review_count > 0 && product.rating;

  return (
    <div data-testid="reviews-block">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-navy-900">Reviews</h2>
      </div>

      {hasReviews ? (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-5 w-5 ${n <= Math.round(product.rating) ? "fill-gold text-gold" : "text-navy-900/20"}`}
              />
            ))}
          </div>
          <span className="text-sm text-navy-900/60">
            {product.rating.toFixed(1)} · {product.review_count} reviews
          </span>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-navy-900/20 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/5">
            <PenLine className="h-5 w-5 text-navy-900/50" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold text-navy-900">
            Be one of the first to review this.
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-navy-900/60">
            No reviews yet — real customer reviews will appear here once they roll in.
            We never fake ratings.
          </p>
        </div>
      )}
    </div>
  );
}
