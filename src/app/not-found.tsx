import { VerolaMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 opacity-70 blur-[70px]"
          style={{
            background:
              "radial-gradient(38% 55% at 22% 30%, rgba(34,193,240,0.28), transparent 70%), radial-gradient(36% 50% at 78% 62%, rgba(255,46,147,0.20), transparent 72%)",
          }}
        />
      </div>

      <div className="text-center max-w-xl">
        <VerolaMark className="w-20 h-20 mx-auto opacity-90" />

        <p
          className="mt-8 font-display font-extrabold leading-none tracking-[-0.05em] aurora-text"
          style={{ fontSize: "clamp(5.5rem, 22vw, 13rem)" }}
        >
          404
        </p>

        <h1 className="mt-2 font-display font-bold text-2xl md:text-3xl text-navy">
          هذه الصفحة خرجت من الطباعة.
        </h1>
        <p className="mt-2 text-ink-muted">Cette page n&apos;est pas encore imprimée.</p>
        <p className="mt-1 text-sm text-ink-faint">
          This page is not printed yet.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full aurora-bg text-white px-7 py-3.5 font-semibold shadow-[0_22px_48px_-18px_rgba(11,99,214,0.85)] hover:brightness-110 transition"
          >
            العودة إلى VEROLA
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 12h16m0 0-6-6m6 6-6 6" />
            </svg>
          </a>
          <a
            href="/customize"
            className="inline-flex items-center gap-2 rounded-full border border-brand/25 px-7 py-3.5 font-semibold text-brand hover:border-brand transition"
          >
            Print customizer
          </a>
        </div>
      </div>
    </div>
  );
}
