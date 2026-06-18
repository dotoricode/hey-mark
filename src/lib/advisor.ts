import { marketing0Knowledge } from "@/lib/marketing0Knowledge";

export type CafeProfile = {
  placeHint: string;
  currentProblem: string;
  goal: string;
  knownSignals: string;
};

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StrategyQuestion = {
  id: string;
  label: string;
  reason: string;
  suggestions: string[];
};

export type StrategyPlay = {
  title: string;
  oneLine: string;
  whyItWorks: string;
  steps: string[];
  copy: string[];
  metric: string;
  risk: string;
};

export type StrategyArtifact = {
  title: string;
  plainSummary: string;
  hiddenInsight: string;
  confidence: number;
  focus: Array<{
    label: string;
    value: number;
  }>;
  assumedFacts: string[];
  questions: StrategyQuestion[];
  plays: StrategyPlay[];
  timeline: Array<{
    label: string;
    task: string;
  }>;
  sourceNotes: string[];
};

export type CafeCopilotResponse = {
  mode: "gemini" | "fallback";
  assistantMessage: string;
  intentShortcuts: string[];
  artifact: StrategyArtifact;
  retrievalNotes: string[];
};

export type CafeCopilotRequest = {
  profile?: Partial<CafeProfile>;
  messages?: ConversationMessage[];
};

const defaults: CafeProfile = {
  placeHint: "네이버지도 링크 또는 카페명",
  currentProblem:
    "가오픈 때는 많이 방문했지만 정식 오픈 후 방문율이 떨어졌고, 재방문 고객은 30-40% 정도입니다.",
  goal: "평일 오전과 낮 방문을 늘리고 싶습니다.",
  knownSignals: "가오픈 때 커피 구매 시 디저트 2개 증정 행사는 반응이 컸습니다."
};

const maxLengths: Record<keyof CafeProfile, number> = {
  placeHint: 500,
  currentProblem: 900,
  goal: 300,
  knownSignals: 700
};

function cleanText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") {
    return fallback;
  }

  const compact = value.replace(/\s+/g, " ").trim();
  return (compact || fallback).slice(0, maxLength);
}

export function normalizeCafeProfile(input: unknown): CafeProfile {
  const raw = typeof input === "object" && input !== null ? input : {};

  return Object.fromEntries(
    (Object.keys(defaults) as Array<keyof CafeProfile>).map((key) => [
      key,
      cleanText(
        (raw as Partial<CafeProfile>)[key],
        defaults[key],
        maxLengths[key]
      )
    ])
  ) as CafeProfile;
}

function normalizeMessages(input: unknown): ConversationMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((message) => {
      if (
        typeof message !== "object" ||
        message === null ||
        !("content" in message)
      ) {
        return null;
      }

      const role = (message as Partial<ConversationMessage>).role;
      const content = cleanText(
        (message as Partial<ConversationMessage>).content,
        "",
        900
      );

      if (!content) {
        return null;
      }

      return {
        role: role === "assistant" ? "assistant" : "user",
        content
      };
    })
    .filter((message): message is ConversationMessage => message !== null)
    .slice(-10);
}

export function normalizeCafeCopilotRequest(
  payload: unknown
): {
  profile: CafeProfile;
  messages: ConversationMessage[];
} {
  const raw = typeof payload === "object" && payload !== null ? payload : {};

  return {
    profile: normalizeCafeProfile((raw as CafeCopilotRequest).profile),
    messages: normalizeMessages((raw as CafeCopilotRequest).messages)
  };
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return text.slice(first, last + 1);
  }

  return text;
}

function parseGeminiJson(text: string) {
  const jsonText = extractJson(text);

  try {
    return JSON.parse(jsonText) as Partial<CafeCopilotResponse>;
  } catch {
    return JSON.parse(jsonText.replace(/[\u0000-\u001F\u007F]/g, " ")) as Partial<CafeCopilotResponse>;
  }
}

const stringArraySchema = {
  type: "array",
  items: { type: "string" }
};

