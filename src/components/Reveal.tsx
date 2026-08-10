import { useReveal } from "@/hooks/use-reveal";
import type { ReactNode } from "react";

/** Wrapper que aplica o fade-in discreto ao entrar na viewport. */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    // @ts-expect-error — tag dinâmica simples
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
