import { useState } from "react";
import { Link } from "react-router-dom";
import { sendContact } from "@/lib/api";
import { toast } from "sonner";
import { BRAND } from "@/lib/config";
import { Spinner } from "@/components/Loaders";
import { Mail, Instagram, Send } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await sendContact(form);
      setSent(true);
      toast.success("Message sent — we'll be in touch.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please email us directly.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="contact-page">
      <section className="bg-beige">
        <div className="container-gizmo py-14 lg:py-20">
          <nav className="flex items-center gap-2 text-xs text-navy-900/50" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-900">Home</Link>
            <span>/</span>
            <span className="text-navy-900">Contact</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-3 max-w-md text-navy-900/60">
            Questions about a product, an order, or just want to say hi? We read
            everything and reply fast.
          </p>
        </div>
      </section>

      <section className="container-gizmo grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-16 lg:py-20">
        {/* Form */}
        <div>
          {sent ? (
            <div className="rounded-3xl border border-navy-900/10 bg-white p-10 text-center" data-testid="contact-success">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy-900">
                <Send className="h-6 w-6 text-cream" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold text-navy-900">Message sent</h2>
              <p className="mt-2 text-navy-900/60">Thanks for reaching out — we'll reply to your email soon.</p>
              <button onClick={() => setSent(false)} className="btn-secondary mt-6">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5" data-testid="contact-form">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-navy-900" htmlFor="c-name">Name</label>
                  <input
                    id="c-name" required value={form.name} onChange={update("name")}
                    data-testid="contact-name"
                    className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-navy-900 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy-900" htmlFor="c-email">Email</label>
                  <input
                    id="c-email" type="email" required value={form.email} onChange={update("email")}
                    data-testid="contact-email"
                    className="mt-2 w-full rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-navy-900 focus:outline-none"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-navy-900" htmlFor="c-msg">Message</label>
                <textarea
                  id="c-msg" required rows={6} value={form.message} onChange={update("message")}
                  data-testid="contact-message"
                  className="mt-2 w-full resize-none rounded-2xl border border-navy-900/15 bg-white px-4 py-3 text-sm focus:border-navy-900 focus:outline-none"
                  placeholder="How can we help?"
                />
              </div>
              <button type="submit" disabled={busy} data-testid="contact-submit" className="btn-primary w-full sm:w-auto">
                {busy ? <Spinner /> : <Send className="h-4 w-4" />} Send message
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <aside className="space-y-4">
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="flex items-start gap-4 rounded-3xl border border-navy-900/10 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900/5">
              <Mail className="h-5 w-5 text-navy-900" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-900">Email us</p>
              <p className="mt-0.5 text-sm text-navy-900/60">{BRAND.supportEmail}</p>
            </div>
          </a>
          <a
            href={BRAND.instagram} target="_blank" rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-3xl border border-navy-900/10 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900/5">
              <Instagram className="h-5 w-5 text-navy-900" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-display font-semibold text-navy-900">DM us on Instagram</p>
              <p className="mt-0.5 text-sm text-navy-900/60">@gizmovo</p>
            </div>
          </a>
        </aside>
      </section>
    </div>
  );
}
