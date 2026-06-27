"use client";

// Small helper that merges a hover style over a base style on pointer
// enter/leave — the React equivalent of the prototype's `style-hover`.
import { useState, type CSSProperties, type ReactNode } from "react";

type HoverDivProps = {
  base: CSSProperties;
  hover: CSSProperties;
  onClick?: () => void;
  children: ReactNode;
  title?: string;
};

export default function HoverDiv({
  base,
  hover,
  onClick,
  children,
  title,
}: HoverDivProps) {
  const [on, setOn] = useState(false);
  return (
    <div
      title={title}
      onClick={onClick}
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      style={on ? { ...base, ...hover } : base}
    >
      {children}
    </div>
  );
}
