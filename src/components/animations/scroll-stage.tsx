import { cn } from "@/lib/utils";

/**
 * StageVariant preserved for type-compatibility.
 */
export type StageVariant = "rise" | "unfold" | "fade";

export interface ScrollStageProps {
  children: React.ReactNode;
  className?: string;
  variant?: StageVariant;
  distance?: number;
  stagger?: number;
  settle?: number;
  smoothing?: boolean;
}

/**
 * ScrollStage now renders standard, reliable DOM elements without
 * scroll-linked opacity hiding or transforms. Content is 100% visible immediately.
 */
export function ScrollStage({
  children,
  className,
}: ScrollStageProps) {
  return <div className={cn(className)}>{children}</div>;
}
