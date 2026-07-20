/**
 * Party resolution and attribution rules for the two-farmer agreement.
 *
 * One shared agreement, two perspectives: the caller's side is always derived
 * from their authenticated user id compared against the agreement's stored
 * livestock_owner_id (party A) and landowner_id (party B). No layer may trust
 * a client-supplied "A"/"B" label for attribution.
 */

export type AgreementPartyId = "A" | "B";

export type SectionTickState = {
  agreedByA: boolean;
  agreedByB: boolean;
};

/**
 * Which side of the agreement is this user? Null until an id is known, and
 * null for anyone who is not a party. A user who is both parties (self-deal)
 * resolves to A, matching the livestock-owner-initiated flow.
 */
export function resolveAgreementParty(
  userId: string | null | undefined,
  farmerAId: string | null | undefined,
  farmerBId: string | null | undefined
): AgreementPartyId | null {
  if (!userId) return null;
  if (farmerAId && userId === farmerAId) return "A";
  if (farmerBId && userId === farmerBId) return "B";
  return null;
}

/** Mutations are only ever allowed for a resolved party. */
export function canMutateAgreement(
  party: AgreementPartyId | null
): party is AgreementPartyId {
  return party === "A" || party === "B";
}

/**
 * Apply a party's own agree tick. Only the caller's flag can change; the
 * counterparty's flag always carries over untouched.
 */
export function applyPartyTick(
  party: AgreementPartyId,
  current: SectionTickState,
  agreed: boolean
): SectionTickState {
  return party === "A"
    ? { agreedByA: agreed, agreedByB: current.agreedByB }
    : { agreedByA: current.agreedByA, agreedByB: agreed };
}
