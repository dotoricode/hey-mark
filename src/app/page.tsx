"use client";

import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  LoaderCircle,
  MapPin,
  MessageCircleQuestion,
  Send,
  Sparkles,
  Store,
  Zap
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type {
  CafeCopilotResponse,
  CafeProfile,
  ConversationMessage,
  StrategyArtifact
} from "@/lib/advisor";
import { marketing0Knowledge } from "@/lib/marketing0Knowledge";

const starterProfile: CafeProfile = {
  placeHint: "",
  currentProblem:
    "가오픈 때는 커피를 사면 디저트 2개를 주는 행사로 아침부터 많이 방문했지만, 정식 오픈 이후 방문율이 떨어졌습니다.",
  goal: "평일 오전과 낮 방문을 늘리고 싶습니다.",
  knownSignals: "재방문 고객은 30-40% 정도입니다. 인스타그램 관심도는 낮습니다."
};

const starterPrompts = [
  "가장 먼저 실행할 1개 아이디어로 좁혀줘",
  "큰 할인 없이 다시 오게 만드는 방법이 필요해",
  "네이버지도 링크를 기준으로 부족한 정보를 물어봐줘"
];

type Step = "brief" | "chat";

function confidenceLabel(value: number) {
  if (value >= 75) {
    return "바로 실험 가능";
  }

  if (value >= 55) {
    return "질문 후 정확도 상승";
  }

  return "정보 보강 필요";
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${Math.max(0, Math.min(100, value))}%` } as React.CSSProperties}
      aria-label={`전략 확신도 ${value}%`}
    >
      <span className="progress-score">
        <span className="progress-value">{value}</span>
        <small className="progress-unit">%</small>
      </span>
    </div>
  );
}

function FocusBars({ artifact }: { artifact: StrategyArtifact }) {
  return (
    <div className="focus-bars">
      {artifact.focus.map((item) => (
        <div className="focus-row" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <span style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatElapsed(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  return `${(ms / 1000).toFixed(1)}초`;
}

function AiUsageStrip({ response }: { response: CafeCopilotResponse }) {
  if (!response.aiUsage) {
    return null;
  }

  const usage = response.aiUsage;
  const tokenLabel =
    typeof usage.totalTokens === "number"
      ? `${usage.totalTokens.toLocaleString()} tokens`
      : "토큰 집계 대기";

  return (
    <div className="ai-usage-strip" aria-label="Mark 상태">
      <span>Mark 사용</span>
      <strong>Mark engine</strong>
      <span>{formatElapsed(usage.elapsedMs)}</span>
      <span>{tokenLabel}</span>
    </div>
  );
}

function MetricDashboard({ artifact }: { artifact: StrategyArtifact }) {
  if (!artifact.metrics.length) {
    return null;
  }

  return (
    <div className="metric-dashboard" aria-label="정량 지표">
      {artifact.metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <div className="metric-card-head">
            <span>{metric.label}</span>
            <strong>
              {metric.value}
              <small>{metric.unit}</small>
            </strong>
          </div>
          <div className="metric-bar-track" aria-hidden="true">
            <span style={{ width: `${metric.value}%` }} />
          </div>
          <b>{metric.status}</b>
          <p>{metric.explanation}</p>
        </article>
      ))}
    </div>
  );
}

function ArtifactView({
  response,
  onShortcut,
  disabled,
  activeAction
}: {
  response: CafeCopilotResponse;
  onShortcut: (value: string, actionId: string) => void;
  disabled: boolean;
  activeAction: string | null;
}) {
  const artifact = response.artifact;

  return (
    <section className="artifact-panel" aria-live="polite">
      <div className="artifact-top">
        <div>
          <span className="eyebrow">전략 초안</span>
          <h2>{artifact.title}</h2>
          <p>{artifact.plainSummary}</p>
        </div>
        <div className="confidence-card">
          <ProgressRing value={artifact.confidence} />
          <strong>{confidenceLabel(artifact.confidence)}</strong>
        </div>
      </div>

      <AiUsageStrip response={response} />

      <div className="insight-band">
        <Sparkles size={18} aria-hidden="true" />
        <p>{artifact.hiddenInsight}</p>
      </div>

      <MetricDashboard artifact={artifact} />

      <FocusBars artifact={artifact} />

      <div className="shortcut-row">
        {response.intentShortcuts.map((shortcut, index) => (
          <button
            key={shortcut}
            type="button"
            className={activeAction === `shortcut-${index}` ? "is-active" : ""}
            disabled={disabled}
            onClick={() => onShortcut(shortcut, `shortcut-${index}`)}
          >
            {activeAction === `shortcut-${index}` ? (
              <LoaderCircle className="spin-icon" size={16} aria-hidden="true" />
            ) : (
              <ChevronRight size={16} aria-hidden="true" />
            )}
            {shortcut}
          </button>
        ))}
      </div>

      <div className="question-grid">
        {artifact.questions.map((question) => (
          <article className="question-card" key={question.id}>
            <MessageCircleQuestion size={18} aria-hidden="true" />
            <h3>{question.label}</h3>
            <p>{question.reason}</p>
            <div className="option-row">
              {question.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={
                    activeAction === `question-${question.id}-${suggestion}`
                      ? "is-active"
                      : ""
                  }
                  disabled={disabled}
                  onClick={() =>
                    onShortcut(
                      `${question.label}: ${suggestion}`,
                      `question-${question.id}-${suggestion}`
                    )
                  }
                >
                  {activeAction === `question-${question.id}-${suggestion}` ? (
                    <LoaderCircle className="spin-icon" size={14} aria-hidden="true" />
                  ) : null}
                  {suggestion}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="play-stack">
        {artifact.plays.map((play, index) => (
          <article className="play-card" key={play.title}>
            <div className="play-index">{index + 1}</div>
            <div>
              <span className="eyebrow">실행안</span>
              <h3>{play.title}</h3>
              <p className="one-line">{play.oneLine}</p>
              <p>{play.whyItWorks}</p>
              <ol>
                {play.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="copy-list">
                {play.copy.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
              <div className="metric-row">
                <span>측정</span>
                <strong>{play.metric}</strong>
              </div>
              <div className="risk-row">
                <span>주의</span>
                <strong>{play.risk}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="timeline">
        {artifact.timeline.map((item) => (
          <div className="timeline-item" key={item.label}>
            <span>{item.label}</span>
            <p>{item.task}</p>
          </div>
        ))}
      </div>

      <details className="source-details">
        <summary>근거와 한계</summary>
        <ul>
          {artifact.assumedFacts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
          {artifact.sourceNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
          {response.retrievalNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}

export default function Home() {
  const [step, setStep] = useState<Step>("brief");
  const [profile, setProfile] = useState<CafeProfile>(starterProfile);
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      role: "assistant",
      content:
        "네이버지도 링크나 카페명, 지금 가장 답답한 문제만 알려주세요. 부족한 정보는 제가 다음 질문으로 좁혀볼게요."
    }
  ]);
  const [draftMessage, setDraftMessage] = useState("");
  const [response, setResponse] = useState<CafeCopilotResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const isBriefReady = useMemo(
    () => profile.placeHint.trim().length > 0 || profile.currentProblem.trim().length > 0,
    [profile.currentProblem, profile.placeHint]
  );

  function updateProfile(key: keyof CafeProfile, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function requestAdvice(
    nextMessages: ConversationMessage[],
    actionId: string
  ) {
    setError("");
    setIsLoading(true);
    setActiveAction(actionId);

    try {
      const result = await fetch("/api/advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profile,
          messages: nextMessages
        })
      });

      if (!result.ok) {
        throw new Error("전략 생성에 실패했습니다.");
      }

      const nextResponse = (await result.json()) as CafeCopilotResponse;
      setResponse(nextResponse);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: nextResponse.assistantMessage }
      ]);
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  async function startChat(prompt?: string, actionId = "primary") {
    if (isLoading) {
      return;
    }

    const opening = prompt || "지금 정보로 첫 전략을 만들어줘";
    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: "user", content: opening }
    ];

    setStep("chat");
    setMessages(nextMessages);
    try {
      await requestAdvice(nextMessages, actionId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "전략 생성에 실패했습니다."
      );
    }
  }

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>,
    shortcut?: string,
    actionId = "chat-submit"
  ) {
    event?.preventDefault();
    const content = (shortcut ?? draftMessage).trim();

    if (!content || isLoading) {
      return;
    }

    const nextMessages: ConversationMessage[] = [
      ...messages,
      { role: "user", content }
    ];

    setDraftMessage("");
    setMessages(nextMessages);
    try {
      await requestAdvice(nextMessages, actionId);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "전략 생성에 실패했습니다."
      );
    }
  }

  return (
    <main className="copilot-shell">
      <section className="app-hero">
        <div className="brand">
          <img className="brand-mark" src="/mark.png" alt="" />
          <span>Hey Mark</span>
        </div>
        <div className="hero-copy">
          <span className="eyebrow">Cafe Marketing Copilot</span>
          <h1>우리 카페 상황부터 같이 봅니다.</h1>
          <p>
            네이버지도 링크나 카페명, 지금 겪는 문제만 남겨주세요. 필요한 정보는 대화로
            확인하고 실행 순서까지 정리합니다.
          </p>
        </div>
        <div className="brand-portrait" aria-hidden="true">
          <img src="/mark.png" alt="" />
        </div>
        <div className="knowledge-pill">
          <Bot size={18} aria-hidden="true" />
          <span>{marketing0Knowledge.videoCount}개 분석 관점</span>
        </div>
      </section>

      <div className="workspace-grid">
        <aside className="brief-panel">
          <div className="stepper">
            <div className={step === "brief" ? "active" : ""}>
              <span>1</span>
              <strong>기본 정보</strong>
            </div>
            <div className={step === "chat" ? "active" : ""}>
              <span>2</span>
              <strong>대화와 전략</strong>
            </div>
          </div>

          <label className="smart-field">
            <span>
              <MapPin size={16} aria-hidden="true" />
              네이버지도 링크 또는 카페명
            </span>
            <input
              value={profile.placeHint}
              onChange={(event) => updateProfile("placeHint", event.target.value)}
              placeholder="예: https://naver.me/... 또는 브리즈커피 성수"
            />
          </label>

          <label className="smart-field">
            <span>
              <Store size={16} aria-hidden="true" />
              지금 가장 답답한 문제
            </span>
            <textarea
              value={profile.currentProblem}
              onChange={(event) =>
                updateProfile("currentProblem", event.target.value)
              }
            />
          </label>

          <div className="compact-grid">
            <label className="smart-field">
              <span>목표</span>
              <input
                value={profile.goal}
                onChange={(event) => updateProfile("goal", event.target.value)}
              />
            </label>
            <label className="smart-field">
              <span>이미 아는 신호</span>
              <textarea
                value={profile.knownSignals}
                onChange={(event) =>
                  updateProfile("knownSignals", event.target.value)
                }
              />
            </label>
          </div>

          <button
            className={`primary-action ${activeAction === "primary" ? "is-active" : ""}`}
            type="button"
            disabled={!isBriefReady || isLoading}
            onClick={() => startChat(undefined, "primary")}
          >
            {activeAction === "primary" ? (
              <LoaderCircle className="spin-icon" size={18} aria-hidden="true" />
            ) : (
              <Sparkles size={18} aria-hidden="true" />
            )}
            {activeAction === "primary" ? "전략 작성 중" : "첫 전략 만들기"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <div className="hint-stack">
            {starterPrompts.map((prompt, index) => (
              <button
                key={prompt}
                type="button"
                className={activeAction === `starter-${index}` ? "is-active" : ""}
                disabled={!isBriefReady || isLoading}
                onClick={() => startChat(prompt, `starter-${index}`)}
              >
                {activeAction === `starter-${index}` ? (
                  <LoaderCircle className="spin-icon" size={15} aria-hidden="true" />
                ) : (
                  <Zap size={15} aria-hidden="true" />
                )}
                {prompt}
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-header">
            <div>
              <span className="eyebrow">Conversation</span>
              <h2>질문하면서 전략을 다듬는 공간</h2>
            </div>
            <span className="status-badge">
              <Check size={15} aria-hidden="true" />
              {response?.aiUsage
                ? `Mark · ${formatElapsed(response.aiUsage.elapsedMs)}`
                : "Guided"}
            </span>
          </div>

          <div className="message-list">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === "assistant" ? "Hey Mark" : "나"}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {isLoading ? (
              <div className="message assistant thinking">
                <span>Hey Mark</span>
                <p>지도/문제/재방문 신호를 엮어 실행안으로 좁히는 중입니다.</p>
              </div>
            ) : null}
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <form className="chat-input" onSubmit={(event) => sendMessage(event)}>
            <input
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              placeholder="예: 예산은 거의 없고 오후 2-5시가 가장 비어요"
            />
            <button
              type="submit"
              className={activeAction === "chat-submit" ? "is-active" : ""}
              disabled={isLoading || !draftMessage.trim()}
            >
              {activeAction === "chat-submit" ? (
                <LoaderCircle className="spin-icon" size={18} aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
            </button>
          </form>
        </section>
      </div>

      {response ? (
        <ArtifactView
          response={response}
          disabled={isLoading}
          activeAction={activeAction}
          onShortcut={(value, actionId) =>
            sendMessage(undefined, value, actionId)
          }
        />
      ) : (
        <section className="empty-artifact">
          <Sparkles size={22} aria-hidden="true" />
          <p>첫 전략을 만들면 질문 카드, 실행안, 측정 기준이 이곳에 정리됩니다.</p>
        </section>
      )}
    </main>
  );
}
