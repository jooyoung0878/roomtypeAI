// lib/premiumPrompt.ts
import type { VisionFeatures, Scores } from "./scoring";
import type { Archetype } from "./archetypes";

/**
 * premiumSystem:
 * - 무조건 JSON만 출력
 * - 진단(의학/정신건강) 금지
 * - 입력된 features/scores/archetype 범위 내에서만 근거 작성
 */
export const premiumSystem = `
너는 "방 사진 기반 재미용 프리미엄 리포트" 생성기다.

절대 규칙(반드시 지켜라):
1) 출력은 오직 JSON 1개 객체만. 코드블록/설명/문장/마크다운 절대 금지.
2) 스키마의 필수(required) 필드는 1개도 누락하면 안 된다.
3) 모든 숫자 필드는 숫자로, 배열 필드는 배열로, 문자열 필드는 문자열로만.
4) confidence는 항상 0~1 사이의 number로 포함.
5) maintenance_rules는 "문자열 배열"이다. 객체/딕셔너리를 넣지 마라.
6) difficulty는 반드시 "easy" | "medium" | "hard" 중 하나.
7) seven_day_plan은 day 1~7 총 7개, 각 항목에 mission 객체가 반드시 있어야 한다.
8) 의학/정신건강/ADHD/우울증 등 "진단" 금지. "경향/습관/환경 신호" 톤만 사용.
9) 이미지에 없는 것을 상상하지 마라. 근거는 features/scores에서 유도 가능한 것만.
10) 문장은 단정하지 말고 "~일 수 있어요/~처럼 보일 수 있어요" 톤.

목표:
- 유저가 "왜 이런 결과가 나왔는지" 납득하도록 evidence_bundle과 root_cause_hypotheses를 명확히 작성.
`;

/**
 * makePremiumUser:
 * - 입력을 모델에게 주고,
 * - 스키마 체크리스트 + 미니 예시 JSON으로 형태 고정
 */
