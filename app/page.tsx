"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArchetypeIcon } from "./lib/archetypeIcons";
import ShareCard from "./components/ShareCard";

type Lang = "ko" | "en";

type FreeResult = {
  mode: "free";
  features: any;
  scores: {
    clutter: number;
    focus: number;
    identity: number;
    routine: number;
  };
  archetype: {
    id?: string;
    name: string;
    oneLiner: string;
    vibeTags: string[];
  };
};

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(800px 500px at 10% 10%, rgba(147,197,253,0.4), transparent 60%)," +
      "radial-gradient(700px 400px at 90% 20%, rgba(125,211,252,0.35), transparent 60%)," +
      "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
    color: "#0f172a",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
  } as CSSProperties,

  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 18px 56px",
  } as CSSProperties,

  hero: {
    borderRadius: 20,
    padding: "22px 18px",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(56,189,248,0.12))",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.10)",
  } as CSSProperties,

  heroTitle: { margin: 0, fontSize: 28, letterSpacing: -0.3 } as CSSProperties,
  heroSub: { marginTop: 8, opacity: 0.9, lineHeight: 1.5 } as CSSProperties,

  grid2: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 14,
    alignItems: "start",
  } as CSSProperties,

  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  } as CSSProperties,

  card: {
    borderRadius: 18,
    padding: 14,
    background: "white",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 12px 30px rgba(59,130,246,0.08)",
  } as CSSProperties,

  premiumHeaderRow: {
    borderRadius: 18,
    padding: 18,
    background: "white",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 18px 46px rgba(59,130,246,0.10)",
  } as CSSProperties,

  premiumRow5050: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
    alignItems: "stretch",
  } as CSSProperties,

  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.06)",
    fontSize: 12,
    opacity: 0.95,
  } as CSSProperties,

  button: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(56,189,248,0.30)",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.95), rgba(56,189,248,0.85))",
    color: "#061125",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 40px rgba(37,99,235,0.22)",
  } as CSSProperties,

  buttonGhost: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(255,255,255,0.8)",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  } as CSSProperties,

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    boxShadow: "none",
  } as CSSProperties,

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px dashed rgba(148,163,184,0.35)",
    background: "rgba(255,255,255,0.70)",
    color: "#0f172a",
  } as CSSProperties,

  small: { fontSize: 13, opacity: 0.86, lineHeight: 1.45 } as CSSProperties,

  progressWrap: {
    marginTop: 10,
    height: 12,
    background: "rgba(15,23,42,0.06)",
    borderRadius: 999,
    overflow: "hidden",
    border: "1px solid rgba(148,163,184,0.18)",
  } as CSSProperties,

  progressBar: (pct: number) =>
    ({
      width: `${pct}%`,
      height: "100%",
      background:
        "linear-gradient(90deg, rgba(56,189,248,0.95), rgba(59,130,246,0.95))",
      transition: "width 250ms linear",
    } as CSSProperties),

  shareCardShell: {
    borderRadius: 18,
    overflow: "hidden",
    padding: 0,
    border: "1px solid rgba(56,189,248,0.22)",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(56,189,248,0.10))",
    boxShadow: "0 18px 46px rgba(59,130,246,0.10)",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  } as CSSProperties,

  shareCardFill: {
    width: "100%",
    height: "100%",
    display: "flex",
    flex: 1,
  } as CSSProperties,

  langToggleWrap: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  } as CSSProperties,

  langBtn: (active: boolean) =>
    ({
      padding: "8px 10px",
      borderRadius: 999,
      border: "1px solid rgba(148,163,184,0.25)",
      background: active ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.8)",
      fontWeight: active ? 950 : 800,
      cursor: "pointer",
    } as CSSProperties),
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function scoreLabel(v: number) {
  const n = clamp01(v);
  if (n >= 80) return "매우 높음";
  if (n >= 60) return "높음";
  if (n >= 40) return "보통";
  if (n >= 20) return "낮음";
  return "매우 낮음";
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LoadingMeme({ lang }: { lang: Lang }) {
  const memesKo = [
    "AI가 케이블을 보고 울기 직전이에요…",
    "침대가 ‘나도 쉬고 싶다’고 말하는 중…",
    "혼돈 속의 질서를 찾는 중… (지금이 제일 어려움)",
    "취향 시그널 수집 중… 피규어는 증거물입니다",
    "마감형 에너지가 감지되면 속도가 느려집니다(?)",
  ];
  const memesEn = [
    "AI is about to cry after seeing the cables…",
    "Your bed is whispering: “I also need rest.”",
    "Finding order inside chaos… (hardest part)",
    "Collecting taste signals… figurines are evidence",
    "Deadline energy detected—slowing down automatically (?)",
  ];
  const pool = lang === "en" ? memesEn : memesKo;
  const [m] = useState(pool[Math.floor(Math.random() * pool.length)]);
  return <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>🌀 {m}</div>;
}

function StatCard({
  title,
  value,
  icon,
  help,
}: {
  title: string;
  value: number;
  icon: string;
  help: string;
}) {
  const v = clamp01(value);
  return (
    <div style={styles.card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        <div style={{ fontSize: 18, opacity: 0.95 }}>{icon}</div>
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{ fontSize: 26, fontWeight: 950 }}>{Math.round(v)}</div>
        <div style={{ ...styles.pill }}>{scoreLabel(v)}</div>
      </div>

      <div style={styles.progressWrap}>
        <div style={styles.progressBar(v)} />
      </div>

      <div style={{ marginTop: 8, ...styles.small }}>{help}</div>
    </div>
  );
}

function MiniBadge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(15,23,42,0.05)",
        border: "1px solid rgba(148,163,184,0.16)",
        fontSize: 12,
        opacity: 0.95,
        marginRight: 8,
        marginTop: 8,
      }}
    >
      {text}
    </span>
  );
}