const cafeCopilotResponseSchema = {
  type: "object",
  properties: {
    assistantMessage: { type: "string" },
    intentShortcuts: stringArraySchema,
    artifact: {
      type: "object",
      properties: {
        title: { type: "string" },
        plainSummary: { type: "string" },
        hiddenInsight: { type: "string" },
        confidence: { type: "number" },
        focus: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "number" }
            },
            required: ["label", "value"]
          }
        },
        assumedFacts: stringArraySchema,
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              reason: { type: "string" },
              suggestions: stringArraySchema
            },
            required: ["id", "label", "reason", "suggestions"]
          }
        },
        plays: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              oneLine: { type: "string" },
              whyItWorks: { type: "string" },
              steps: stringArraySchema,
              copy: stringArraySchema,
              metric: { type: "string" },
              risk: { type: "string" }
            },
            required: [
              "title",
              "oneLine",
              "whyItWorks",
              "steps",
              "copy",
              "metric",
              "risk"
            ]
          }
        },
        timeline: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              task: { type: "string" }
            },
            required: ["label", "task"]
          }
        },
        sourceNotes: stringArraySchema
      },
      required: [
        "title",
        "plainSummary",
        "hiddenInsight",
        "confidence",
        "focus",
        "assumedFacts",
        "questions",
        "plays",
        "timeline",
        "sourceNotes"
      ]
    }
  },
  required: ["assistantMessage", "intentShortcuts", "artifact"]
};

function asStringArray(value: unknown, fallback: string[], limit = 6) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const values = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);

  return values.length > 0 ? values : fallback;
}

function normalizeArtifact(value: unknown, fallback: StrategyArtifact) {
  if (typeof value !== "object" || value === null) {
    return fallback;
  }

  const raw = value as Partial<StrategyArtifact>;
  const focus = Array.isArray(raw.focus)
    ? raw.focus
        .map((item) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          const label = cleanText(
            (item as { label?: unknown }).label,
            "",
            40
          );
          const value = Number((item as { value?: unknown }).value);

          if (!label || Number.isNaN(value)) {
            return null;
          }

          return { label, value: clamp(value, 0, 100) };
        })
        .filter((item): item is { label: string; value: number } => item !== null)
        .slice(0, 4)
    : fallback.focus;

  const questions = Array.isArray(raw.questions)
    ? raw.questions
        .map((item, index) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          return {
            id: cleanText(
              (item as { id?: unknown }).id,
              `q${index + 1}`,
              24
            ),
            label: cleanText(
              (item as { label?: unknown }).label,
              fallback.questions[index]?.label ?? "확인이 필요한 정보",
              120
            ),
            reason: cleanText(
              (item as { reason?: unknown }).reason,
              fallback.questions[index]?.reason ?? "전략의 정확도를 높입니다.",
              160
            ),
            suggestions: asStringArray(
              (item as { suggestions?: unknown }).suggestions,
              fallback.questions[index]?.suggestions ?? ["모르겠어요"],
              4
            )
          };
        })
        .filter((item): item is StrategyQuestion => item !== null)
        .slice(0, 3)
    : fallback.questions;

  const plays = Array.isArray(raw.plays)
    ? raw.plays
        .map((item, index) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          const play = item as Partial<StrategyPlay>;
          const fallbackPlay = fallback.plays[index] ?? fallback.plays[0];

          return {
            title: cleanText(play.title, fallbackPlay.title, 80),
            oneLine: cleanText(play.oneLine, fallbackPlay.oneLine, 140),
            whyItWorks: cleanText(play.whyItWorks, fallbackPlay.whyItWorks, 260),
            steps: asStringArray(play.steps, fallbackPlay.steps, 5),
            copy: asStringArray(play.copy, fallbackPlay.copy, 4),
            metric: cleanText(play.metric, fallbackPlay.metric, 180),
            risk: cleanText(play.risk, fallbackPlay.risk, 180)
          };
        })
        .filter((item): item is StrategyPlay => item !== null)
        .slice(0, 3)
    : fallback.plays;

  const timeline = Array.isArray(raw.timeline)
    ? raw.timeline
        .map((item, index) => {
          if (typeof item !== "object" || item === null) {
            return null;
          }

          const fallbackItem = fallback.timeline[index] ?? fallback.timeline[0];

          return {
            label: cleanText(
              (item as { label?: unknown }).label,
              fallbackItem.label,
              40
            ),
            task: cleanText(
              (item as { task?: unknown }).task,
              fallbackItem.task,
              180
            )
          };
        })
        .filter((item): item is { label: string; task: string } => item !== null)
        .slice(0, 5)
    : fallback.timeline;

  return {
    title: cleanText(raw.title, fallback.title, 80),
    plainSummary: cleanText(raw.plainSummary, fallback.plainSummary, 260),
    hiddenInsight: cleanText(raw.hiddenInsight, fallback.hiddenInsight, 260),
    confidence: clamp(Number(raw.confidence) || fallback.confidence, 0, 100),
    focus: focus.length > 0 ? focus : fallback.focus,
    assumedFacts: asStringArray(raw.assumedFacts, fallback.assumedFacts, 6),
    questions,
    plays,
    timeline,
    sourceNotes: asStringArray(raw.sourceNotes, fallback.sourceNotes, 6)
  };
}

