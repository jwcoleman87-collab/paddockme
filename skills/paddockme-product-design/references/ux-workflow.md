# UX workflow for consequential changes

Use this reference for medium/high UI work. Keep the output proportional.

## 1. Frame

Record:

- primary user and environment;
- current core-loop step;
- single success action;
- recovery action;
- misunderstanding cost;
- data/connectivity assumptions.

## 2. Inspect

Read the master-spec page section, affected route, sibling screens, shared primitives, data state and relevant tests. List only what materially influenced the decision. Live UI convention wins over stale subordinate documentation; master-spec behaviour remains authoritative.

## 3. Define the contract

For each affected screen, specify:

- P0: orientation, current status, instruction, primary action;
- P1: confidence/support information;
- P2/P3: progressive disclosure and rare recovery help;
- initial, loading, empty, ready, submitting, success, error, offline, disabled and external-wait states that genuinely apply;
- trigger, preconditions, feedback, success, failure, announcement and forbidden behaviour for material interactions.

If everything is P0, hierarchy has failed.

## 4. Responsive behaviour

Design at:

- 320–374px: protect P0 content, wrapping and CTA reachability;
- 375–430px: primary PaddockME target, including 390px;
- 600–839px: decide whether one or two panes genuinely helps;
- 840px+: cap line lengths and avoid stretched operational cards;
- short landscape: check sticky chrome, keyboard and modal/sheet height.

The fixed bottom navigation needs reserved content padding and safe-area handling.

## 5. Component and token decision

Use an existing token/component first. If absent, propose a semantically named shared role and stop for approval when it changes the system. Never introduce arbitrary hex, radius, shadow, typeface or z-index values in a feature component.

## 6. Approval gate

Get James's explicit approval before implementing high-complexity designs, navigation/core-loop changes, new primitives, payments/trust/data-sharing changes, or any agreement-workspace redesign.

## 7. Visual QA

After implementation:

- render relevant normal and failure states;
- inspect 390px and relevant wider breakpoints;
- check large text/zoom, long Australian place names and realistic content;
- check safe areas, sticky UI, modal/sheet overflow and focus restoration;
- compare before/after screenshots;
- run repository verification commands.

Do not use fabricated business data in production code merely to obtain a screenshot. Use existing test/demo facilities or controlled test fixtures.