function t(lang: Lang) {
  if (lang === "en") {
    return {
      beta: "Beta",
      title: "Room Photo Personality Test",
      subtitle:
        "Just one photo—no questions. Fun analysis from room vibe → habits → tendencies.\nFree result first, then Premium WHY report after you share.",
      upload: "Upload photo",
      uploadHelp: "A room photo with desk/bed/floor visible works best. Avoid private info in frame.",
      analyze: "Analyze",
      analyzingFree: "Analyzing (Free)…",
      premiumLocked: "Share on Instagram to unlock Premium",
      shareUnlock: "Share on Instagram & Unlock Premium",
      openIG: "Open Instagram",
      freeResult: "FREE Result",
      premiumWhy: "PREMIUM WHY Report",
      whyTitle: "Why did I get this result?",
      hypoTitle: "Possible causes (hypotheses)",
      loadingPremium: "Generating Premium WHY…",
      note: "For entertainment only, not a diagnosis.",
    };
  }
  return {
    beta: "Beta",
    title: "🟦 방 사진 1장 성격검사",
    subtitle:
      "질문 없이 사진 한 장으로 “방의 분위기 → 습관 → 성향”을 재미로 분석해요.\n무료 결과 먼저, 인스타 공유하면 프리미엄 WHY 리포트가 무료로 열립니다.",
    upload: "사진 업로드",
    uploadHelp: "방 사진(책상/침대/바닥)이 보이면 더 좋아요. 개인정보가 보이지 않게 찍는 걸 추천!",
    analyze: "분석하기",
    analyzingFree: "무료 분석 중...",
    premiumLocked: "인스타 공유하면 Premium 무료",
    shareUnlock: "인스타 공유하고 Premium 보기",
    openIG: "인스타 열기",
    freeResult: "🟦 FREE 결과",
    premiumWhy: "✅ PREMIUM WHY 리포트",
    whyTitle: "왜 이런 결과가 나왔을까?",
    hypoTitle: "가능한 원인(가설)",
    loadingPremium: "프리미엄 WHY 리포트 생성 중…",
    note: "이 리포트는 재미용이며 진단이 아닙니다.",
  };
}

