// app/lib/archetypeIcons.tsx
"use client";

import type { ReactNode, ReactElement } from "react";

type IconProps = { size?: number };

function Wrap({
  children,
  size = 44,
}: {
  children: ReactNode;
  size?: number;
}): ReactElement {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background:
          "linear-gradient(135deg, rgba(59,130,246,0.14), rgba(14,165,233,0.10))",
        border: "1px solid rgba(59,130,246,0.22)",
        display: "grid",
        placeItems: "center",
      }}
    >
      {children}
    </div>
  );
}

function Glyph({ d }: { d: string }): ReactElement {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d={d}
        stroke="#0f172a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export const ARCHETYPE_ICON_MAP: Record<
  string,
  (p?: IconProps) => ReactElement
> = {
  CLEAN_ENGINEER: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 7h16M7 7v14m10-14v14M6 21h12" />
    </Wrap>
  ),
  COZY_NESTER: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 12l8-7 8 7v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8z" />
    </Wrap>
  ),
  CREATIVE_SPRINTER: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 20l7-7m-5-5l5 5m3-9l6 6M14 4l2 2" />
    </Wrap>
  ),
  MINIMAL_MONK: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M6 12h12M8 7h8M9 17h6" />
    </Wrap>
  ),
  BOOK_FORTRESS: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M6 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2z" />
    </Wrap>
  ),
  GAMER_DEN: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M7 15l-2 2m12-2l2 2M8 13h2m4 0h2M9 10h6" />
    </Wrap>
  ),
  PLANT_GUARDIAN: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M12 22v-8m0 0c-3 0-6-2-7-6 4 1 7 3 7 6zm0 0c3 0 6-2 7-6-4 1-7 3-7 6z" />
    </Wrap>
  ),
  COLLECTOR_GALLERY: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 7h6l2-2h8v14H4V7z" />
    </Wrap>
  ),
  NIGHT_OWL: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M21 12.5A7.5 7.5 0 1 1 11.5 3a6 6 0 0 0 9.5 9.5z" />
    </Wrap>
  ),
  ROUTINE_CAPTAIN: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M7 4v4M17 4v4M5 10h14M6 14h6M6 18h10" />
    </Wrap>
  ),
  CHAOS_WIZARD: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0zM12 9v6" />
    </Wrap>
  ),
  SCATTERED_SPARK: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M12 2l1.5 5L19 9l-5.5 2L12 16l-1.5-5L5 9l5.5-2L12 2z" />
    </Wrap>
  ),
  WORKAHOLIC_BUNKER: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M6 7h12v12H6V7zM9 7V5h6v2" />
    </Wrap>
  ),
  AESTHETIC_CURATOR: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M4 18l6-6 4 4 6-8" />
    </Wrap>
  ),
  RESET_SEEKER: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
    </Wrap>
  ),
  WARM_HOST: (p) => (
    <Wrap size={p?.size}>
      <Glyph d="M7 11h10M12 6v10M5 21h14" />
    </Wrap>
  ),
};

export function ArchetypeIcon({
  id,
  size = 44,
}: {
  id?: string;
  size?: number;
}): ReactElement {
  const Fn = (id && ARCHETYPE_ICON_MAP[id]) || ARCHETYPE_ICON_MAP["AESTHETIC_CURATOR"];
  return Fn({ size });
}