function buildFallbackArtifact(profile: CafeProfile): StrategyArtifact {
  const combined = `${profile.currentProblem} ${profile.knownSignals} ${profile.goal}`;
  const hadBigPromo = includesAny(combined, ["디저트", "증정", "가오픈", "행사", "많"]);
  const hasRepeat = includesAny(combined, ["30", "40", "재방문", "단골"]);
  const hasMap = includesAny(profile.placeHint, ["naver", "map", "지도", "place"]);

  return {
    title: "가오픈 수요를 평일 루틴으로 바꾸는 14일 실험",
    plainSummary:
      "방문 인구가 없는 문제가 아니라, 정식 오픈 후에도 오늘 다시 들를 이유가 약한 상태로 보입니다. 큰 증정을 반복하지 말고 시간대와 메뉴를 묶은 작은 명분을 먼저 만드세요.",
    hiddenInsight:
      "가오픈 혜택은 고객이 가격에만 반응했다는 뜻이 아니라, 근처 사람들이 이미 매장을 알아차릴 준비가 되어 있다는 신호입니다. 이제는 '싸서 방문'이 아니라 '내 동선에 넣기 쉬워서 방문'으로 바꿔야 합니다.",
    confidence: hasRepeat ? 76 : 62,
    focus: [
      { label: "방문 명분", value: 86 },
      { label: "지도 증거", value: hasMap ? 72 : 48 },
      { label: "재방문", value: hasRepeat ? 80 : 52 },
      { label: "콘텐츠", value: 58 }
    ],
    assumedFacts: [
      hadBigPromo
        ? "가오픈 프로모션은 단기 방문을 만들 만큼 강한 반응이 있었습니다."
        : "첫 방문 수요 검증은 아직 더 필요합니다.",
      hasRepeat
        ? "재방문율 30-40%는 제품 만족 신호로 볼 수 있습니다."
        : "재방문 만족도 신호는 아직 명확하지 않습니다.",
      "카페 업종은 광고 확장보다 네이버지도 증거, 메뉴 사진, 시간대별 방문 이유가 먼저 작동합니다."
    ],
    questions: [
      {
        id: "time-slot",
        label: "가장 비는 시간대가 언제인가요?",
        reason: "방문 명분은 시간대와 함께 설계해야 바로 실행됩니다.",
        suggestions: ["평일 오전", "점심 직후", "오후 3-5시", "아직 모름"]
      },
      {
        id: "hero-menu",
        label: "처음 온 손님에게 꼭 먹이고 싶은 메뉴 하나는요?",
        reason: "대표 메뉴 하나가 있어야 지도 사진, 리뷰 요청, 세트 제안이 모입니다.",
        suggestions: ["시그니처 음료", "소금빵/디저트", "커피+빵 세트", "아직 모름"]
      },
      {
        id: "contact",
        label: "가오픈 방문 고객에게 다시 닿을 방법이 있나요?",
        reason: "연락 채널이 있으면 신규 광고보다 회수 캠페인이 먼저입니다.",
        suggestions: ["인스타", "영수증/쿠폰", "없음", "일부만 가능"]
      }
    ],
    plays: [
      {
        title: "가오픈 고객 회수권",
        oneLine: "가오픈 때 온 사람에게만 보이는 듯한 7일 재초대 명분을 만듭니다.",
        whyItWorks:
          "사람이 몰렸던 이유를 큰 할인으로 반복하면 원가와 브랜드가 같이 무너집니다. 대신 '정식 메뉴를 다시 경험해 달라'는 감사권으로 방문 이유를 좁히면 재방문 고객을 회수하기 쉽습니다.",
        steps: [
          "네이버 소식, 인스타 고정글, 매장 입구에 같은 문구를 7일만 걸어둡니다.",
          "혜택은 디저트 2개 증정이 아니라 미니 베이커리 업그레이드처럼 작게 둡니다.",
          "사용 가능 시간을 평일 오전이나 낮처럼 빈 시간대로 제한합니다.",
          "방문 시 다음 방문용 작은 쿠폰 이미지를 전달합니다."
        ],
        copy: [
          "가오픈 때 와주셨다면, 이번엔 정식 메뉴로 다시 초대합니다.",
          "큰 증정보다 오래 기억될 한 조각으로 준비했습니다.",
          "이번 주 평일 낮에만 열어둔 감사권입니다."
        ],
        metric: "7일권 사용 수, 사용 시간대, 재방문 고객의 동행 여부",
        risk: "혜택이 너무 크면 정가 방문 이유가 약해지므로 업그레이드형으로 제한하세요."
      },
      {
        title: "동네 루틴 세트",
        oneLine: "카페를 '예쁜 곳'이 아니라 특정 시간에 들르는 습관으로 포지셔닝합니다.",
        whyItWorks:
          "로컬 카페는 멀리서 찾아오는 이유보다 반경 생활권에서 반복되는 이유가 중요합니다. 시간대 이름과 메뉴 조합을 고정하면 고객이 기억하기 쉽습니다.",
        steps: [
          "가장 비는 시간대를 하나 정하고 이름을 붙입니다.",
          "대표 메뉴 하나와 작은 디저트를 묶어 주문 결정을 줄입니다.",
          "네이버 대표사진과 인스타 첫 게시물 3개를 같은 세트로 맞춥니다.",
          "손님에게 '언제 오기 좋았는지'만 물어 다음 문구에 반영합니다."
        ],
        copy: [
          "평일 오전, 동네에서 가장 짧게 쉬는 루틴.",
          "커피 한 잔보다 오늘 동선에 들어오는 10분.",
          "처음 오면 이 조합부터 드셔보세요."
        ],
        metric: "지정 시간대 주문 수, 세트 선택률, 두 번째 방문 수",
        risk: "메뉴를 여러 개 밀면 기억이 흐려지므로 2주 동안 하나만 반복하세요."
      },
      {
        title: "네이버지도 증거 정리",
        oneLine: "처음 오는 사람이 방문 직전 확인하는 사진과 리뷰를 의도적으로 바꿉니다.",
        whyItWorks:
          "인스타 반응이 약할 때는 지도 저장, 길찾기, 메뉴 사진 리뷰가 더 직접적인 전환 신호입니다. 방문 직전 불안을 없애는 정보가 먼저 필요합니다.",
        steps: [
          "외관, 입구, 대표 메뉴, 좌석, 메뉴판 사진을 최신으로 맞춥니다.",
          "리뷰 요청은 '메뉴 사진 한 장만 남겨주세요'처럼 구체적으로 말합니다.",
          "블로그는 가는 길, 조용한 시간, 대표 메뉴 세 주제로 나눕니다.",
          "인스타는 좋아요보다 지도 저장으로 이어지는 문구를 씁니다."
        ],
        copy: [
          "처음 오시는 분은 지도 사진의 이 메뉴부터 보세요.",
          "길찾기 전에 메뉴와 좌석 분위기를 먼저 확인하세요.",
          "동네에서 조용한 시간대를 찾는 분께 맞춰둔 메뉴입니다."
        ],
        metric: "네이버 저장, 길찾기 클릭, 메뉴 사진 포함 리뷰 수",
        risk: "실제 사진과 매장 경험이 다르면 역효과가 나므로 과장 이미지는 피하세요."
      }
    ],
    timeline: [
      { label: "오늘", task: "대표 시간대와 대표 메뉴 하나를 정하고 모든 문구를 그 조합으로 맞춥니다." },
      { label: "3일", task: "네이버지도 사진 5장과 리뷰 요청 문구를 교체합니다." },
      { label: "7일", task: "가오픈 감사권을 빈 시간대 한정으로 운영합니다." },
      { label: "14일", task: "반응이 있는 시간대와 메뉴만 남기고 다음 캠페인 이름을 고정합니다." }
    ],
    sourceNotes: [
      "Marketing0 파생 원칙: 광고보다 판단 기준, 욕망 설계, 채널별 역할 분리를 사용했습니다.",
      "사용자 입력: 가오픈 반응, 정식 오픈 후 방문 하락, 재방문율 신호를 우선 반영했습니다.",
      hasMap
        ? "Gemini 연결 시 제공된 URL은 URL context 도구로 접근을 시도합니다."
        : "지도/블로그 링크가 없으면 외부 페이지 분석은 수행하지 않습니다."
    ]
  };
}