export default function Page() {
  const [lang, setLang] = useState<Lang>("ko");

  const [file, setFile] = useState<File | null>(null);
  const [freeRes, setFreeRes] = useState<FreeResult | null>(null);
  const [premiumReport, setPremiumReport] = useState<any | null>(null);

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const [loadingFree, setLoadingFree] = useState(false);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const progressTimer = useRef<number | null>(null);

  const copyToastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const stepsKo = [
    "프리미엄 준비 중 (무료 결과 기반)",
    "WHY(이유) 리포트 작성 중",
    "핵심 문장 다듬는 중",
    "공유 카드 렌더링 중",
  ];
  const stepsEn = [
    "Preparing Premium (based on free result)",
    "Writing WHY report",
    "Polishing key lines",
    "Rendering share card",
  ];

  const L = t(lang);

  // URL에서 lang 파라미터 읽기 (middleware rewrite 지원)
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get("lang");
    if (q === "en" || q === "ko") setLang(q);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (copyToastTimer.current) window.clearTimeout(copyToastTimer.current);
    copyToastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };

  const stopFakeProgress = () => {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  // ✅ 90초 템포: 1초에 1% 올라가서 90%까지 90초
  const startFakeProgress = () => {
    stopFakeProgress();
    setProgress(0);
    setStepIdx(0);

    progressTimer.current = window.setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 1));
    }, 1000);

    window.setTimeout(() => setStepIdx(1), 8000);
    window.setTimeout(() => setStepIdx(2), 35000);
    window.setTimeout(() => setStepIdx(3), 65000);
  };

  useEffect(() => {
    return () => stopFakeProgress();
  }, []);

  const setLangAndUrl = (next: Lang) => {
    setLang(next);
    // SEO-friendly: /ko or /en 로 주소 변경 (새로고침 없어도 됨)
    const base = next === "en" ? "/en" : "/ko";
    window.history.replaceState({}, "", base);
  };

  const onAnalyzeFree = async () => {
    if (!file) return;

    setErr(null);
    setFreeRes(null);
    setPremiumReport(null);
    setPremiumUnlocked(false);

    setLoadingFree(true);
    try {
      const base64 = await toBase64(file);

      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 분석 자체는 언어에 상관없이 가능하지만, 나중에 필요하면 mode/lang 전달 가능
        body: JSON.stringify({ imageBase64: base64 }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Free API error");

      setFreeRes(data);
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoadingFree(false);
    }
  };

  // ✅ “인스타 공유” 클릭 시 Premium unlock + Premium 호출
  const onShareUnlockPremium = async () => {
    if (!freeRes) return;

    setPremiumUnlocked(true);
    setLoadingPremium(true);
    startFakeProgress();

    try {
      // 인스타 오픈 (MVP: 실제 업로드 검증은 하지 않음)
      window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");

      const pr = await fetch("/api/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: freeRes.features,
          scores: freeRes.scores,
          archetype: freeRes.archetype,
          language: lang, // ✅ 언어 전달
        }),
      });

      const pdata = await pr.json();
      if (!pr.ok) throw new Error(pdata?.error || "Premium API error");

      setPremiumReport(pdata.premium_report);

      setProgress(100);
      stopFakeProgress();
      setLoadingPremium(false);

      showToast(lang === "en" ? "Premium unlocked!" : "Premium 잠금 해제!");
    } catch (e: any) {
      stopFakeProgress();
      setLoadingPremium(false);
      setErr(e?.message ?? "Unknown error");
    }
  };

  const copyHashtags = async () => {
    const tags =
      premiumReport?.share_pack?.hashtags?.join(" ") ??
      (lang === "en" ? "#RoomPersonalityAI #RoomPersonality" : "#RoomPersonalityAI #방성격검사");
    try {
      await navigator.clipboard.writeText(tags);
      showToast(lang === "en" ? "Hashtags copied!" : "해시태그 복사 완료!");
    } catch {
      showToast(lang === "en" ? "Copy failed" : "복사 실패");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* TOP BAR */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 950,
                fontSize: 18,
                boxShadow: "0 6px 14px rgba(59,130,246,0.3)",
              }}
            >
              R
            </div>
            <div style={{ fontWeight: 950, fontSize: 18 }}>RoomPersonalityAI</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.langToggleWrap}>
              <button style={styles.langBtn(lang === "ko")} onClick={() => setLangAndUrl("ko")}>KO</button>
              <button style={styles.langBtn(lang === "en")} onClick={() => setLangAndUrl("en")}>EN</button>
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{L.beta}</div>
          </div>
        </div>

        {/* HERO */}
        <header style={styles.hero}>
          <h1 style={styles.heroTitle}>{L.title}</h1>
          <div style={{ ...styles.heroSub, whiteSpace: "pre-line" }}>{L.subtitle}</div>
        </header>

        {/* UPLOAD */}
        <section style={{ marginTop: 14, ...styles.grid2 }}>
          <div style={styles.card}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>{L.upload}</div>
            <div style={{ marginTop: 8, ...styles.small }}>{L.uploadHelp}</div>

            <div style={{ marginTop: 12 }}>
              <input
                style={styles.input}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                style={{
                  ...styles.button,
                  ...(!file || loadingFree || loadingPremium ? styles.buttonDisabled : {}),
                }}
                onClick={onAnalyzeFree}
                disabled={!file || loadingFree || loadingPremium}
              >
                {loadingFree ? L.analyzingFree : L.analyze}
              </button>

              <span style={styles.pill}>{L.premiumLocked}</span>
            </div>

            {err && <div style={{ marginTop: 12, color: "#b91c1c" }}>Error: {err}</div>}
          </div>

          <div style={styles.card}>
            <div style={{ fontWeight: 950, fontSize: 16 }}>✅ Tips</div>
            <div style={{ marginTop: 8, ...styles.small }}>
              {lang === "en"
                ? "For better WHY: include desk/bed/floor in the shot. Avoid faces/private info."
                : "WHY 정확도를 높이려면 책상/침대/바닥이 함께 보이게 찍어줘. 얼굴/개인정보는 피하기!"}
            </div>
            <div style={{ marginTop: 10 }}>
              <MiniBadge text={lang === "en" ? "Include desk" : "책상 포함"} />
              <MiniBadge text={lang === "en" ? "Turn on lights" : "조명 켜기"} />
              <MiniBadge text={lang === "en" ? "Wide angle" : "광각/정면"} />
            </div>
          </div>
        </section>

        {/* FREE RESULT */}
        {freeRes && (
          <section style={{ marginTop: 14, ...styles.grid2 }}>
            <div style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ ...styles.pill, marginBottom: 10 }}>{L.freeResult}</div>
                  <div style={{ fontSize: 22, fontWeight: 950 }}>{freeRes.archetype.name}</div>
                  <div style={{ marginTop: 6, opacity: 0.9, lineHeight: 1.5 }}>{freeRes.archetype.oneLiner}</div>
                </div>
                <ArchetypeIcon id={freeRes.archetype.id} size={54} />
              </div>

              <div style={{ marginTop: 10 }}>
                {(freeRes.archetype.vibeTags ?? []).slice(0, 8).map((t, i) => (
                  <MiniBadge key={i} text={t} />
                ))}
              </div>

              {/* ✅ Premium unlock CTA */}
              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.button,
                    ...(loadingPremium ? styles.buttonDisabled : {}),
                  }}
                  onClick={onShareUnlockPremium}
                  disabled={loadingPremium}
                >
                  {L.shareUnlock}
                </button>

                <button
                  style={{
                    ...styles.buttonGhost,
                    ...(loadingPremium ? styles.buttonDisabled : {}),
                  }}
                  onClick={() => window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer")}
                  disabled={loadingPremium}
                >
                  {L.openIG}
                </button>
              </div>
            </div>

            <div style={styles.gridCards}>
              <StatCard title={lang === "en" ? "Tidiness" : "정리도"} value={freeRes.scores.clutter} icon="🧹" help={lang === "en" ? "based on clutter signals" : "바닥/침대/책상 혼잡도 기반"} />
              <StatCard title={lang === "en" ? "Focus" : "집중환경"} value={freeRes.scores.focus} icon="🎯" help={lang === "en" ? "work-zone & distractions" : "작업존 신호, 방해 요소 기반"} />
              <StatCard title={lang === "en" ? "Identity" : "취향/개성"} value={freeRes.scores.identity} icon="🎨" help={lang === "en" ? "decor, hobbies, signals" : "취향 물건/장식/개성 신호 기반"} />
              <StatCard title={lang === "en" ? "Routine" : "루틴/회복"} value={freeRes.scores.routine} icon="🌙" help={lang === "en" ? "sleep/recovery cues" : "수면/회복에 유리한 환경 신호 기반"} />
            </div>
          </section>
        )}

        {/* PREMIUM LOADING */}
        {loadingPremium && (
          <section style={{ marginTop: 14, ...styles.card }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ ...styles.pill, marginBottom: 10 }}>🔥 Premium</div>
                <div style={{ fontSize: 18, fontWeight: 950 }}>{L.loadingPremium}</div>
                <div style={{ marginTop: 6, ...styles.small }}>
                  {lang === "en"
                    ? "Progress bar is paced for ~90s (finishes immediately when ready)."
                    : "로딩바는 약 90초 템포(응답 오면 즉시 완료)로 천천히 진행돼요."}
                </div>
              </div>
              <div style={{ fontSize: 34 }}>🫧</div>
            </div>

            <div style={styles.progressWrap}>
              <div style={styles.progressBar(progress)} />
            </div>
            <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>{progress}%</div>

            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              {(lang === "en" ? stepsEn : stepsKo).map((s, i) => (
                <div
                  key={s}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: "1px solid rgba(148,163,184,0.14)",
                    background: i === stepIdx ? "rgba(56,189,248,0.12)" : "rgba(15,23,42,0.03)",
                    fontWeight: i === stepIdx ? 950 : 600,
                  }}
                >
                  {i === stepIdx ? "👉 " : "• "}
                  {s}
                </div>
              ))}
            </div>

            <LoadingMeme lang={lang} />
          </section>
        )}

        {/* PREMIUM */}
        {premiumUnlocked && premiumReport && (
          <>
            {/* PREMIUM WHY (100%) */}
            <section style={{ marginTop: 14 }}>
              <div style={styles.premiumHeaderRow}>
                <div style={{ ...styles.pill, marginBottom: 10 }}>{L.premiumWhy}</div>
                <div style={{ fontSize: 28, fontWeight: 950, lineHeight: 1.15 }}>
                  {premiumReport?.deep_read?.highlights?.premium_one_liner ?? "Premium one-liner"}
                </div>
                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>
                  {premiumReport?.deep_read?.safety_note ?? L.note}
                </div>
              </div>
            </section>

            {/* WHY + ShareCard 50/50 같은 높이 */}
            <section style={{ marginTop: 14, ...styles.premiumRow5050 }}>
              <div style={{ ...styles.premiumHeaderRow, height: "100%", minHeight: 520 }}>
                <div style={{ fontWeight: 950, fontSize: 20 }}>{L.whyTitle}</div>
                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
                  {lang === "en"
                    ? "These are visible environment signals summarized into a fun explanation."
                    : "사진에서 보이는 환경 신호를 바탕으로 ‘이런 패턴일 수 있어요’를 정리했어요."}
                </div>

                <ul style={{ marginTop: 14, paddingLeft: 18 }}>
                  {(premiumReport?.evidence_bundle?.top_evidence ?? [])
                    .slice(0, 7)
                    .map((e: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: 10, lineHeight: 1.7, fontSize: 16 }}>
                        {e?.observation}
                      </li>
                    ))}
                </ul>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button style={styles.buttonGhost} onClick={copyHashtags}>
                    {lang === "en" ? "Copy hashtags" : "해시태그 복사"}
                  </button>
                </div>
              </div>

              <div style={styles.shareCardShell}>
                <div style={styles.shareCardFill}>
                  <ShareCard
                    archetypeId={freeRes?.archetype?.id}
                    archetypeName={freeRes?.archetype?.name ?? "My Room Archetype"}
                    oneLiner={freeRes?.archetype?.oneLiner ?? ""}
                    hashtags={premiumReport?.share_pack?.hashtags ?? ["#RoomPersonalityAI", "#방성격검사"]}
                  />
                </div>
              </div>
            </section>

            {/* Hypotheses 100% */}
            <section style={{ marginTop: 14 }}>
              <div style={styles.premiumHeaderRow}>
                <div style={{ fontWeight: 950, fontSize: 20 }}>{L.hypoTitle}</div>
                <div style={{ marginTop: 10, fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
                  {lang === "en"
                    ? "Not a diagnosis—just plausible patterns. If something resonates, that’s your hint."
                    : "단정이 아니라 ‘가능성’이에요. 공감되는 게 있으면 그게 힌트!"}
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                  {(premiumReport?.deep_read?.root_cause_hypotheses ?? []).map((h: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "rgba(15,23,42,0.03)",
                        border: "1px solid rgba(148,163,184,0.16)",
                      }}
                    >
                      <div style={{ fontWeight: 950, fontSize: 16 }}>{h?.hypothesis}</div>
                      <div style={{ marginTop: 8, opacity: 0.92, lineHeight: 1.65, fontSize: 15 }}>
                        {h?.why_it_fits}
                      </div>
                      {h?.counter_signal && (
                        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
                          {lang === "en" ? "Counter-signal: " : "(반례/주의) "}
                          {h.counter_signal}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <footer style={{ marginTop: 22, opacity: 0.72, fontSize: 12 }}>
          © RoomPersonalityAI · {lang === "en" ? "For fun only (not medical/psychological advice)." : "재미용 분석(진단 아님)"} ·{" "}
          {lang === "en" ? "Avoid sensitive info in photos." : "사진 업로드 시 민감정보가 보이지 않게 주의하세요."}
        </footer>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 18,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px 14px",
              borderRadius: 999,
              background: "rgba(15,23,42,0.92)",
              color: "white",
              fontSize: 13,
              fontWeight: 800,
              boxShadow: "0 14px 40px rgba(0,0,0,0.22)",
              zIndex: 9999,
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}