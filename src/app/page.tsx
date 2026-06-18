"use client";

import { ArrowRight, BarChart3, ClipboardList, Database, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CafeAdviceResponse, CafeBrief } from "@/lib/advisor";
import { marketing0Knowledge } from "@/lib/marketing0Knowledge";

const initialForm: CafeBrief = {
  cafeName: "브리즈 커피",
  region: "동네 주거 상권",
  nearbyContext: "근처에 아파트, 학교, 작은 사무실이 있고 오전~낮 유동 인구가 있음",
  populationNotes: "가오픈 때 아침부터 많은 인원이 방문했음. 방문 가능 인구는 확인됨",
  ageGroups: "오전~낮 시간을 활용하는 동네 주민, 학생, 근처 직장인",
  cafeSize: "소형 카페, 좌석 수가 많지는 않음",
  signatureMenu: "시그니처 브리즈와 빵",
  priceRange: "중간 가격대",
  openingStatus: "정식 오픈 초기",
  instagramHandle: "@breeze_coffee",
  naverMapUrl: "네이버지도 URL 또는 업체명",
  blogUrls: "관련 블로그 글 URL이 있으면 줄바꿈으로 입력",
  currentProblem:
    "인스타그램 관심도 적고, 가오픈 때는 커피사면 디저트 2개 주는 행사로 많은 인원이 방문했지만 실제 오픈 이후 방문율이 떨어짐",
  promoHistory: "가오픈 때 커피 구매 시 디저트 2개 증정. 아침부터 방문자가 많았음",
  repeatRate: "30-40%",
  goal: "평일 오전, 오후 방문 증가",
  budgetLevel: "중간"
};

const strips: Array<{
  title: string;
  fields: Array<{
    key: keyof CafeBrief;
    label: string;
    type?: "input" | "textarea" | "select";
    options?: string[];
  }>;
}> = [
  {
    title: "매장",
    fields: [
      { key: "cafeName", label: "카페명" },
      { key: "region", label: "지역/상권" },
      { key: "cafeSize", label: "규모" },
      { key: "openingStatus", label: "오픈 상태" }
    ]
  },
  {
    title: "상권",
    fields: [
      { key: "nearbyContext", label: "주변 환경", type: "textarea" },
      { key: "populationNotes", label: "방문 인구 힌트", type: "textarea" },
      { key: "ageGroups", label: "주요 고객" }
    ]
  },
  {
    title: "메뉴",
    fields: [
      { key: "signatureMenu", label: "대표 메뉴" },
      { key: "priceRange", label: "가격대" },
      { key: "repeatRate", label: "재방문율" }
    ]
  },
  {
    title: "채널",
    fields: [
      { key: "instagramHandle", label: "인스타그램" },
      { key: "naverMapUrl", label: "네이버지도" },
      { key: "blogUrls", label: "블로그", type: "textarea" }
    ]
  },
  {
    title: "문제",
    fields: [
      { key: "currentProblem", label: "현재 문제", type: "textarea" },
      { key: "promoHistory", label: "이전 행사/반응", type: "textarea" },
      { key: "goal", label: "목표" },
      {
        key: "budgetLevel",
        label: "예산",
        type: "select",
        options: ["없음", "소액", "중간", "큼"]
      }
    ]
  }
];

