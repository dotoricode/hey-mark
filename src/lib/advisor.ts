import { marketing0Knowledge } from "@/lib/marketing0Knowledge";

export type CafeBrief = {
  cafeName: string;
  region: string;
  nearbyContext: string;
  populationNotes: string;
  ageGroups: string;
  cafeSize: string;
  signatureMenu: string;
  priceRange: string;
  openingStatus: string;
  instagramHandle: string;
  naverMapUrl: string;
  blogUrls: string;
  currentProblem: string;
  promoHistory: string;
  repeatRate: string;
  goal: string;
  budgetLevel: string;
};

export type StrategyPlay = {
  name: string;
  why: string;
  actions: string[];
  offer: string;
  copy: string[];
  metric: string;
};

export type CafeAdviceResponse = {
  diagnosis: string;
  strategicRead: string[];
  immediateDecision: string;
  plays: StrategyPlay[];
  fourteenDayPlan: Array<{
    day: string;
    task: string;
  }>;
  localAnalysis: string[];
  contentIdeas: string[];
  measurement: string[];
  dataGaps: string[];
  knowledgeStatus: {
    youtube: string;
    externalAnalysis: string;
  };
  sources: Array<{
    title: string;
    note: string;
  }>;
};

const maxLengths: Record<keyof CafeBrief, number> = {
  cafeName: 80,
  region: 120,
  nearbyContext: 500,
  populationNotes: 500,
  ageGroups: 220,
  cafeSize: 120,
  signatureMenu: 220,
  priceRange: 120,
  openingStatus: 160,
  instagramHandle: 120,
  naverMapUrl: 300,
  blogUrls: 700,
  currentProblem: 900,
  promoHistory: 700,
  repeatRate: 80,
  goal: 180,
  budgetLevel: 80
};

const defaults: CafeBrief = {
  cafeName: "우리 카페",
  region: "동네 상권",
  nearbyContext: "주거지와 학교, 소형 사무실이 섞인 반경 1-2km 상권",
  populationNotes: "가오픈 때 방문 인구가 많았고, 정식 오픈 후 방문율이 낮아짐",
  ageGroups: "오전~낮 시간을 쓰는 동네 주민과 학생",
  cafeSize: "소형 매장",
  signatureMenu: "시그니처 음료와 베이커리",
  priceRange: "중간 가격대",
  openingStatus: "정식 오픈 초기",
  instagramHandle: "",
  naverMapUrl: "",
  blogUrls: "",
  currentProblem:
    "인스타그램 관심도가 낮고 정식 오픈 이후 방문율이 떨어졌지만 재방문 고객은 30-40% 수준",
  promoHistory: "가오픈 때 커피 구매 시 디저트 2개 증정 행사로 많은 방문을 만들었음",
  repeatRate: "30-40%",
  goal: "평일 오전과 낮 방문 증가",
  budgetLevel: "중간"
};

function cleanText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) {
    return fallback;
  }

  return compact.slice(0, maxLength);
}

