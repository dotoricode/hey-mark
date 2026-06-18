# Changelog

All notable changes to Hey Mark are tracked here.

This project starts versioning at `v0.0.1` and follows Semantic Versioning.

## [0.1.4] - 2026-06-18

### Fixed

- Added Gemini request retries across URL/Search tools, JSON MIME mode, and plain generation.
- Included safe Gemini response body snippets in fallback diagnostics for production troubleshooting.

## [0.1.3] - 2026-06-18

### Fixed

- Removed Gemini structured-output request parameters that caused production API `400` responses.
- Kept defensive JSON cleanup for Gemini text responses with raw control characters.

## [0.1.2] - 2026-06-18

### Fixed

- Added Gemini JSON response schema guidance for structured copilot responses.
- Added a fallback JSON parser pass for unescaped control characters in model output.

## [0.1.1] - 2026-06-18

### Fixed

- Changed the default Gemini model to `gemini-2.5-flash` for broader API key compatibility.
- Added safe fallback diagnostics when Gemini is unavailable in production.
- Retried Gemini generation without URL/Search tools when tool-enabled calls fail.

## [0.1.0] - 2026-06-18

### Added

- Gemini-backed cafe marketing copilot API with deterministic fallback.
- Progressive cafe owner onboarding with minimal required inputs.
- Conversational follow-up flow for ambiguous or missing strategy context.
- In-chat strategy artifact with questions, focus visualization, execution plays, copy, metrics, risks, and timeline.
- Toss-inspired visual refresh with softer motion and mobile-first responsive layout.

### Changed

- Replaced the long strip form with a guided brief-to-chat workflow.
- Updated the Marketing0 knowledge usage from static dashboard evidence to prompt grounding and strategy guardrails.

## [0.0.1] - 2026-06-18

### Added

- Cafe-owner-first marketing strategy MVP.
- Strip-style dashboard UI.
- Marketing0 channel analysis assessment and derived knowledge status.
- Vercel production deployment.

### Notes

- Raw private knowledge files are not committed to the public repository.
- Current Marketing0 knowledge is a general perspective layer, not a complete cafe/local strategy corpus.
- LLM integration is not required for the deterministic MVP and should be added later only with grounded retrieval.