export default function Home() {
  const [form, setForm] = useState<CafeBrief>(initialForm);
  const [advice, setAdvice] = useState<CafeAdviceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submitAdvice() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setAdvice((await response.json()) as CafeAdviceResponse);
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(key: keyof CafeBrief, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="strip-shell">
      <section className="hero-strip">
        <div>
          <div className="brand">
            <div className="brand-mark">H</div>
            <span>Hey Mark</span>
          </div>
          <h1>카페 사장을 위한 마케팅 대시보드</h1>
          <p>가오픈 반응, 재방문율, 지역 상권, 메뉴, 온라인 채널을 한 줄씩 읽고 바로 실행할 플레이를 만듭니다.</p>
        </div>
        <button className="submit hero-action" onClick={submitAdvice} disabled={isLoading}>
          <Sparkles size={18} aria-hidden="true" />
          {isLoading ? "분석 중" : "전략 생성"}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </section>

      <section className="metric-strip">
        <div className="metric-tile">
          <Database size={18} aria-hidden="true" />
          <strong>{marketing0Knowledge.videoCount}개</strong>
          <span>Marketing0 분석</span>
        </div>
        <div className="metric-tile">
          <BarChart3 size={18} aria-hidden="true" />
          <strong>{marketing0Knowledge.transcriptBackedCount}개</strong>
          <span>transcript 기반 요약</span>
        </div>
        <div className="metric-tile wide">
          <span>판단</span>
          <strong>LLM은 지금 필수 아님</strong>
          <span>현재 MVP는 규칙+지식카드로 충분, 개인화 합성부터 LLM 권장</span>
        </div>
      </section>

      <section className="notice-strip">
        원본 JSONL은 public repo에 넣지 않습니다. 현재 앱은 분석된 관점 카드와 카페 플레이북을 사용하며,
        인스타그램/네이버지도/블로그는 입력값으로만 참고합니다.
      </section>

      <section className="input-strips">
        {strips.map((strip) => (
          <div className="data-strip" key={strip.title}>
            <div className="strip-label">{strip.title}</div>
            <div className="strip-fields">
              {strip.fields.map((field) => (
                <label className="strip-field" key={field.key} htmlFor={field.key}>
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      id={field.key}
                      value={form[field.key]}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={field.key}
                      value={form[field.key]}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      value={form[field.key]}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="result-strip" aria-live="polite">
        {!advice ? (
          <div className="empty-strip">
            <ClipboardList size={30} aria-hidden="true" />
            <span>전략 생성 버튼을 누르면 strip 형태의 실행 대시보드가 표시됩니다.</span>
          </div>
        ) : (
          <div className="result-stack">
            <div className="insight-strip emphasis">
              <div className="strip-label">진단</div>
              <p>{advice.diagnosis}</p>
            </div>

            <div className="insight-strip">
              <div className="strip-label">해석</div>
              <ul className="strip-list">
                {advice.strategicRead.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="insight-strip decision-strip">
              <div className="strip-label">결정</div>
              <p>{advice.immediateDecision}</p>
            </div>

            {advice.plays.map((play) => (
              <article className="play-strip" key={play.name}>
                <div className="strip-label">{play.name}</div>
                <div className="play-body">
                  <p>{play.why}</p>
                  <div className="offer-line">{play.offer}</div>
                  <ol className="strip-list">
                    {play.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ol>
                  <div className="copy-row">
                    {play.copy.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                  <div className="metric-line">측정: {play.metric}</div>
                </div>
              </article>
            ))}

            <div className="insight-strip split-strip">
              <div>
                <div className="strip-label">14일</div>
                <ol className="strip-list">
                  {advice.fourteenDayPlan.map((item) => (
                    <li key={item.day}>
                      <strong>{item.day}</strong> {item.task}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <div className="strip-label">측정</div>
                <ul className="strip-list">
                  {advice.measurement.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="insight-strip split-strip">
              <div>
                <div className="strip-label">상권</div>
                <ul className="strip-list">
                  {advice.localAnalysis.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="strip-label">부족 데이터</div>
                <ul className="strip-list">
                  {advice.dataGaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="insight-strip">
              <div className="strip-label">콘텐츠</div>
              <div className="copy-row">
                {advice.contentIdeas.map((idea) => (
                  <span key={idea}>{idea}</span>
                ))}
              </div>
            </div>

            <div className="insight-strip source-strip">
              <div className="strip-label">근거</div>
              <div>
                <p>{advice.knowledgeStatus.youtube}</p>
                <p>{advice.knowledgeStatus.externalAnalysis}</p>
                <div className="source-row">
                  {advice.sources.map((source) => (
                    <span key={source.title}>
                      <strong>{source.title}</strong> {source.note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
