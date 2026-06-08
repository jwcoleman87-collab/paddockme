---
name: Make Interfaces Feel Better
description: Enforce premium micro-interactions, layout fluidity, and high-end UX design standards.
applyTo: "client/src/**/*, src/components/**/*, **/*.tsx, **/*.vue, **/*.html, **/*.css"
---

# UI/UX Micro-Interaction & Polish Rules

When generating or refactoring UI components, you must adhere to these premium feel guidelines:

## 1. Transitions & Micro-interactions

- Never let elements instantly jump or snap unless explicitly requested.
- Apply smooth, native transitions (`transition: all 0.2s ease-in-out` or `duration-200 ease-in-out` for Tailwind) to all hover, focus, active, and state changes.
- Ensure all interactive elements (buttons, links, cards) have explicit `:hover` and `:focus-visible` states.

## 2. Layout & Spatial Breathing Room

- Avoid cramped elements. Prioritize padding over rigid heights. Ensure appropriate hierarchy via spatial layout.
- Prevent layout shifts (CLS): If an element scales or adds a border on hover, use `outline` or pre-calculated padding so adjacent elements don't stutter or move.

## 3. Typography & Text Hierarchy

- Never use pure black `#000000` text on pure white backgrounds; use soft dark grays (e.g., `#111827` or `#1f2937`) to reduce eye strain.
- Enforce clear tracking (letter-spacing) on headers vs body copy.