export function makePremiumUser(
  analysisId: string,
  createdAtIso: string,
  features: VisionFeatures,
  scores: Scores,
  archetype: Archetype
) {
  return `
아래 입력(관측값/점수/아키타입)을 사용해서 premium_report.json을 생성해줘.

[analysis_id]
${analysisId}

[created_at_iso]
${createdAtIso}

[archetype]
${JSON.stringify(
    {
      archetype_id: archetype.id,
      archetype_name: archetype.name,
      one_liner: archetype.oneLiner,
      vibe_tags: archetype.vibeTags,
    },
    null,
    2
  )}

[scores]
${JSON.stringify(scores, null, 2)}

[features]
${JSON.stringify(features, null, 2)}

========================
필수 JSON 스키마 구조(요약)
========================
- version: "premium_v1"
- analysis_id: string
- created_at_iso: string
- archetype_id: string
- archetype_name: string

- premium_axes: object (6개 number)
  - recovery_index, tension_index, friction_index, momentum_index, focus_channel_score, distraction_pressure

- evidence_bundle:
  - top_evidence: 배열(3~8개)
    각 item: { observation: string, signal_tags: string[], confidence: number(0~1) }
  - environment_summary:
    { primary_activity_zone: "desk"|"bed"|"floor"|"mixed",
      clutter_hotspots: ["desk"|"bed"|"floor"|"shelves"|"corner", ...],
      visual_noise_sources: string[] }

- deep_read:
  - root_cause_hypotheses: 배열(2~4개)
    각 item: { hypothesis: string, why_it_fits: string, counter_signal?: string }
  - mode_profile: { default_mode: "recharge"|"work"|"scroll"|"creative"|"survival"|"mixed", mode_explanation: string }
  - highlights: { strengths: string[], blind_spots: string[], premium_one_liner: string }
  - safety_note: string (진단 아님 문구)

- action_plan:
  - instant_fix: { id, name, duration_minutes(1~20), difficulty("easy"|"medium"|"hard"), steps:string[], expected_effect }
  - seven_day_plan: 길이 7 (day 1~7)
    각 item: { day: number, mission: { id, name, duration_minutes, difficulty, steps, expected_effect } }
  - maintenance_rules: 문자열 배열(2~6개)

- share_pack:
  { headline: string, subhead: string, hashtags: string[], brag_points: string[] }

========================
작성 규칙(강제)
========================
- "archetype_name"은 반드시 위 archetype에서 그대로 복사
- premium_axes는 0~100 사이 숫자로 채워라(정수 권장)
- top_evidence의 confidence는 매 항목마다 반드시 채워라 (예: 0.62)
- maintenance_rules는 반드시 문자열만 넣어라 (예: "저녁 5분만: 한 구역 정리")
- seven_day_plan은 정확히 7개, day는 1~7
- steps는 문자열 배열(1~6개)
- 절대 코드블록 금지, 절대 설명 금지, JSON만 출력

========================
형식 따라하기용 "미니 예시" (내용은 너가 새로 작성)
========================
{
  "version": "premium_v1",
  "analysis_id": "anl_xxx",
  "created_at_iso": "2026-02-28T00:00:00.000Z",
  "archetype_id": "SOME_ID",
  "archetype_name": "아키타입 이름",
  "premium_axes": {
    "recovery_index": 50,
    "tension_index": 60,
    "friction_index": 55,
    "momentum_index": 45,
    "focus_channel_score": 70,
    "distraction_pressure": 65
  },
  "evidence_bundle": {
    "top_evidence": [
      { "observation": "…", "signal_tags": ["desk_clutter"], "confidence": 0.7 },
      { "observation": "…", "signal_tags": ["bed_hotspot"], "confidence": 0.6 },
      { "observation": "…", "signal_tags": ["lighting"], "confidence": 0.5 }
    ],
    "environment_summary": {
      "primary_activity_zone": "mixed",
      "clutter_hotspots": ["desk"],
      "visual_noise_sources": ["케이블", "잡동사니"]
    }
  },
  "deep_read": {
    "root_cause_hypotheses": [
      { "hypothesis": "…", "why_it_fits": "…" },
      { "hypothesis": "…", "why_it_fits": "…", "counter_signal": "…" }
    ],
    "mode_profile": { "default_mode": "creative", "mode_explanation": "…" },
    "highlights": {
      "strengths": ["…", "…"],
      "blind_spots": ["…", "…"],
      "premium_one_liner": "…"
    },
    "safety_note": "이 리포트는 재미용이며 진단이 아닙니다."
  },
  "action_plan": {
    "instant_fix": {
      "id": "mission_x",
      "name": "…",
      "duration_minutes": 3,
      "difficulty": "easy",
      "steps": ["…"],
      "expected_effect": "…"
    },
    "seven_day_plan": [
      { "day": 1, "mission": { "id": "d1", "name": "…", "duration_minutes": 5, "difficulty": "easy", "steps": ["…"], "expected_effect": "…" } },
      { "day": 2, "mission": { "id": "d2", "name": "…", "duration_minutes": 5, "difficulty": "easy", "steps": ["…"], "expected_effect": "…" } },
      { "day": 3, "mission": { "id": "d3", "name": "…", "duration_minutes": 7, "difficulty": "medium", "steps": ["…"], "expected_effect": "…" } },
      { "day": 4, "mission": { "id": "d4", "name": "…", "duration_minutes": 4, "difficulty": "easy", "steps": ["…"], "expected_effect": "…" } },
      { "day": 5, "mission": { "id": "d5", "name": "…", "duration_minutes": 6, "difficulty": "medium", "steps": ["…"], "expected_effect": "…" } },
      { "day": 6, "mission": { "id": "d6", "name": "…", "duration_minutes": 5, "difficulty": "easy", "steps": ["…"], "expected_effect": "…" } },
      { "day": 7, "mission": { "id": "d7", "name": "…", "duration_minutes": 5, "difficulty": "easy", "steps": ["…"], "expected_effect": "…" } }
    ],
    "maintenance_rules": [
      "저녁 5분만: 한 구역 정리",
      "침대는 회복 구역으로 고정"
    ]
  },
  "share_pack": {
    "headline": "…",
    "subhead": "…",
    "hashtags": ["#RoomPersonalityAI", "#방사진성격검사", "#…"],
    "brag_points": ["…", "…"]
  }
}

========================
이제 위 입력(features/scores/archetype)에 근거해서,
'완전한 JSON 1개'를 출력해라.
========================
`;
}