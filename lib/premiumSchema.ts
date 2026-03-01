// lib/premiumSchema.ts
import { z } from "zod";
import type { ArchetypeId } from "./archetypes";

// 공통: 0~100 점수
const Score0to100 = z.number().min(0).max(100);

// 공통: “관측 근거” (이미지에서 관측된 것만)
export const EvidenceSchema = z.object({
  // 사람이 이해하는 근거 문장(짧게)
  observation: z.string().min(3).max(140),
  // 무엇을 봤는지 태그화
  signal_tags: z.array(z.string().min(1).max(32)).min(1).max(6),
  // 확신도(재미용, 너무 진지하게 안 보이게)
  confidence: z.number().min(0).max(1),
});

// 공통: “해석 문장” (진단이 아니라 경향/습관 톤)
export const InterpretationSchema = z.object({
  title: z.string().min(3).max(60),
  narrative: z.string().min(10).max(420),
  // 안전장치: 과장/진단 방지
  disclaimer: z
    .string()
    .min(5)
    .max(180)
    .default("참고용 추정치이며 진단이 아닙니다."),
});

// 행동 미션(바이럴/리텐션 핵심)
export const MicroMissionSchema = z.object({
  id: z.string().min(3).max(40), // "mission_floor_lane_1" 등
  name: z.string().min(3).max(60),
  duration_minutes: z.number().int().min(1).max(20), // 1~20분
  difficulty: z.enum(["easy", "medium", "hard"]),
  steps: z.array(z.string().min(3).max(120)).min(1).max(6),
  expected_effect: z.string().min(3).max(120), // "시각적 혼잡 감소" 등
});

// 프리미엄 리포트 핵심 스키마
export const PremiumReportSchema = z.object({
  version: z.literal("premium_v1"),

  // 결과 식별/추적(저장/공유/재현용)
  analysis_id: z.string().min(8).max(80),
  created_at_iso: z.string().datetime(), // ISO string

  // 무료 결과와 연결되는 핵심
  archetype_id: z.custom<ArchetypeId>(),
  archetype_name: z.string().min(2).max(40),

  // 프리미엄 전용 “심화 축”
  premium_axes: z.object({
    // 회복/긴장 축(“집이 주는 느낌”으로 포장)
    recovery_index: Score0to100, // 높을수록 회복/안정
    tension_index: Score0to100,  // 높을수록 긴장/부담(재미용)

    // 실행력/마찰 지표
    friction_index: Score0to100, // 높을수록 ‘정리/시작’ 마찰 큼
    momentum_index: Score0to100, // 높을수록 ‘유지/루틴’ 탄성 좋음

    // 몰입/분산 지표
    focus_channel_score: Score0to100,      // 환경이 몰입 돕는 정도
    distraction_pressure: Score0to100,     // 시각적 자극/분산 압력
  }),

  // 프리미엄이 “깊어 보이는” 핵심: 관측 근거 묶음
  evidence_bundle: z.object({
    top_evidence: z.array(EvidenceSchema).min(3).max(8),

    // 유저가 납득하게 만드는 ‘관측 요약’
    environment_summary: z.object({
      primary_activity_zone: z.enum(["desk", "bed", "floor", "mixed"]),
      clutter_hotspots: z.array(z.enum(["desk", "bed", "floor", "shelves", "corner"])).min(1).max(5),
      visual_noise_sources: z.array(z.string().min(2).max(40)).min(1).max(8),
    }),
  }),

  // 프리미엄 해석 섹션 (진단X, 경향/습관/환경요인)
  deep_read: z.object({
    // “왜 이런 방이 되었나” 가설(3개 정도)
    root_cause_hypotheses: z.array(
      z.object({
        hypothesis: z.string().min(6).max(120),
        why_it_fits: z.string().min(10).max(220),
        counter_signal: z.string().min(6).max(140).optional(), // 반례/주의
      })
    ).min(2).max(4),

    // “당신의 공간이 유도하는 모드”
    mode_profile: z.object({
      default_mode: z.enum(["recharge", "work", "scroll", "creative", "survival", "mixed"]),
      mode_explanation: z.string().min(10).max(260),
    }),

    // 읽는 재미를 위해 “칭찬/약점/한 줄”
    highlights: z.object({
      strengths: z.array(z.string().min(3).max(80)).min(2).max(5),
      blind_spots: z.array(z.string().min(3).max(80)).min(2).max(5),
      premium_one_liner: z.string().min(6).max(90),
    }),

    // 안전 문구(의학/정신건강 진단처럼 보이는 걸 방지)
    safety_note: z.string().min(10).max(220).default(
      "이 리포트는 방 사진에서 보이는 환경 신호를 기반으로 한 ‘재미용’ 분석이며, 건강/심리 진단이 아닙니다."
    ),
  }),

  // 실행 계획: 7일 미션 + 지금 당장 미션
  action_plan: z.object({
    instant_fix: MicroMissionSchema, // 3~5분짜리 “지금 당장”
    seven_day_plan: z.array(
      z.object({
        day: z.number().int().min(1).max(7),
        mission: MicroMissionSchema,
      })
    ).length(7),

    // 유지 전략(습관화 문구)
    maintenance_rules: z.array(z.string().min(5).max(90)).min(2).max(6),
  }),

  // 공유용 카드에 바로 쓰는 짧은 카피들
  share_pack: z.object({
    headline: z.string().min(3).max(40),
    subhead: z.string().min(6).max(60),
    hashtags: z.array(z.string().min(2).max(24)).min(3).max(12),
    brag_points: z.array(z.string().min(3).max(50)).min(2).max(5),
  }),

  // (옵션) 프리미엄에서만 보여주는 “정밀도” 표시
  model_meta: z.object({
    model_name: z.string().min(2).max(60),
    image_detail: z.enum(["low", "auto", "high"]).default("auto"),
    notes: z.string().max(200).optional(),
  }).optional(),
});

export type PremiumReport = z.infer<typeof PremiumReportSchema>;