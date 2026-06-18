# Marketing0 Knowledge Base Assessment

## Source

- Private source file: `/Users/youngsang.kwon/01_private/marketing0_channel_analysis.jsonl`
- Assessed on: 2026-06-18
- Public repo policy: do not commit the raw JSONL corpus.

## What The File Contains

- 93 JSONL records total
- 1 channel snapshot
- 1 methodology/limits record
- 90 video analysis records
- 1 aggregate analysis record

The file intentionally does not store full transcripts. It contains public metadata, inferred categories, inferred audience problems, title hooks, topic tags, transcript availability metadata, and short inferred transcript summaries for the subset where captions were available.

## Coverage

| Area | Count |
| --- | ---: |
| Recent videos analyzed | 90 |
| Transcript-backed summaries | 15 |
| Metadata-only video analyses | 75 |
| Full channel archive videos | 522 public channel count, not fully analyzed |

Main inferred categories:

- 마케팅 관점/실무 해설: 37
- 마케터 커리어/업무 방식: 15
- 마케팅 실무/예산: 12
- 소비 트렌드 해설: 11
- 브랜드/기업 사례 분석: 9
- 마케팅/비즈니스 도서 리뷰: 3
- AI/디지털 마케팅: 3

Cafe/local relevance check:

- `카페`: 0
- `로컬`: 0
- `지역`: 0
- `동네`: 0
- `오프라인`: 0
- `매장`: 0
- `소상공`: 0
- `자영업`: 0
- `리뷰`: 3
- `네이버`: 3
- `브랜드`: 23
- `예산`: 19
- `고객`: 10

## Sufficiency Decision

This file is enough for a first knowledge layer about Marketing0's general marketing perspective:

- marketing should be treated as judgment and strategy, not just ad execution
- ad spend should not be the first move when the offer, customer desire, and measurement are unclear
- customer desire and self-persuasion matter more than one-way persuasion
- consumer behavior is shifting away from simple hooks and static detail pages
- creator/influencer-style evidence can matter, but only when it is tied to a business goal

It is not enough as a complete cafe-owner strategy knowledge base:

- no cafe-specific corpus
- no local business or offline store corpus
- no structured examples for Naver Map, local reviews, foot traffic, menu economics, or time-slot offers
- only 15 transcript-backed summaries
- most records are metadata-only

## LLM Need

An LLM is not required for the current deterministic MVP to produce structured cafe playbooks. The current app can use:

- user-provided cafe context
- handcrafted cafe playbooks
- derived Marketing0 principles
- deterministic diagnosis rules

An LLM becomes useful when the product needs:

- natural synthesis across many knowledge cards
- rewriting strategy for tone, constraints, and local nuance
- comparing Instagram/Naver/blog excerpts supplied by the user
- asking follow-up questions from incomplete briefs
- generating many campaign variants while staying grounded in retrieved cards

Recommended path:

1. Keep the MVP deterministic plus retrieval-aware.
2. Convert the JSONL into curated `knowledge cards`, not raw transcript storage.
3. Add cafe/local cards separately.
4. Add an LLM only after retrieval can provide grounded cards and citations.

## Product Copy Rule

The app may say:

> Marketing0 channel analysis has been loaded as a general marketing perspective layer.

The app must not say:

> The full 곽팀장 YouTube channel has been learned, trained, or fully analyzed for cafe strategy.