export function normalizeCafeBrief(input: unknown): CafeBrief {
  const raw = typeof input === "object" && input !== null ? input : {};

  return Object.fromEntries(
    (Object.keys(defaults) as Array<keyof CafeBrief>).map((key) => [
      key,
      cleanText(
        (raw as Partial<CafeBrief>)[key],
        defaults[key],
        maxLengths[key]
      )
    ])
  ) as CafeBrief;
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function parseRepeatSignal(repeatRate: string) {
  const match = repeatRate.match(/\d+/);
  const value = match ? Number(match[0]) : 0;

  if (value >= 30) {
    return {
      label: "재방문은 강한 편",
      implication:
        "제품 만족 문제라기보다 첫 방문을 다시 부르는 장치와 동네 노출 빈도가 부족할 가능성이 큽니다."
    };
  }

  return {
    label: "재방문 검증이 더 필요",
    implication:
      "방문 수를 키우기 전에 메뉴 만족, 좌석 경험, 가격 저항을 먼저 점검해야 합니다."
  };
}

function sourceLine(value: string, fallback: string) {
  return value.trim().length > 0 ? value : fallback;
}

export function createCafeAdvice(input: CafeBrief): CafeAdviceResponse {
  const brief = normalizeCafeBrief(input);
  const combined = [
    brief.currentProblem,
    brief.promoHistory,
    brief.populationNotes,
    brief.goal
  ].join(" ");
  const repeatSignal = parseRepeatSignal(brief.repeatRate);
  const hadBigPromo = includesAny(combined, ["디저트", "증정", "행사", "가오픈", "많은 인원"]);
  const lowInstagram = includesAny(combined, ["인스타", "Instagram", "관심도", "팔로워"]);
  const morningGoal = includesAny(combined, ["오전", "아침", "낮", "평일"]);

  const promoDiagnosis = hadBigPromo
    ? "가오픈 행사는 수요를 만든 것이 아니라 이미 있던 방문 가능 인구를 강하게 끌어낸 신호입니다. 문제는 그 인구를 정식 오픈 이후의 일상 방문 이유로 전환하지 못한 데 있습니다."
    : "방문 가능 인구가 실제로 얼마나 있는지 먼저 작은 오퍼로 검증해야 합니다.";

  const instagramDiagnosis = lowInstagram
    ? "인스타그램은 당장 팬덤 채널로 보기 어렵습니다. 대신 메뉴 발견, 영업시간 확인, 지도 검색 전환을 보조하는 증거 채널로 써야 합니다."
    : "인스타그램은 신규 고객 설득보다 방문 직전 확신을 주는 메뉴/공간 증거 채널로 운영하는 편이 안전합니다.";

  const timeSlot = morningGoal ? "오전 8-11시와 점심 직후" : "가장 좌석이 비는 시간대";
  const cafeLabel = `${brief.cafeName}(${brief.region})`;

  return {
    diagnosis: `${cafeLabel}의 핵심 문제는 "맛이 별로라서 안 오는 것"보다 "가오픈급 혜택이 사라진 뒤에도 굳이 오늘 들를 이유가 약한 것"에 가깝습니다. ${repeatSignal.label}이므로 기존 방문자의 만족 신호는 있습니다. 지금은 큰 할인보다 ${timeSlot}에 반복 방문할 명분을 만들고, 네이버지도/리뷰/동네 콘텐츠로 첫 방문 불안을 낮춰야 합니다.`,
    strategicRead: [
      promoDiagnosis,
      repeatSignal.implication,
      instagramDiagnosis,
      `${marketing0Knowledge.derivedPrinciples[0].title}: ${marketing0Knowledge.derivedPrinciples[0].note}`,
      `현재 입력 기준 주요 고객은 ${brief.ageGroups}입니다. 이 고객에게는 "예쁜 카페"보다 "오늘 동선에서 들를 이유"가 먼저 보여야 합니다.`,
      `대표 메뉴는 "${brief.signatureMenu}"입니다. 이 메뉴를 단순 소개가 아니라 시간대별 방문 명분으로 재포장해야 합니다.`
    ],
    immediateDecision:
      "다음 2주는 신규 할인 확대가 아니라 '첫 방문 회수'와 '평일 루틴화'에 집중하세요. 커피 구매 시 디저트 2개 같은 큰 증정은 재현하지 말고, 재방문을 조건으로 한 작은 혜택으로 바꿔야 합니다.",
    plays: [
      {
        name: "가오픈 고객 회수전",
        why: "가오픈 때 아침부터 사람이 몰렸다면 주변에 방문 가능한 인구는 이미 있습니다. 정식 오픈 후 이탈한 사람에게 다시 올 이유를 만들어야 합니다.",
        actions: [
          "매장 입구, 네이버 소식, 인스타 고정글에 '가오픈 때 와주신 분들을 위한 7일 재방문 메뉴'를 올립니다.",
          "혜택은 디저트 2개 증정이 아니라 '시그니처 음료 주문 시 미니 베이커리 1개 업그레이드'처럼 원가와 품질 인식을 지키는 방식으로 둡니다.",
          "방문 고객에게 다음 방문 시간대를 직접 지정하게 합니다: 오전 픽업, 점심 후 20분 휴식, 하교 후 간식.",
          "계산대에는 '다음 방문 때 보여주세요' 문구가 있는 작은 카드나 이미지 쿠폰을 둡니다."
        ],
        offer: "가오픈 감사 7일권: 시그니처 음료 + 미니 베이커리 업그레이드, 1인 1회, 평일 오전/낮 한정",
        copy: [
          "가오픈 때 와주셨다면, 이번엔 정식 메뉴로 다시 초대합니다.",
          `가장 조용한 시간에 다시 경험하는 "${brief.signatureMenu}" 7일 감사권을 열었습니다.`,
          "큰 증정보다 오래 맛있게 남을 메뉴로 준비했습니다."
        ],
        metric: "7일 동안 감사권 사용 수, 사용 시간대, 재방문 고객 중 신규 동행 비율"
      },
      {
        name: "평일 루틴 메뉴 만들기",
        why: "재방문율이 30-40%라면 반복 구매 가능한 메뉴 경험은 있습니다. 문제는 고객 머릿속에 '언제 가는 카페인지'가 고정되지 않은 것입니다.",
        actions: [
          `${timeSlot} 중 하나를 정해 '브리즈 타임' 같은 이름을 붙입니다.`,
          `대표 메뉴를 단품 홍보하지 말고 '등교 전 10분', '점심 후 빵 한 조각', '오전 산책 후 커피'처럼 상황으로 포장합니다.`,
          "한 메뉴만 2주간 반복 노출합니다. 메뉴판, 네이버 대표사진, 인스타 첫 3개 게시물의 메시지를 맞춥니다.",
          "좌석이 비는 시간대에는 사진용 세트보다 빠른 주문/포장 동선을 강조합니다."
        ],
        offer: "평일 루틴 세트: 시그니처 음료 + 작은 빵, 특정 시간대 500-1000원 수준의 체감 혜택",
        copy: [
          `${brief.region}에서 오전을 시작하는 가장 짧은 루틴.`,
          `오늘은 "${brief.signatureMenu}"으로 점심 전까지 버티는 날.`,
          "사진 찍으러 오는 카페보다, 내일도 들르게 되는 카페."
        ],
        metric: "지정 시간대 주문 수, 세트 선택률, 2회 이상 방문 고객 수"
      },
      {
        name: "네이버지도 증거 보강",
        why: "인스타 관심도가 낮을 때 신규 방문은 지도 검색, 리뷰 사진, 블로그 후기 같은 '방문 직전 증거'에서 더 많이 움직입니다.",
        actions: [
          "네이버지도 대표사진 5장을 정리합니다: 외관, 입구, 대표 메뉴, 좌석, 영업시간이 한눈에 보이는 사진.",
          "리뷰 요청 문구를 바꿉니다. '리뷰 부탁드려요'가 아니라 '처음 오는 분들이 메뉴 고르기 쉽게, 오늘 드신 메뉴 사진 한 장만 남겨주세요'라고 말합니다.",
          "동네 블로그 글은 3개 주제로 나눕니다: 가는 길, 대표 메뉴, 조용한 시간대. 대형 체험단보다 반경 생활권 블로그를 우선합니다.",
          "인스타에는 예쁜 사진보다 지도 저장을 유도하는 짧은 안내를 고정합니다."
        ],
        offer: "리뷰 보상은 큰 할인 대신 다음 방문용 사이즈업/미니 쿠키처럼 재방문 조건으로 설계",
        copy: [
          "처음 오시는 분은 이 메뉴부터 드셔보세요.",
          `${brief.region}에서 대표 메뉴를 찾는 분들을 위해 "${brief.signatureMenu}" 정보를 고정해뒀습니다.`,
          "네이버지도에서 저장해두면 조용한 시간대 소식을 먼저 볼 수 있어요."
        ],
        metric: "네이버 저장 수, 길찾기 클릭, 메뉴 사진 포함 리뷰 수, 블로그 유입 문의"
      }
    ],
    fourteenDayPlan: [
      {
        day: "1-2일차",
        task: "가오픈 감사 7일권 문구와 조건을 확정하고 매장/네이버/인스타 고정 영역에 같은 메시지로 배치"
      },
      {
        day: "3-4일차",
        task: "네이버지도 대표사진 5장과 메뉴 설명을 교체하고, 리뷰 요청 문구를 계산대에 붙이기"
      },
      {
        day: "5-7일차",
        task: `${timeSlot} 주문 수를 매일 기록하고 평일 루틴 세트의 메뉴/가격 저항을 확인`
      },
      {
        day: "8-10일차",
        task: "방문 고객에게 '어디서 보고 왔는지' 한 가지만 묻고 지도/지인/인스타/블로그로 표시"
      },
      {
        day: "11-14일차",
        task: "가장 반응이 큰 시간대와 메뉴만 남기고 다음 2주 캠페인 이름을 고정"
      }
    ],
    localAnalysis: [
      `지역/상권: ${sourceLine(brief.nearbyContext, brief.region)}`,
      `인구/연령 힌트: ${sourceLine(brief.populationNotes, brief.ageGroups)}`,
      `매장 규모: ${brief.cafeSize}. 규모가 작을수록 대량 방문보다 빈 시간대 반복 방문을 설계해야 합니다.`,
      `온라인 참고: Instagram ${sourceLine(brief.instagramHandle, "미입력")}, Naver Map ${sourceLine(brief.naverMapUrl, "미입력")}, Blog ${sourceLine(brief.blogUrls, "미입력")}`
    ],
    contentIdeas: [
      "가오픈 때 많이 나간 메뉴와 정식 오픈 대표 메뉴를 비교하는 짧은 게시물",
      "오전/낮 시간대 실제 좌석 분위기를 보여주는 10초 영상",
      "처음 오는 사람이 메뉴 고르는 순서: 시그니처 1개, 빵 1개, 포장 가능 여부",
      "네이버지도 저장을 유도하는 길찾기형 게시물",
      "단골이 다시 오는 이유를 메뉴보다 상황 중심으로 묻는 리뷰 카드"
    ],
    measurement: [
      "쿠폰 사용 수보다 시간대별 재방문 수를 먼저 봅니다.",
      "인스타 좋아요보다 네이버 저장, 길찾기, 메뉴 사진 리뷰를 봅니다.",
      "2주 동안 큰 할인 없이도 반복되는 주문 조합이 생기면 다음 캠페인 소재로 고정합니다.",
      "가오픈 수준의 방문 수를 목표로 잡지 말고, 평일 빈 시간대 주문 10-20% 증가를 1차 목표로 둡니다."
    ],
    dataGaps: [
      "정확한 지역명과 반경 1km 주요 시설",
      "네이버지도 현재 사진/리뷰/저장 수",
      "인스타그램 최근 10개 게시물의 도달/저장/프로필 방문",
      "시간대별 매출과 메뉴별 원가",
      "가오픈 방문 고객을 다시 연락할 수 있는 채널 여부"
    ],
    knowledgeStatus: {
      youtube:
        `Marketing0 분석 JSONL은 로드 가능한 일반 마케팅 관점 레이어로 충분합니다. 다만 ${marketing0Knowledge.videoCount}개 분석 중 transcript 기반 요약은 ${marketing0Knowledge.transcriptBackedCount}개이고, 카페/로컬 직접 사례는 부족합니다. 따라서 현재 답변은 이 관점 카드와 카페 임시 플레이북, 사용자가 입력한 맥락을 함께 사용합니다.`,
      externalAnalysis:
        "Instagram, Naver Map, 블로그 URL은 현재 참고 입력값으로만 사용합니다. 공식 API/허가 기반 수집이 붙기 전까지는 실제 페이지 내용을 자동 분석했다고 주장하지 않습니다."
    },
    sources: [
      {
        title: "사용자 제공 카페 상황",
        note: "가오픈 프로모션 반응, 정식 오픈 후 방문 하락, 30-40% 재방문율을 핵심 신호로 사용했습니다."
      },
      {
        title: "임시 카페 로컬 마케팅 카드",
        note: "큰 할인 반복보다 재방문 조건부 오퍼, 지도 증거, 시간대 루틴화를 우선합니다."
      },
      {
        title: "Marketing0 파생 지식 상태",
        note: "일반 마케팅 관점은 사용 가능하지만, 카페 전용 실행 지식은 별도 보강이 필요합니다."
      }
    ]
  };
}
