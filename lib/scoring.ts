// lib/scoring.ts

import { ARCHETYPES, ArchetypeId } from "./archetypes";

export type VisionFeatures = {
  // 0~1 비율/확률 계열
  floor_clutter_ratio: number; // 0~1
  bed_messiness: number;       // 0~1
  desk_clutter_ratio: number;  // 0~1

  // 카운트 계열
  monitor_count: number;       // 0~3 정도
  books_count: number;         // 0~50 추정
  sticky_notes_count: number;  // 0~30 추정
  collectibles_count: number;  // 0~30 추정
  plants_count: number;        // 0~20 추정
  cables_messy_level: number;  // 0~5

  // boolean 계열
  laundry_detected: boolean;
  trash_detected: boolean;
  posters_present: boolean;
  warm_lighting_present: boolean;
  blackout_curtain_present: boolean;
  bed_side_phone_charger_present: boolean;
  ergonomic_chair_present: boolean;
  whiteboard_present: boolean;
  art_supplies_present: boolean;
  instrument_present: boolean;
  vitamins_present: boolean;
};

export type Scores = {
  clutter: number;   // 0~100 (높을수록 어질러짐)
  focus: number;     // 0~100
  identity: number;  // 0~100
  routine: number;   // 0~100
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export function computeScores(f: VisionFeatures): Scores {
  const clutter =
    45 * f.floor_clutter_ratio +
    35 * f.desk_clutter_ratio +
    20 * f.bed_messiness +
    (f.laundry_detected ? 10 : 0) +
    (f.trash_detected ? 10 : 0) +
    (f.cables_messy_level * 3);

  const focus =
    (f.monitor_count * 18) +
    (f.ergonomic_chair_present ? 10 : 0) +
    (f.whiteboard_present ? 10 : 0) +
    clamp(20 - (f.desk_clutter_ratio * 25)) +
    clamp(10 - (f.floor_clutter_ratio * 10));

  const identity =
    (f.posters_present ? 18 : 0) +
    clamp(f.collectibles_count * 2.2) +
    clamp(f.plants_count * 4) +
    (f.art_supplies_present ? 18 : 0) +
    (f.instrument_present ? 18 : 0) +
    (f.warm_lighting_present ? 8 : 0);

  const routine =
    (f.blackout_curtain_present ? 12 : 0) +
    (f.vitamins_present ? 18 : 0) +
    clamp(25 - (f.bed_messiness * 25)) +
    clamp(20 - (f.trash_detected ? 15 : 0)) +
    (f.bed_side_phone_charger_present ? -5 : 5); // 침대 옆 폰/충전기 있으면 수면위생 약간 감점(재미용)

  return {
    clutter: clamp(clutter),
    focus: clamp(focus),
    identity: clamp(identity),
    routine: clamp(routine),
  };
}

// 16 타입 분류: 점수 구간 + 보조 시그널로 결정
export function pickArchetype(f: VisionFeatures, s: Scores): ArchetypeId {
  const clutterHigh = s.clutter >= 60;
  const clutterLow = s.clutter <= 30;

  const focusHigh = s.focus >= 70;
  const focusLow = s.focus <= 40;

  const identityHigh = s.identity >= 65;
  const identityLow = s.identity <= 30;

  const routineHigh = s.routine >= 70;
  const routineLow = s.routine <= 40;

  // 1) “매우 특징적인” 타입부터 우선 매칭
  if (clutterHigh && focusHigh && identityHigh) return "FIRE_DEADLINE_CREATIVE";
  if (clutterLow && focusHigh && routineHigh && identityLow) return "TACTICAL_ROUTINE_MASTER";
  if (clutterLow && identityLow && routineHigh) return "MINIMAL_ZEN";
  if (clutterHigh && identityHigh && focusLow) return "IMPULSIVE_COLLECTOR";

  // 2) 역할 기반
  if (focusHigh && identityLow && routineLow) return "HYPERFOCUS_CODER";
  if (identityHigh && routineHigh && (f.warm_lighting_present || f.plants_count >= 2)) return "COZY_HEALER";
  if (clutterLow && routineHigh && focusHigh) return "PERFECTION_MANAGER";
  if (focusHigh && routineLow && (f.trash_detected || f.bed_side_phone_charger_present)) return "NIGHT_GAMER";

  // 3) 테마 기반
  if (f.books_count >= 12 && f.sticky_notes_count >= 3) return "STUDY_BEAST";
  if (
  clutterHigh &&
  identityHigh &&
  (f.collectibles_count > 0 || f.art_supplies_present)
)
  return "SCATTERED_SPARK";if (f.bed_messiness >= 0.6 && f.desk_clutter_ratio >= 0.5) return "BED_CENTRIC";
  if (f.plants_count >= 3 && !f.trash_detected) return "NATURE_SYNC";
  if (f.art_supplies_present || f.instrument_present) return "ARTIST_IN_FLOW";
  if (f.laundry_detected && (f.collectibles_count === 0) && (f.books_count < 5)) return "SURVIVAL_OFFICE_WORKER";

  // 4) fallback
  if (clutterHigh && routineLow) return "UNFINISHED_PROJECTOR";
  if (routineHigh) return "GODSAENG_KING";

  return "SCATTERED_SPARK";
}

export function buildResult(f: VisionFeatures) {
  const scores = computeScores(f);
  const archetypeId = pickArchetype(f, scores);
  const archetype = ARCHETYPES[archetypeId];
  return { scores, archetype };
}