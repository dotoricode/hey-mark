"use client";

import { ArrowRight, ClipboardList, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CafeAdviceResponse, CafeBrief } from "@/lib/advisor";

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

const fieldGroups: Array<{
  title: string;
  fields: Array<{
    key: keyof CafeBrief;
    label: string;
    type?: "input" | "textarea" | "select";
    options?: string[];
  }>;
}> = [
  {
    title: "매장 기본",
    fields: [
      { key: "cafeName", label: "카페명" },
      { key: "region", label: "지역/상권" },
      { key: "nearbyContext", label: "주변 환경", type: "textarea" },
      { key: "cafeSize", label: "카페 규모" }
    ]
  },
  {
    title: "고객과 메뉴",
    fields: [
      { key: "ageGroups", label: "주요 연령층/고객" },
      { key: "populationNotes", label: "방문 인구 힌트", type: "textarea" },
      { key: "signatureMenu", label: "대표 메뉴" },
      { key: "priceRange", label: "가격대" }
    ]
  },
  {
    title: "온라인 정보",
    fields: [
      { key: "instagramHandle", label: "인스타그램 아이디" },
      { key: "naverMapUrl", label: "네이버지도 정보" },
      { key: "blogUrls", label: "관련 블로그 글", type: "textarea" }
    ]
  },
  {
    title: "현재 상황",
    fields: [
      { key: "openingStatus", label: "오픈 상태" },
      { key: "currentProblem", label: "현재 문제", type: "textarea" },
      { key: "promoHistory", label: "이전 행사/반응", type: "textarea" },
      { key: "repeatRate", label: "재방문율" },
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
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">H</div>
          <span>Hey Mark</span>
        </div>
        <div className="brief-list">
          <div className="brief-item">
            <strong>카페 전용</strong>
            <span>지역, 메뉴, 재방문율, 오픈 행사 반응을 먼저 해석합니다.</span>
          </div>
          <div className="brief-item">
            <strong>실행 중심</strong>
            <span>큰 말보다 14일 안에 해볼 수 있는 플레이를 제안합니다.</span>
          </div>
          <div className="brief-item">
            <strong>정직한 근거</strong>
            <span>외부 페이지와 유튜브 지식베이스의 현재 상태를 구분합니다.</span>
          </div>
        </div>
      </aside>

      <section className="main">
        <div className="workspace">
          <div className="topbar">
            <div className="title">
              <h1>Hey Mark</h1>
              <p>카페 사장을 위한 동네 상권 마케팅 전략 워크스페이스.</p>
            </div>
            <div className="status-pill" aria-label="Service status">
              <span className="status-dot" />
              카페 전략 모드
            </div>
          </div>

          <div className="notice">
            <MapPin size={18} aria-hidden="true" />
            <span>
              현재 버전은 입력한 정보 기준으로 전략을 만듭니다. 인스타그램, 네이버지도,
              블로그, 곽팀장 유튜브는 아직 자동 수집/학습하지 않습니다.
            </span>
          </div>

          <div className="grid cafe-grid">
            <section className="panel">
              <div className="panel-header">
                <h2>카페 브리프</h2>
              </div>
              <div className="form">
                {fieldGroups.map((group) => (
                  <div className="form-group" key={group.title}>
                    <h3>{group.title}</h3>
                    {group.fields.map((field) => (
                      <div className="field" key={field.key}>
                        <label htmlFor={field.key}>{field.label}</label>
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
                      </div>
                    ))}
                  </div>
                ))}

                <button className="submit" onClick={submitAdvice} disabled={isLoading}>
                  <Sparkles size={18} aria-hidden="true" />
                  {isLoading ? "분석 중" : "카페 전략 생성"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </section>

            <section className="panel output" aria-live="polite">
              {!advice ? (
                <div className="empty">
                  <div>
                    <ClipboardList size={34} aria-hidden="true" />
                    <p>카페 상황을 바탕으로 플레이북이 표시됩니다.</p>
                  </div>
                </div>
              ) : (
                <div className="advice">
                  <div className="diagnosis">
                    <h3>진단</h3>
                    <p>{advice.diagnosis}</p>
                  </div>

                  <div className="section">
                    <h3>전략 해석</h3>
                    <ul className="plain-list">
                      {advice.strategicRead.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="section decision">
                    <h3>지금 할 결정</h3>
                    <p>{advice.immediateDecision}</p>
                  </div>

                  <div className="section">
                    <h3>마케팅 플레이</h3>
                    <div className="playbook">
                      {advice.plays.map((play) => (
                        <article className="play" key={play.name}>
                          <h4>{play.name}</h4>
                          <p>{play.why}</p>
                          <strong>오퍼</strong>
                          <p>{play.offer}</p>
                          <strong>실행</strong>
                          <ol className="action-list">
                            {play.actions.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ol>
                          <strong>카피</strong>
                          <div className="copy-grid">
                            {play.copy.map((line) => (
                              <div className="copy-line" key={line}>
                                {line}
                              </div>
                            ))}
                          </div>
                          <span className="metric">측정: {play.metric}</span>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="section two-column">
                    <div>
                      <h3>14일 실행계획</h3>
                      <ol className="action-list">
                        {advice.fourteenDayPlan.map((item) => (
                          <li key={item.day}>
                            <strong>{item.day}</strong> {item.task}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h3>지역/채널 해석</h3>
                      <ul className="plain-list">
                        {advice.localAnalysis.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="section">
                    <h3>콘텐츠 아이디어</h3>
                    <div className="chips">
                      {advice.contentIdeas.map((idea) => (
                        <span className="chip" key={idea}>
                          {idea}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="section two-column">
                    <div>
                      <h3>측정</h3>
                      <ul className="plain-list">
                        {advice.measurement.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3>더 있으면 좋은 데이터</h3>
                      <ul className="plain-list">
                        {advice.dataGaps.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="section source-status">
                    <h3>지식베이스 상태</h3>
                    <p>{advice.knowledgeStatus.youtube}</p>
                    <p>{advice.knowledgeStatus.externalAnalysis}</p>
                  </div>

                  <div className="section">
                    <h3>근거</h3>
                    <div className="sources">
                      {advice.sources.map((source) => (
                        <div className="source" key={source.title}>
                          <strong>{source.title}</strong>
                          <span>{source.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
