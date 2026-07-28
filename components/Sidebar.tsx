import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "@/components/LogoutButton";
import TagFilter from "@/components/TagFilter";

interface SidebarProps {
  tags: string[];
}

export default function Sidebar({ tags }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-bg-elevated/50 backdrop-blur-sm shrink-0">
      <div className="p-6 border-b border-border">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/30 group-hover:bg-accent/25 transition-colors">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">
              My Agents
            </h1>
            <p className="text-xs text-text-muted">Command Deck</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text hover:bg-bg-hover transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Galeria
        </Link>
        <Link
          href="/agents/new"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
          Novo Agente
        </Link>

        {tags.length > 0 && (
          <div className="pt-4 mt-2 border-t border-border">
            <Suspense fallback={null}>
              <TagFilter tags={tags} variant="sidebar" />
            </Suspense>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <LogoutButton />
        <p className="text-xs text-text-muted text-center pt-1">
          Agentes de IA locais
        </p>
      </div>
    </aside>
  );
}
