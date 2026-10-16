import { createElement } from "react";

interface SplitWordsProps {
  text: string;
  className?: string;
  headingLevel?: "h1" | "h2";
}

/**
 * Splits a hero headline into words that rise one by one (kit §12 motion).
 * The full string stays available to assistive tech through aria-label.
 */
export function SplitWords({ text, className, headingLevel = "h1" }: SplitWordsProps) {
  const words = text.trim().split(/\s+/);
  return createElement(
    headingLevel,
    { className },
    words.map((word, index) => (
      <span className="w" aria-hidden="true" key={`${word}-${index}`}>
        <span style={{ "--i": index } as React.CSSProperties}>{word}</span>
        {index < words.length - 1 ? " " : ""}
      </span>
    )),
    <span className="sr-only" key="sr">
      {text}
    </span>,
  );
}
