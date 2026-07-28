"use client";

import Link from "next/link";
import { Agent } from "@/lib/types";
import { avatarUrl, getInitials } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
  featured?: boolean;
  index?: number;
  skillCount?: number;
}

export default function AgentCard({
  agent,
  featured = false,
  index = 0,
  skillCount = 0,
}: AgentCardProps) {
  const url = avatarUrl(agent.avatar);

  return (
    <Link
      href={`/agents/${agent.id}`}
      className={`card block p-6 animate-fade-in-up ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`flex ${featured ? "flex-col gap-6" : "items-start gap-4"}`}>
        <div className={`avatar-ring shrink-0 ${featured ? "w-20 h-20" : "w-14 h-14"}`}>
          <div
            className={`w-full h-full rounded-full bg-bg-elevated flex items-center justify-center overflow-hidden ${
              featured ? "text-2xl" : "text-lg"
            } font-display font-bold text-accent`}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(agent.name)
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
              <h3
                className={`font-display font-bold truncate ${
                  featured ? "text-2xl" : "text-lg"
                }`}
              >
                {agent.name}
              </h3>
              {(agent.cargo ?? "") && (
                <span
                  className={`text-accent shrink-0 ${
                    featured ? "text-base" : "text-sm"
                  } font-medium`}
                >
                  · {agent.cargo}
                </span>
              )}
            </div>
            {skillCount > 0 && (
              <span className="badge shrink-0">
                {skillCount} skill{skillCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {agent.description && (
            <p
              className={`text-text-muted mt-2 line-clamp-2 ${
                featured ? "text-base" : "text-sm"
              }`}
            >
              {agent.description}
            </p>
          )}

          {(agent.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {agent.tags.map((tag) => (
                <span key={tag} className="tag-chip tag-chip-static">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {featured && agent.prompt && (
            <p className="text-sm text-text-muted/70 mt-3 line-clamp-3 font-mono">
              {agent.prompt.slice(0, 150)}...
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
