// lib/archetypes.ts

export type ArchetypeId =
  | "FIRE_DEADLINE_CREATIVE"
  | "TACTICAL_ROUTINE_MASTER"
  | "MINIMAL_ZEN"
  | "IMPULSIVE_COLLECTOR"
  | "HYPERFOCUS_CODER"
  | "COZY_HEALER"
  | "PERFECTION_MANAGER"
  | "NIGHT_GAMER"
  | "STUDY_BEAST"
  | "SCATTERED_SPARK"
  | "BED_CENTRIC"
  | "NATURE_SYNC"
  | "ARTIST_IN_FLOW"
  | "UNFINISHED_PROJECTOR"
  | "SURVIVAL_OFFICE_WORKER"
  | "GODSAENG_KING";

export type Archetype = {
  id: ArchetypeId;
  name: string;
  oneLiner: string;
  vibeTags: string[]; // 카드용
  tips: string[];     // 3개 정도
};

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  FIRE_DEADLINE_CREATIVE: {
    id: "FIRE_DEADLINE_CREATIVE",
    name: "🔥 마감형 창의 폭발러",
    oneLiner: "혼돈 속에서 창의력이 터지는 타입.",
    vibeTags: ["#마감각성", "#아이디어폭주", "#정리=나중"],
    tips: ["‘진행중 박스’ 하나만 만들기", "침대 위 작업물은 1군데로 몰아두기", "케이블 1줄만이라도 정리"],
  },
  TACTICAL_ROUTINE_MASTER: {
    id: "TACTICAL_ROUTINE_MASTER",
    name: "🧠 루틴형 전략가",
    oneLiner: "계획이 곧 자신감. 시스템으로 사는 인간.",
    vibeTags: ["#플래너", "#체계", "#효율러"],
    tips: ["‘오늘 할 일 3개’만 유지", "책상 위는 2개 존으로 나누기(작업/보관)", "침구 정돈은 기본 버프"],
  },
  MINIMAL_ZEN: {
    id: "MINIMAL_ZEN",
    name: "🧘 미니멀 명상러",
    oneLiner: "물건이 적을수록 머리가 맑아지는 타입.",
    vibeTags: ["#미니멀", "#정갈", "#평온"],
    tips: ["‘새 물건 1개 = 버릴 것 1개’ 룰", "색/소재 톤 2개로 제한", "바닥은 늘 비워두기"],
  },
  IMPULSIVE_COLLECTOR: {
    id: "IMPULSIVE_COLLECTOR",
    name: "🎒 즉흥 수집가",
    oneLiner: "추억과 관심사가 방에 켜켜이 쌓인다.",
    vibeTags: ["#덕질", "#기념품", "#물건부자"],
    tips: ["수집 존을 ‘한 구역’으로 제한", "박스/포장지는 즉시 정리", "먼지 관리 루틴 만들기(주 1회)"],
  },
  HYPERFOCUS_CODER: {
    id: "HYPERFOCUS_CODER",
    name: "💻 하이퍼포커스 프로그래머",
    oneLiner: "몰입하면 시간 삭제. 외부 자극은 최소화.",
    vibeTags: ["#몰입", "#듀얼모니터", "#야행성"],
    tips: ["물/간식 스테이션을 책상에", "조명은 1개 메인 + 1개 보조", "침대에 노트북 가져가지 않기"],
  },
  COZY_HEALER: {
    id: "COZY_HEALER",
    name: "🌿 감성 힐링러",
    oneLiner: "따뜻함이 곧 생산성. 분위기에서 힘 얻는 타입.",
    vibeTags: ["#무드등", "#힐링", "#감성"],
    tips: ["간접조명 + 정리함 1개만 추가", "향/음악은 ‘작업용’과 분리", "식물은 1~2개로 시작"],
  },
  PERFECTION_MANAGER: {
    id: "PERFECTION_MANAGER",
    name: "🗂 완벽주의 관리자",
    oneLiner: "정리 자체가 안정감. 한 치의 흐트러짐도 싫다.",
    vibeTags: ["#정리왕", "#관리", "#깔끔"],
    tips: ["‘완벽’ 대신 ‘유지 가능’ 기준 세우기", "라벨링은 3종만 사용", "청소 루틴을 10분 단위로 쪼개기"],
  },
  NIGHT_GAMER: {
    id: "NIGHT_GAMER",
    name: "🎮 밤샘 게이머형",
    oneLiner: "밤이 시작이다. 세팅은 프로, 루틴은 프리.",
    vibeTags: ["#야간모드", "#셋업", "#수면부채"],
    tips: ["수면 시간 ‘고정 1개’만 지키기", "컵/간식 쓰레기 전용통 만들기", "케이블 정리로 발차기 사고 방지"],
  },
  STUDY_BEAST: {
    id: "STUDY_BEAST",
    name: "📚 학구열 폭주러",
    oneLiner: "공부 흔적이 방을 점령한다. 지식으로 근육 키움.",
    vibeTags: ["#노트더미", "#책", "#시험기간"],
    tips: ["‘이번 주’ 자료만 책상에", "필기/레퍼런스 존을 분리", "침대는 회복 구역으로 고정"],
  },
  SCATTERED_SPARK: {
    id: "SCATTERED_SPARK",
    name: "🌪 분산 에너지형",
    oneLiner: "관심사가 너무 많아. 시작은 10개, 완성은 1개.",
    vibeTags: ["#멀티취미", "#산만", "#아이디어"],
    tips: ["‘진행중 2개 룰’", "미완성은 박스에 모으기", "작업 시작 전 3분 타이머"],
  },
  BED_CENTRIC: {
    id: "BED_CENTRIC",
    name: "🛌 침대 중심형",
    oneLiner: "침대가 곧 우주. 모든 게 침대로 모인다.",
    vibeTags: ["#침대=본진", "#편안", "#올인원"],
    tips: ["침대 위 물건 3개 제한", "침대 옆 트레이/바구니 1개", "작업은 책상에서 ‘10분만’ 시작"],
  },
  NATURE_SYNC: {
    id: "NATURE_SYNC",
    name: "🪴 자연 동화형",
    oneLiner: "햇빛/식물/공기가 중요. 공간이 마음을 만든다.",
    vibeTags: ["#식물", "#자연광", "#환기"],
    tips: ["식물은 관리 쉬운 것부터", "창가 정리로 빛 확보", "주 2회 환기 루틴 고정"],
  },
  ARTIST_IN_FLOW: {
    id: "ARTIST_IN_FLOW",
    name: "🎨 예술 몰입형",
    oneLiner: "공간은 작업실. 흔적이 곧 증거다.",
    vibeTags: ["#작업실", "#창작", "#흔적미학"],
    tips: ["작업 도구는 ‘트레이’로 모으기", "완성/미완성 구역 분리", "먼지/오염 대비 커버 마련"],
  },
  UNFINISHED_PROJECTOR: {
    id: "UNFINISHED_PROJECTOR",
    name: "📦 미완성 프로젝트형",
    oneLiner: "언젠가 다 할 거야…(언젠가). 박스가 말해줌.",
    vibeTags: ["#미완성", "#박스", "#킵해둠"],
    tips: ["‘버릴까/남길까’ 2분 판단", "박스 라벨링(날짜/목적)", "한 달에 1개만 완성하기"],
  },
  SURVIVAL_OFFICE_WORKER: {
    id: "SURVIVAL_OFFICE_WORKER",
    name: "🧃 생존형 직장인",
    oneLiner: "살아남는 게 목표. 에너지 효율 최우선.",
    vibeTags: ["#피곤", "#컵", "#간편식"],
    tips: ["쓰레기/컵 정리만 해도 체감 큼", "물병 하나 고정", "침대 옆 충전 위치 정리"],
  },
  GODSAENG_KING: {
    id: "GODSAENG_KING",
    name: "🚀 갓생 루틴왕",
    oneLiner: "루틴이 곧 힘. 공간도 루틴에 맞춰 세팅됨.",
    vibeTags: ["#갓생", "#루틴", "#운동/비타민"],
    tips: ["루틴 도구는 눈에 보이게", "정리는 ‘저녁 5분’로 고정", "주간 체크리스트 1장만 유지"],
  },
};