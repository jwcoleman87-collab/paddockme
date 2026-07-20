import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPartyTick,
  canMutateAgreement,
  resolveAgreementParty,
} from "../../src/lib/agreementParty.ts";

const A = "user-a";
const B = "user-b";

test("unresolved user resolves to no party (never defaults to Farmer A)", () => {
  assert.equal(resolveAgreementParty(null, A, B), null);
  assert.equal(resolveAgreementParty(undefined, A, B), null);
  assert.equal(resolveAgreementParty("", A, B), null);
});

test("farmer B resolves to B, never A", () => {
  assert.equal(resolveAgreementParty(B, A, B), "B");
});

test("farmer A resolves to A", () => {
  assert.equal(resolveAgreementParty(A, A, B), "A");
});

test("non-party resolves to null", () => {
  assert.equal(resolveAgreementParty("stranger", A, B), null);
});

test("self-deal (both parties) resolves to A deterministically", () => {
  assert.equal(resolveAgreementParty(A, A, A), "A");
});

test("mutations are blocked while unresolved or for non-parties", () => {
  assert.equal(canMutateAgreement(null), false);
  assert.equal(canMutateAgreement("A"), true);
  assert.equal(canMutateAgreement("B"), true);
});

test("farmer A's tick only ever changes agreed_by_a", () => {
  const next = applyPartyTick("A", { agreedByA: false, agreedByB: true }, true);
  assert.deepEqual(next, { agreedByA: true, agreedByB: true });
  const withdrawn = applyPartyTick(
    "A",
    { agreedByA: true, agreedByB: true },
    false
  );
  assert.deepEqual(withdrawn, { agreedByA: false, agreedByB: true });
});

test("farmer B's tick only ever changes agreed_by_b", () => {
  const next = applyPartyTick("B", { agreedByA: true, agreedByB: false }, true);
  assert.deepEqual(next, { agreedByA: true, agreedByB: true });
  const withdrawn = applyPartyTick(
    "B",
    { agreedByA: true, agreedByB: true },
    false
  );
  assert.deepEqual(withdrawn, { agreedByA: true, agreedByB: false });
});

test("a crafted tick for the counterparty cannot flip their flag", () => {
  // Whatever a caller claims about the OTHER party's flag, applyPartyTick
  // carries the stored value through untouched.
  const stored = { agreedByA: false, agreedByB: false };
  const asB = applyPartyTick("B", stored, true);
  assert.equal(asB.agreedByA, false); // B cannot raise A's flag
  const asA = applyPartyTick("A", stored, true);
  assert.equal(asA.agreedByB, false); // A cannot raise B's flag
});

test("two-party agreement still completes through own-flag ticks only", () => {
  let state = { agreedByA: false, agreedByB: false };
  state = applyPartyTick("A", state, true);
  state = applyPartyTick("B", state, true);
  assert.deepEqual(state, { agreedByA: true, agreedByB: true });
});
