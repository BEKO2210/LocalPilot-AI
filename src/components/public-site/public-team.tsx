import { User } from "lucide-react";
import { PublicSection } from "./public-section";
import type { TeamMember } from "@/types/business";

type PublicTeamProps = {
  members: readonly TeamMember[];
};

export function PublicTeam({ members }: PublicTeamProps) {
  if (members.length === 0) return null;

  const sorted = [...members].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <PublicSection
      id="team"
      eyebrow="Team"
      title="Wer wartet auf Sie."
    >
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((member) => (
          <article
            key={member.id}
            className="rounded-theme-card border p-5"
            style={{
              borderColor: "rgb(var(--theme-border))",
              backgroundColor: "rgb(var(--theme-background))",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: "rgb(var(--theme-muted))",
                  color: "rgb(var(--theme-muted-fg))",
                }}
              >
                <User className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="lp-theme-heading text-base">{member.name}</h3>
                <p
                  className="text-xs"
                  style={{ color: "rgb(var(--theme-muted-fg))" }}
                >
                  {member.role}
                </p>
              </div>
            </div>
            {member.bio && (
              <p
                className="mt-3 text-sm"
                style={{ color: "rgb(var(--theme-muted-fg))" }}
              >
                {member.bio}
              </p>
            )}
          </article>
        ))}
      </div>
    </PublicSection>
  );
}
