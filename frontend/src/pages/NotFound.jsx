import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-gizmo flex min-h-[70vh] flex-col items-center justify-center py-20 text-center" data-testid="notfound-page">
      <p className="font-display text-8xl font-bold text-navy-900/15">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
        This page wandered off.
      </h1>
      <p className="mt-3 max-w-sm text-navy-900/60">
        The page you're looking for doesn't exist — but plenty of useful things do.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary"><Home className="h-4 w-4" /> Back home</Link>
        <Link to="/shop" className="btn-secondary"><Search className="h-4 w-4" /> Browse shop</Link>
      </div>
    </div>
  );
}
