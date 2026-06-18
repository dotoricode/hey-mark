export type Industry =
  | "cafe"
  | "ecommerce"
  | "b2b-saas"
  | "education"
  | "wellness"
  | "creator";

export type AdviceRequest = {
  industry: Industry;
  product: string;
  targetCustomer: string;
  goal: string;
  budgetLevel: string;
  channels: string;
  currentProblem: string;
};

export type AdviceResponse = {
  diagnosis: string;
  focus: string[];
  actions: string[];
  copyExamples: string[];
  metrics: string[];
  sources: Array<{
    title: string;
    note: string;
  }>;
};

const industryProfiles: Record<
  Industry,
  {
    label: string;
    trustLever: string;
    firstMove: string;
    offer: string;
    metrics: string[];
    source: string;
  }
> = {
  cafe: {
    label: "카페",
    trustLever: "동네성, 메뉴 사진, 재방문 이유",
    firstMove: "대표 메뉴 하나를 방문 명분으로 만들고 반경 1-2km 고객에게 반복 노출",
    offer: "첫 방문 세트, 평일 시간대 혜택, 리뷰 기반 메뉴 추천",
    metrics: ["방문 쿠폰 저장", "지도 검색 유입", "리뷰 증가", "재방문 스탬프 사용"],
    source: "로컬 매장은 광고 스케일보다 방문 명분과 반복 노출이 먼저다."
  },
  ecommerce: {
    label: "이커머스",
    trustLever: "상세페이지 증거, 후기, 명확한 오퍼",
    firstMove: "상품의 첫 화면에서 고객 문제가 바로 보이게 만들기",
    offer: "입문 번들, 무료배송 임계값, 첫 구매 리스크 제거",
    metrics: ["상세페이지 체류", "장바구니 전환", "구매 전환율", "재구매율"],
    source: "커머스는 소재보다 오퍼와 상세페이지의 이해 속도가 전환을 좌우한다."
  },
  "b2b-saas": {
    label: "B2B SaaS",
    trustLever: "업무 손실 절감, 사례, 의사결정자 언어",
    firstMove: "ICP별 문제 문장을 분리하고 리드 자산으로 신뢰 형성",
    offer: "진단 리포트, 계산기, 웨비나, 파일럿",
    metrics: ["리드 전환", "데모 예약", "활성 계정", "세일즈 응답률"],
    source: "B2B는 즉시 구매보다 문제 인식과 내부 설득 자료가 먼저다."
  },
  education: {
    label: "교육/강의",
    trustLever: "전문성, 커리큘럼, 수강 후 변화",
    firstMove: "수강생의 현재 수준과 도착점을 명확히 나누기",
    offer: "무료 진단, 첫 강의 샘플, 결과물 기반 커리큘럼",
    metrics: ["상담 신청", "샘플 강의 시청", "결제 전환", "완강률"],
    source: "교육 상품은 막연한 전문성보다 수강 후 변화가 팔린다."
  },
  wellness: {
    label: "병원/웰니스",
    trustLever: "안전성, 설명, 지역 신뢰",
    firstMove: "효능 단정보다 고객 불안 해소형 FAQ를 먼저 쌓기",
    offer: "상담 체크리스트, 예약 전 안내, 후기 기반 궁금증 해소",
    metrics: ["상담 예약", "전화 문의", "FAQ 조회", "재방문율"],
    source: "규제 산업은 과장보다 신뢰와 설명 가능성이 전환을 만든다."
  },
  creator: {
    label: "크리에이터/개인브랜드",
    trustLever: "관점, 반복 포맷, 관계 밀도",
    firstMove: "콘텐츠 주제를 넓히기보다 기억되는 시리즈를 만들기",
    offer: "뉴스레터, 소규모 커뮤니티, 상담/템플릿",
    metrics: ["저장", "댓글", "구독 전환", "문의 전환"],
    source: "개인브랜드는 정보량보다 일관된 관점과 반복 포맷이 자산이다."
  }
};

function clean(value: string, fallback: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function createAdvice(input: AdviceRequest): AdviceResponse {
  const profile = industryProfiles[input.industry];
  const product = clean(input.product, profile.label);
  const target = clean(input.targetCustomer, "핵심 고객");
  const goal = clean(input.goal, "전환 개선");
  const channels = clean(input.channels, "가장 반응이 빠른 채널");
  const problem = clean(input.currentProblem, "메시지가 선명하지 않은 상태");
  const budget = clean(input.budgetLevel, "소액");

  return {
    diagnosis: `${profile.label}의 현재 과제는 ${target}에게 ${product}를 선택해야 할 이유를 더 빨리 이해시키는 것입니다. 현재 문제: ${problem}. ${goal}보다 먼저 오퍼와 첫 메시지를 좁혀야 합니다.`,
    focus: [
      profile.firstMove,
      `${budget} 예산에서는 채널을 넓히기보다 ${channels}에서 반복 가능한 작은 실험을 설계`,
      `${profile.trustLever} 같은 신뢰 요소를 콘텐츠 전면에 배치`
    ],
    actions: [
      `${product}의 대표 고객 상황을 한 문장으로 정의하고 모든 소재 첫 줄에 반영`,
      `다음 오퍼 후보 중 하나만 골라 7일 동안 테스트: ${profile.offer}`,
      `${channels}에 맞춰 문제 제기형, 증거형, 제안형 소재를 각각 2개씩 제작`,
      `방문/상담/구매 직전의 망설임을 FAQ 5개로 만들고 상세 화면에 배치`,
      `성과 판단 기준은 ${profile.metrics.slice(0, 2).join(", ")} 두 가지로 제한`
    ],
    copyExamples: [
      `${target}이 가장 자주 겪는 불편을 먼저 보여주고, ${product}를 해결 장면으로 연결하세요.`,
      `오퍼는 "${profile.offer}" 중 하나만 전면에 세워 선택 이유가 보이게 표현하세요.`,
      `${channels}에서는 "왜 지금", "왜 여기", "왜 이 제품"이 한 화면 안에 들어와야 합니다.`
    ],
    metrics: profile.metrics,
    sources: [
      {
        title: `${profile.label} 산업 프로파일`,
        note: profile.source
      },
      {
        title: "Hey Mark 지식베이스 원칙",
        note: "광고비 확대 전에 고객 문제, 오퍼, 증거, 채널 반복성을 먼저 점검한다."
      }
    ]
  };
}

export const industries = Object.entries(industryProfiles).map(([value, profile]) => ({
  value,
  label: profile.label
}));
