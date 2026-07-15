# PaddockME docs index

Every document in the repo, what it's for, and whether it's still live.
Conventions: **Active** = maintained, trust it; **Reference** = stable
background, rarely changes; **Snapshot** = accurate on its date, not updated
since; **Archived** = superseded, kept for history only.

## Root

| Doc | Status | What it is |
| --- | --- | --- |
| [`../README.md`](../README.md) | Active | Project front door: stack, local dev, env vars, folder map, design system. |
| [`../PADDOCKME_MASTER_SPEC.md`](../PADDOCKME_MASTER_SPEC.md) | Active | **The canonical build spec** (v1.2). Product states, screens, design system, lifecycle rules. |
| [`../SPEC_DRIFT.md`](../SPEC_DRIFT.md) | Active | Known deviations between the live code and the master spec, with severity. Stays at the repo root — the master spec's drift-logging instruction points there. |
| [`../CLAUDE.md`](../CLAUDE.md) | Active | Orientation for AI coding sessions: route lanes, auth flow, deployment layout, guardrails. |

## product/ — what we're building and why

| Doc | Status | What it is |
| --- | --- | --- |
| [`product/PRINCIPLES.md`](product/PRINCIPLES.md) | Reference | The five platform principles every feature is tested against. |
| [`product/SCOPE.md`](product/SCOPE.md) | Reference | What was explicitly out of scope day one, and the day-one definition of done. |
| [`product/current-app-map.md`](product/current-app-map.md) | Active | Which routes are the guided 2.0 MVP vs. older surfaces still in the repo. |
| [`product/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md`](product/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md) | Active (proposed) | Spec for the Live Agreement screen for completed agreements — approved direction, partially built. |
| [`product/CUSTOMER_VALIDATION_GUIDE.md`](product/CUSTOMER_VALIDATION_GUIDE.md) | Reference | Interview guide for validating agistment/transport pain with real customers. |

## design/ — how it should look and feel

| Doc | Status | What it is |
| --- | --- | --- |
| [`design/DESIGN_INTELLIGENCE.md`](design/DESIGN_INTELLIGENCE.md) | Reference | ui-ux-pro-max skill output vs. our brand decisions — what we adopted and where we deviate. |
| [`design/FEEL_BETTER.md`](design/FEEL_BETTER.md) | Reference | Micro-interaction and UX-polish standards (transitions, hover states, skeletons). |

## investor/ — pitch and diligence

| Doc | Status | What it is |
| --- | --- | --- |
| [`investor/INVESTOR_PITCH_NOTES.md`](investor/INVESTOR_PITCH_NOTES.md) | Reference | Spoken spine for the investor demo. |
| [`investor/INVESTOR_DILIGENCE_QA.md`](investor/INVESTOR_DILIGENCE_QA.md) | Reference | Honest Q&A prep — separates what's real from what's prototype. |
| [`investor/INVESTOR_MVP_SPRINT.md`](investor/INVESTOR_MVP_SPRINT.md) | Snapshot (May 2026) | The three-day investor-ready sprint tracker. |
| [`investor/INVESTOR_FREEZE_CHECKLIST.md`](investor/INVESTOR_FREEZE_CHECKLIST.md) | Reference | Pre-call freeze checklist. |

## payments/ — the next commercial unlock

| Doc | Status | What it is |
| --- | --- | --- |
| [`payments/PAYMENTS_SETTLEMENT_BLUEPRINT.md`](payments/PAYMENTS_SETTLEMENT_BLUEPRINT.md) | Reference | Product blueprint for payments/settlement — explicitly not an implementation claim. |
| [`payments/PAYMENTS_MILESTONE_PLAN.md`](payments/PAYMENTS_MILESTONE_PLAN.md) | Active | The learn/build/test/deploy milestone checklist for payments. |

## reports/ — point-in-time audits

| Doc | Status | What it is |
| --- | --- | --- |
| [`reports/VENTURE_AUDIT_2026-07-10.md`](reports/VENTURE_AUDIT_2026-07-10.md) | Snapshot (10 Jul 2026) | Forensic product + technical audit of the whole venture. Most recent full picture. |
| [`reports/BUG_SCAN_2026-06-08.md`](reports/BUG_SCAN_2026-06-08.md) | Snapshot (8 Jun 2026) | Repo-wide bug scan with severity table. |
| [`reports/CURRENT_PRODUCT_AUDIT.md`](reports/CURRENT_PRODUCT_AUDIT.md) | Snapshot (23 May 2026) | Inventory of built routes, data, and demo limits at that date. |
| [`reports/legacy-app-usage.md`](reports/legacy-app-usage.md) | Snapshot | Which legacy `(app)` surfaces are still referenced. |

## archive/ — superseded, kept for history

| Doc | What it was |
| --- | --- |
| [`archive/AI_HANDOFF_CURRENT.md`](archive/AI_HANDOFF_CURRENT.md) | AI handoff brief for the guided-MVP rebuild. Superseded by `CLAUDE.md` (root), which carries its guardrails forward. |
| [`archive/HANDOVER_2026-06.md`](archive/HANDOVER_2026-06.md) | Handover brief for the guided-workflow demo era. |
| [`archive/HANDOVER_2026-06-09.md`](archive/HANDOVER_2026-06-09.md) | Session handover to Codex (James/Leona test accounts). |
| [`archive/HANDOFF_GUIDED_DEMO_2026-07-11.md`](archive/HANDOFF_GUIDED_DEMO_2026-07-11.md) | Guided-demo build session record (11 Jul 2026). |
| [`archive/CLAUDE_CODE_HANDOFF.md`](archive/CLAUDE_CODE_HANDOFF.md) | Early Claude Code opening brief. |
| [`archive/BUILD_02.md`](archive/BUILD_02.md) | Foundation Build 02 brief (workspace + agreement polish) — delivered. |
| [`archive/BUILD_03_TRANSPORT.md`](archive/BUILD_03_TRANSPORT.md) | Foundation Build 03 brief (transport as third pillar) — delivered. |
| [`archive/BUG_REPORT_2026-05-10.md`](archive/BUG_REPORT_2026-05-10.md) | Supabase `never`-type build failure report — resolved. |

## Housekeeping rules

- New dated session records (handovers, handoffs) go straight into
  `archive/` once the session they describe is over.
- New audits/scans go in `reports/` with the date in the filename.
- Run `npm run docs:check` after adding or moving any markdown file —
  it validates every relative link in the repo.
- When a doc is superseded, move it to `archive/` and note its successor
  in the table above rather than deleting it.
