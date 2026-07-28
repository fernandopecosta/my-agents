import Link from "next/link";

export default function MobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-bg-elevated/80 backdrop-blur-sm sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="font-display font-bold">My Agents</span>
      </Link>
      <Link href="/agents/new" className="btn-primary text-sm py-2 px-3">
        + Novo
      </Link>
    </header>
  );
}
