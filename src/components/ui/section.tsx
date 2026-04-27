import { cn } from "@/lib/cn";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  id?: string;
  as?: "section" | "div";
  bg?: "default" | "muted" | "brand";
};

const bgMap: Record<NonNullable<SectionProps["bg"]>, string> = {
  default: "bg-white",
  muted: "bg-ink-50",
  brand: "bg-brand-950 text-white",
};

export function Section({
  className,
  bg = "default",
  as = "section",
  ...props
}: SectionProps) {
  const Tag = as;
  return <Tag className={cn("lp-section", bgMap[bg], className)} {...props} />;
}
