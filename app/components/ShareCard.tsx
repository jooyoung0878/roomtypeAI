"use client";

import React, { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ArchetypeIcon } from "../lib/archetypeIcons";

type Props = {
  archetypeId?: string;
  archetypeName: string;
  oneLiner: string;
  hashtags?: string[];
  showSaveButton?: boolean;
};

const CANVAS = 1080; // 인스타 정사각
const SAFE = 80;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// 글자 수 기반 폰트 자동 축소(안전)
function fitFontSize(text: string, opts: { base: number; min: number; max: number }) {
  const len = (text ?? "").trim().length;
  if (!len) return opts.base;

  let size = opts.base;
  if (len > 60) size -= (len - 60) * 0.12;
  if (len > 140) size -= (len - 140) * 0.08;

  return clamp(Math.round(size), opts.min, opts.max);
}

function clampStyle(lines: number): React.CSSProperties {
  return {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: lines as any,
    overflow: "hidden",
  };
}

/** ✅ 실제 1080x1080 “원본 카드” (저장용 + 미리보기용으로 재사용) */
function Card1080({
  archetypeId,
  archetypeName,
  oneLiner,
  hashtags,
}: {
  archetypeId?: string;
  archetypeName: string;
  oneLiner: string;
  hashtags: string[];
}) {
  const tagLine = hashtags.join(" ");

  const titleSize = fitFontSize(archetypeName, { base: 56, min: 40, max: 58 });
  const bodySize = fitFontSize(oneLiner, { base: 30, min: 20, max: 32 });
  const bodyLines = oneLiner.length > 140 ? 3 : oneLiner.length > 90 ? 4 : 5;

  return (
    <div
      style={{
        width: CANVAS,
        height: CANVAS,
        borderRadius: 44,
        overflow: "hidden",
        background:
          "radial-gradient(900px 600px at 15% 15%, rgba(147,197,253,0.55), transparent 60%)," +
          "radial-gradient(800px 520px at 90% 20%, rgba(125,211,252,0.45), transparent 60%)," +
          "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
        border: "1px solid rgba(148,163,184,0.28)",
        boxShadow: "0 30px 80px rgba(59,130,246,0.18)",
        color: "#0f172a",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
        boxSizing: "border-box",
        padding: SAFE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 18,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 950,
              fontSize: 30,
              boxShadow: "0 16px 40px rgba(59,130,246,0.22)",
            }}
          >
            R
          </div>
          <div style={{ fontWeight: 950, fontSize: 20, letterSpacing: -0.2, opacity: 0.9 }}>
            RoomTypeAI
          </div>
        </div>

        <div style={{ transform: "scale(1.25)", transformOrigin: "top right" }}>
          <ArchetypeIcon id={archetypeId} size={64} />
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 950,
            letterSpacing: -1.2,
            lineHeight: 1.08,
            marginBottom: 16,
            ...clampStyle(2),
          }}
          title={archetypeName}
        >
          {archetypeName}
        </div>

        <div
          style={{
            fontSize: bodySize,
            lineHeight: 1.35,
            opacity: 0.95,
            maxWidth: 860,
            whiteSpace: "pre-wrap",
            ...clampStyle(bodyLines),
          }}
          title={oneLiner}
        >
          {oneLiner}
        </div>
      </div>

      {/* Footer */}
      <div>
        <div
          style={{
            padding: "18px 20px",
            borderRadius: 22,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(148,163,184,0.22)",
            boxShadow: "0 18px 50px rgba(59,130,246,0.10)",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>#</div>
          <div style={{ fontSize: 22, opacity: 0.9, lineHeight: 1.35, ...clampStyle(2) }}>
            {tagLine}
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-start", opacity: 0.75 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>roomtypeai.com</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>@RoomTypeAI</div>
        </div>
      </div>
    </div>
  );
}

export default function ShareCard({
  archetypeId,
  archetypeName,
  oneLiner,
  hashtags = ["#RoomTypeAI", "#방성격검사"],
  showSaveButton = true,
}: Props) {
  // ✅ 저장은 “숨겨진 원본(1080)”을 캡처
  const exportRef = useRef<HTMLDivElement | null>(null);

  // ✅ 미리보기 컨테이너 폭을 측정해서 스케일 계산
  const previewWrapRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(0.45); // 초기값

  const tags = useMemo(() => hashtags, [hashtags]);

  React.useEffect(() => {
    const el = previewWrapRef.current;
    if (!el) return;

    const calc = () => {
      const w = el.clientWidth; // 보여줄 수 있는 폭
      // 폭 기준으로 스케일 결정 (너무 작아지지 않게 하한)
      const s = clamp(w / CANVAS, 0.25, 1);
      setScale(s);
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onSave = async () => {
    if (!exportRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: CANVAS,
        height: CANVAS,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `roomtypeai_${(archetypeId ?? "archetype").toLowerCase()}.png`;
      a.click();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {showSaveButton && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(59,130,246,0.28)",
              background: "white",
              fontWeight: 900,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "PNG 생성 중..." : "PNG로 저장"}
          </button>
        </div>
      )}

      {/* ✅ 미리보기: 컨테이너 폭에 맞게 scale down */}
      <div
        ref={previewWrapRef}
        style={{
          width: "100%",
          overflow: "visible",
          position: "relative",
          height: CANVAS * scale, // ✅ wrapper가 딱 카드 높이를 갖게
        }}
      >
      <div
        style={{
          width: CANVAS,
          height: CANVAS,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          left: 0,
          top: 0,
        }}
        >
        <Card1080
          archetypeId={archetypeId}
          archetypeName={archetypeName}
          oneLiner={oneLiner}
          hashtags={tags}
        />
      </div>

        {/* ✅ 스케일된 카드 아래 공간 확보 (잘림/겹침 방지) */}
        <div style={{ height: Math.max(20, CANVAS * scale - 120) }} />
      </div>

      {/* ✅ 저장용 원본: 화면 밖에 숨김 (절대 잘리지 않음) */}
      <div
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          width: CANVAS,
          height: CANVAS,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div ref={exportRef}>
          <Card1080
            archetypeId={archetypeId}
            archetypeName={archetypeName}
            oneLiner={oneLiner}
            hashtags={tags}
          />
        </div>
      </div>
    </div>
  );
}