function buildSystemInstruction() {
  const principles = marketing0Knowledge.derivedPrinciples
    .map((principle) => `- ${principle.title}: ${principle.note}`)
    .join("\n");

  return [
    "You are Hey Mark, a Korean cafe marketing copilot for non-expert cafe owners.",
    "Answer in Korean. Be concrete, plain, and operational.",
    "Never write generic strategy words without a specific customer moment, offer, step, metric, and risk.",
    "Use the user's cafe context first. If links are available, use URL context only as supporting evidence and do not claim inaccessible data was retrieved.",
    "Actively ask up to 3 follow-up questions when information is ambiguous or missing.",
    "Return JSON only. No markdown fences.",
    "Marketing0 derived principles:",
    principles,
    `Knowledge limitation: ${marketing0Knowledge.sufficiency}. Do not pretend this is a complete cafe corpus.`
  ].join("\n");
}

function buildPrompt(profile: CafeProfile, messages: ConversationMessage[]) {
  const recentConversation = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return [
    "Create a cafe marketing strategy artifact.",
    "",
    "Required JSON shape:",
    JSON.stringify(
      {
        assistantMessage: "string",
        intentShortcuts: ["string", "string", "string"],
        artifact: {
          title: "string",
          plainSummary: "string",
          hiddenInsight: "string",
          confidence: 0,
          focus: [
            { label: "string", value: 0 },
            { label: "string", value: 0 }
          ],
          assumedFacts: ["string"],
          questions: [
            {
              id: "string",
              label: "string",
              reason: "string",
              suggestions: ["string"]
            }
          ],
          plays: [
            {
              title: "string",
              oneLine: "string",
              whyItWorks: "string",
              steps: ["string"],
              copy: ["string"],
              metric: "string",
              risk: "string"
            }
          ],
          timeline: [{ label: "string", task: "string" }],
          sourceNotes: ["string"]
        }
      },
      null,
      2
    ),
    "",
    "Cafe profile:",
    `- placeHint: ${profile.placeHint}`,
    `- currentProblem: ${profile.currentProblem}`,
    `- goal: ${profile.goal}`,
    `- knownSignals: ${profile.knownSignals}`,
    "",
    "Recent conversation:",
    recentConversation || "No conversation yet.",
    "",
    "Rules:",
    "- Make the first strategy feel like an idea the owner can execute tomorrow.",
    "- If the owner gave a Naver Map, Instagram, or blog URL, analyze it through URL context when accessible and include retrieval caveats in sourceNotes.",
    "- If data is missing, ask questions inside artifact.questions and still provide a provisional idea.",
    "- Do not ask for information that can be inferred from an accessible URL.",
    "- Keep each play creative but measurable."
  ].join("\n");
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function requestGeminiContent(
  profile: CafeProfile,
  messages: ConversationMessage[],
  useTools: boolean
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: buildSystemInstruction() }]
        },
        contents: [
          {
            parts: [{ text: buildPrompt(profile, messages) }]
          }
        ],
        ...(useTools
          ? { tools: [{ url_context: {} }, { google_search: {} }] }
          : {}),
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          responseFormat: {
            text: {
              mimeType: "application/json",
              schema: cafeCopilotResponseSchema
            }
          }
        }
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with ${response.status}`);
  }

  return (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      url_context_metadata?: {
        url_metadata?: Array<{
          retrieved_url?: string;
          url_retrieval_status?: string;
        }>;
      };
    }>;
  };
}

async function callGemini(
  profile: CafeProfile,
  messages: ConversationMessage[],
  fallback: StrategyArtifact
) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      ok: false as const,
      reason:
        "GEMINI_API_KEY was not available in the server environment at request time."
    };
  }

  let data: Awaited<ReturnType<typeof requestGeminiContent>>;
  const notes: string[] = [];

  try {
    data = await requestGeminiContent(profile, messages, true);
  } catch (toolError) {
    notes.push(
      `Gemini URL/Search tool attempt failed: ${errorMessage(toolError)}`
    );
    data = await requestGeminiContent(profile, messages, false);
    notes.push("Retried Gemini without URL/Search tools.");
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  const parsed = parseGeminiJson(text);
  const urlNotes =
    candidate?.url_context_metadata?.url_metadata?.map((item) =>
      `${item.retrieved_url ?? "URL"}: ${item.url_retrieval_status ?? "unknown"}`
    ) ?? [];

  return {
    ok: true as const,
    assistantMessage: cleanText(
      parsed.assistantMessage,
      "좋아요. 지금 정보만으로도 첫 실행안을 만들고, 부족한 부분은 질문으로 좁혀볼게요.",
      280
    ),
    intentShortcuts: asStringArray(parsed.intentShortcuts, [
      "가장 먼저 할 일만 보여줘",
      "돈 안 쓰는 방식으로 바꿔줘",
      "인스타/네이버 문구를 더 써줘"
    ]),
    artifact: normalizeArtifact(parsed.artifact, fallback),
    retrievalNotes: [...notes, ...urlNotes]
  };
}

export async function createCafeCopilotResponse(
  request: {
    profile: CafeProfile;
    messages: ConversationMessage[];
  }
): Promise<CafeCopilotResponse> {
  const fallback = buildFallbackArtifact(request.profile);

  try {
    const gemini = await callGemini(request.profile, request.messages, fallback);

    if (gemini.ok) {
      return {
        mode: "gemini",
        assistantMessage: gemini.assistantMessage,
        intentShortcuts: gemini.intentShortcuts,
        artifact: gemini.artifact,
        retrievalNotes: gemini.retrievalNotes
      };
    }

    return {
      mode: "fallback",
      assistantMessage:
        "지금은 Gemini가 서버에서 연결되지 않아 기본 플레이북으로 먼저 답할게요. 그래도 입력한 신호 기준으로 바로 실행할 수 있는 안부터 좁혔습니다.",
      intentShortcuts: [
        "가장 먼저 할 일만 보여줘",
        "돈 안 쓰는 방식으로 바꿔줘",
        "인스타/네이버 문구를 더 써줘"
      ],
      artifact: fallback,
      retrievalNotes: [
        gemini.reason,
        "Set GEMINI_API_KEY in the deployment environment and redeploy if this appears in production."
      ]
    };
  } catch (error) {
    console.error(error);

    return {
      mode: "fallback",
      assistantMessage:
        "Gemini 호출이 실패해 기본 플레이북으로 먼저 답할게요. 배포 환경의 진단 메모를 확인하면 원인을 좁힐 수 있습니다.",
      intentShortcuts: [
        "가장 먼저 할 일만 보여줘",
        "돈 안 쓰는 방식으로 바꿔줘",
        "인스타/네이버 문구를 더 써줘"
      ],
      artifact: fallback,
      retrievalNotes: [
        `Gemini fallback reason: ${errorMessage(error)}`,
        "If the key is present, check GEMINI_MODEL access and whether built-in URL/Search tools are enabled for the selected model."
      ]
    };
  }
}
