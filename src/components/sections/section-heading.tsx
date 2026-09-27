import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="font-mono text-[0.65rem] tracking-[0.2em] text-brand uppercase">
        {eyebrow}
      </p>
      <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
