"use client";

import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { industries, type AdviceResponse, type Industry } from "@/lib/advisor";

type FormState = {
  industry: Industry;
  product: string;
  targetCustomer: string;
  goal: string;
  budgetLevel: string;
  channels: string;
  currentProblem: string;
};

const initialForm: FormState = {
  industry: "cafe",
  product: "시그니처 라떼와 디저트",
  targetCustomer: "퇴근 후 조용히 머물 곳을 찾는 20-30대 직장인",
  goal: "평일 저녁 방문 증가",
  budgetLevel: "소액",
  channels: "Instagram, Naver Map",
  currentProblem: "사진 반응은 있지만 실제 방문으로 잘 이어지지 않음"
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedIndustry = useMemo(
    () => industries.find((industry) => industry.value === form.industry),
    [form.industry]
  );

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

      setAdvice((await response.json()) as AdviceResponse);
    } finally {
      setIsLoading(false);
    }
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
            <strong>지식 구조</strong>
            <span>영상 원본 학습 대신 출처 추적형 인사이트를 검색합니다.</span>
          </div>
          <div className="brief-item">
            <strong>필수 산업</strong>
            <span>카페 프로파일을 기본값으로 포함했습니다.</span>
          </div>
          <div className="brief-item">
            <strong>출력 방식</strong>
            <span>진단, 실행안, 카피, 지표, 근거를 한 번에 정리합니다.</span>
          </div>
        </div>
      </aside>

      <section className="main">
        <div className="workspace">
          <div className="topbar">
            <div className="title">
              <h1>Hey Mark</h1>
              <p>작은 브리프를 산업별 실행 전략으로 바꾸는 마케팅 조언 워크스페이스.</p>
            </div>
            <div className="status-pill" aria-label="Service status">
              <span className="status-dot" />
              {selectedIndustry?.label ?? "산업"} 프로파일 활성
            </div>
          </div>

          <div className="grid">
            <section className="panel">
              <div className="panel-header">
                <h2>브리프</h2>
              </div>
              <div className="form">
                <div className="field">
                  <label htmlFor="industry">산업</label>
                  <select
                    id="industry"
                    value={form.industry}
                    onChange={(event) =>
                      setForm({ ...form, industry: event.target.value as Industry })
                    }
                  >
                    {industries.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="product">제품/서비스</label>
                  <input
                    id="product"
                    value={form.product}
                    onChange={(event) => setForm({ ...form, product: event.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor="target">타깃 고객</label>
                  <textarea
                    id="target"
                    value={form.targetCustomer}
                    onChange={(event) =>
                      setForm({ ...form, targetCustomer: event.target.value })
                    }
                  />
                </div>

                <div className="row">
                  <div className="field">
                    <label htmlFor="goal">목표</label>
                    <input
                      id="goal"
                      value={form.goal}
                      onChange={(event) => setForm({ ...form, goal: event.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="budget">예산</label>
                    <select
                      id="budget"
                      value={form.budgetLevel}
                      onChange={(event) =>
                        setForm({ ...form, budgetLevel: event.target.value })
                      }
                    >
                      <option>없음</option>
                      <option>소액</option>
                      <option>중간</option>
                      <option>큼</option>
                    </select>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="channels">채널</label>
                  <input
                    id="channels"
                    value={form.channels}
                    onChange={(event) => setForm({ ...form, channels: event.target.value })}
                  />
                </div>

                <div className="field">
                  <label htmlFor="problem">현재 문제</label>
                  <textarea
                    id="problem"
                    value={form.currentProblem}
                    onChange={(event) =>
                      setForm({ ...form, currentProblem: event.target.value })
                    }
                  />
                </div>

                <button className="submit" onClick={submitAdvice} disabled={isLoading}>
                  <Sparkles size={18} aria-hidden="true" />
                  {isLoading ? "생성 중" : "전략 생성"}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </section>

            <section className="panel output" aria-live="polite">
              {!advice ? (
                <div className="empty">
                  <div>
                    <ClipboardList size={34} aria-hidden="true" />
                    <p>브리프를 바탕으로 실행 전략이 표시됩니다.</p>
                  </div>
                </div>
              ) : (
                <div className="advice">
                  <div className="diagnosis">
                    <h3>진단</h3>
                    <p>{advice.diagnosis}</p>
                  </div>

                  <div className="section">
                    <h3>우선순위</h3>
                    <div className="chips">
                      {advice.focus.map((item) => (
                        <span className="chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <h3>실행안</h3>
                    <ol className="action-list">
                      {advice.actions.map((action) => (
                        <li key={action}>{action}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="section">
                    <h3>카피 방향</h3>
                    <div className="copy-grid">
                      {advice.copyExamples.map((line) => (
                        <div className="copy-line" key={line}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <h3>측정 지표</h3>
                    <div className="chips">
                      {advice.metrics.map((metric) => (
                        <span className="chip" key={metric}>
                          {metric}
                        </span>
                      ))}
                    </div>
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
