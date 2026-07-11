"use client";

/**
 * Shared workflow state for the PaddockME guided-workflow MVP.
 *
 * Problem this solves: every screen used to read from static demo data,
 * so nothing a user entered or agreed to ever carried through to the next
 * screen (request details, agreed price, transport choice, checklist
 * progress). This context holds that state in memory + localStorage so the
 * whole 12-screen flow behaves like one connected journey.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  demoDatesRangeLabel,
  demoEndDateInput,
  demoTransportRft,
  type TransportRft,
} from "./paddockmeDemoData";

const STORAGE_KEY = "paddockme-workflow-v2";

// Opening offers — framed as James' (the livestock owner's) initial
// proposal, which John (the landowner) can accept or counter. Whoever's
// turn it isn't sees the other side's current offer and can accept it or
// send back their own. Dates come from the evergreen demo window so the
// proposal is always in the future relative to the real current date.
export const SUGGESTED_RATE = "$12.50 / head / week";
export const SUGGESTED_DATES_LABEL = demoDatesRangeLabel;
export const SUGGESTED_PAYMENT_TERMS = "Monthly in advance";
export const PAYMENT_TERM_CHOICES = [
  "Monthly in advance",
  "Weekly in advance",
];

export type RequestDetails = {
  livestockType: string;
  headCount: number;
  location: string;
  /** ISO yyyy-mm-dd */
  needUntil: string;
  distanceKm: string;
  budget: string;
  specialRequirements: string;
};

/** A Request For Transport (RFT) sent out to transport companies. */
export type TransportRequestDetails = {
  pickupLocation: string;
  dropoffLocation: string;
  headCount: number;
  pickupDate: string;
  notes: string;
};

/** A live offer for one term of the deal, and whose "turn" it is. */
export type Proposal = {
  value: string;
  /** Who made this offer — the other person can accept or counter it. */
  from: "James" | "John";
};

/** Where the booked movement is up to, shown on the Live Agreement screen. */
export type TransportStatus = "booked" | "picked_up" | "en_route" | "delivered";

/**
 * The movement's stages in order — one source of truth for the Live
 * Agreement stepper, the transport room tracker and the advance action.
 */
export const TRANSPORT_STEPS: { key: TransportStatus; label: string }[] = [
  { key: "booked", label: "Booked" },
  { key: "picked_up", label: "Picked up" },
  { key: "en_route", label: "En route" },
  { key: "delivered", label: "Delivered" },
];

/** The stage after `status`, or null when the movement is already delivered. */
export function nextTransportStatus(
  status: TransportStatus,
): TransportStatus | null {
  const idx = TRANSPORT_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 && idx < TRANSPORT_STEPS.length - 1
    ? TRANSPORT_STEPS[idx + 1].key
    : null;
}

/** One payment in the schedule derived from the agreed terms + dates. */
export type PaymentScheduleItem = {
  /** e.g. "June 2025" (monthly) or "Week 3" (weekly) */
  label: string;
  /** Display date, e.g. "1 Jun 2025" */
  due: string;
  status: "due" | "upcoming" | "paid";
};

export type AgreementState = {
  rate: string | null;
  priceAgreed: boolean;
  pendingRate: Proposal | null;

  datesLabel: string | null;
  datesConfirmed: boolean;
  pendingDates: Proposal | null;

  paymentTerms: string | null;
  paymentTermsConfirmed: boolean;
  pendingPaymentTerms: Proposal | null;

  /** The RFT James has sent out to transport companies, if any. */
  transportRequestSent: boolean;
  transportRequest: TransportRequestDetails | null;
  /** The structured Request For Transport opened from the agreement. */
  transportRft: TransportRft | null;

  transportCompany: string | null;
  transportPrice: string | null;
  transportArranged: boolean;
  reviewAccepted: boolean;
  /** ISO datetime of the last agreement change */
  lastUpdated: string | null;

  // Complete-state fields (docs/COMPLETE_STATE_LIVE_AGREEMENT_SPEC.md) —
  // populated when transport is booked / the review is accepted, and read
  // by the Live Agreement screen.
  /** ISO datetime the review was accepted — the deal's execution date. */
  acceptedAt: string | null;
  /** Movement progress; null until a carrier is booked. */
  transportStatus: TransportStatus | null;
  /** Display label for the booked pickup date, e.g. "1 June 2025". */
  transportPickupDate: string | null;
  /** Payment schedule derived from terms + dates at acceptance. */
  paymentSchedule: PaymentScheduleItem[];
};

export type WorkflowState = {
  request: RequestDetails;
  agreement: AgreementState;
};

function defaultState(): WorkflowState {
  return {
    request: {
      livestockType: "Cattle",
      headCount: 120,
      location: "Dubbo NSW",
      needUntil: demoEndDateInput,
      distanceKm: "350 km",
      budget: "",
      specialRequirements: "",
    },
    agreement: {
      rate: null,
      priceAgreed: false,
      pendingRate: { value: SUGGESTED_RATE, from: "James" },
      datesLabel: null,
      datesConfirmed: false,
      pendingDates: { value: SUGGESTED_DATES_LABEL, from: "James" },
      paymentTerms: null,
      paymentTermsConfirmed: false,
      pendingPaymentTerms: { value: SUGGESTED_PAYMENT_TERMS, from: "James" },
      transportRequestSent: false,
      transportRequest: null,
      transportRft: null,
      transportCompany: null,
      transportPrice: null,
      transportArranged: false,
      reviewAccepted: false,
      lastUpdated: null,
      acceptedAt: null,
      transportStatus: null,
      transportPickupDate: null,
      paymentSchedule: [],
    },
  };
}

/**
 * Parse a dates label like "1 Jun 2025 – 30 Aug 2025" into real dates.
 * Counter-offers are free text, so this can fail — callers must handle null.
 */
export function parseAgreementDates(
  label: string | null,
): { start: Date; end: Date } | null {
  if (!label) return null;
  const parts = label.split(/\s+[–—-]\s+/);
  if (parts.length !== 2) return null;
  const start = new Date(parts[0].trim());
  const end = new Date(parts[1].trim());
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

/**
 * Derive the payment schedule from the agreed terms and dates. Falls back
 * to a single "on start" entry when the dates label can't be parsed.
 */
export function buildPaymentSchedule(
  paymentTerms: string | null,
  datesLabel: string | null,
): PaymentScheduleItem[] {
  const fallback: PaymentScheduleItem[] = [
    { label: "First payment", due: "On agreement start", status: "due" },
  ];
  const range = parseAgreementDates(datesLabel);
  if (!range) return fallback;

  const weekly = /week/i.test(paymentTerms ?? "");
  const items: PaymentScheduleItem[] = [];
  const cursor = new Date(range.start);
  let n = 1;
  while (cursor <= range.end && items.length < 26) {
    items.push({
      label: weekly
        ? `Week ${n}`
        : cursor.toLocaleDateString("en-AU", { month: "long", year: "numeric" }),
      due: cursor.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: items.length === 0 ? "due" : "upcoming",
    });
    if (weekly) cursor.setDate(cursor.getDate() + 7);
    else cursor.setMonth(cursor.getMonth() + 1);
    n += 1;
  }
  return items.length > 0 ? items : fallback;
}

/**
 * Sessions stored before the Complete-state fields existed have accepted
 * agreements with no acceptedAt / transport status / payment schedule.
 * Derive sensible values so the Live Agreement screen works for them too.
 */
function withCompleteStateBackfill(state: WorkflowState): WorkflowState {
  const a = state.agreement;
  if (!a.reviewAccepted && !a.transportArranged) return state;
  return {
    ...state,
    agreement: {
      ...a,
      acceptedAt: a.acceptedAt ?? (a.reviewAccepted ? a.lastUpdated : null),
      transportStatus:
        a.transportStatus ?? (a.transportArranged ? "booked" : null),
      transportPickupDate:
        a.transportPickupDate ??
        (a.transportArranged
          ? (a.transportRft?.preferredDate ?? demoTransportRft.preferredDate)
          : null),
      paymentSchedule:
        a.paymentSchedule.length > 0
          ? a.paymentSchedule
          : a.reviewAccepted
            ? buildPaymentSchedule(a.paymentTerms, a.datesLabel)
            : [],
    },
  };
}

type WorkflowContextValue = {
  state: WorkflowState;
  setRequestDetails: (partial: Partial<RequestDetails>) => void;
  proposeRate: (value: string, from: "James" | "John") => void;
  acceptRate: () => void;
  proposeDates: (value: string, from: "James" | "John") => void;
  acceptDates: () => void;
  proposePaymentTerms: (value: string, from: "James" | "John") => void;
  acceptPaymentTerms: () => void;
  sendRft: () => void;
  acceptTransport: (company: string, price: string) => void;
  /**
   * Move the booked transport to its next stage (picked up → en route →
   * delivered). Returns the new status, or null if there was nothing to
   * advance. Delivered is terminal.
   */
  advanceTransport: () => TransportStatus | null;
  acceptReview: () => void;
  resetWorkflow: () => void;
  isComplete: boolean;
  /**
   * True once the stored session (if any) has been read back from
   * localStorage. Screens that branch hard on workflow state (e.g. the
   * Live Agreement screen) should wait for this before deciding.
   */
  hasHydrated: boolean;
};

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function PaddockmeWorkflowProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<WorkflowState>(defaultState);
  const [hasLoadedStoredState, setHasLoadedStoredState] = useState(false);

  // Load persisted state on mount (after first paint, so SSR/CSR markup matches).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkflowState>;
        setState((prev) =>
          withCompleteStateBackfill({
            request: { ...prev.request, ...parsed.request },
            agreement: { ...prev.agreement, ...parsed.agreement },
          }),
        );
      }
    } catch {
      // ignore corrupt/blocked storage
    } finally {
      setHasLoadedStoredState(true);
    }
  }, []);

  // Persist on every change after the first localStorage read has completed.
  useEffect(() => {
    if (!hasLoadedStoredState) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [hasLoadedStoredState, state]);

  function setRequestDetails(partial: Partial<RequestDetails>) {
    setState((prev) => ({ ...prev, request: { ...prev.request, ...partial } }));
  }

  function proposeRate(value: string, from: "James" | "John") {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        pendingRate: { value, from },
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function acceptRate() {
    setState((prev) => {
      const pending = prev.agreement.pendingRate;
      if (!pending) return prev;
      return {
        ...prev,
        agreement: {
          ...prev.agreement,
          rate: pending.value,
          priceAgreed: true,
          pendingRate: null,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  }

  function proposeDates(value: string, from: "James" | "John") {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        pendingDates: { value, from },
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function acceptDates() {
    setState((prev) => {
      const pending = prev.agreement.pendingDates;
      if (!pending) return prev;
      return {
        ...prev,
        agreement: {
          ...prev.agreement,
          datesLabel: pending.value,
          datesConfirmed: true,
          pendingDates: null,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  }

  function proposePaymentTerms(value: string, from: "James" | "John") {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        pendingPaymentTerms: { value, from },
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function acceptPaymentTerms() {
    setState((prev) => {
      const pending = prev.agreement.pendingPaymentTerms;
      if (!pending) return prev;
      return {
        ...prev,
        agreement: {
          ...prev.agreement,
          paymentTerms: pending.value,
          paymentTermsConfirmed: true,
          pendingPaymentTerms: null,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  }

  function acceptTransport(company: string, price: string) {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        transportCompany: company,
        transportPrice: price,
        transportArranged: true,
        transportStatus: "booked",
        transportPickupDate:
          prev.agreement.transportRft?.preferredDate ??
          demoTransportRft.preferredDate,
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function advanceTransport(): TransportStatus | null {
    // Read from the rendered state (not the setState updater) so callers get
    // the new status back synchronously — they use it to post the matching
    // update into the coordination thread.
    const current = state.agreement.transportStatus;
    if (!state.agreement.transportArranged || !current) return null;
    const next = nextTransportStatus(current);
    if (!next) return null;
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        transportStatus: next,
        lastUpdated: new Date().toISOString(),
      },
    }));
    return next;
  }

  function acceptReview() {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        reviewAccepted: true,
        acceptedAt: new Date().toISOString(),
        paymentSchedule: buildPaymentSchedule(
          prev.agreement.paymentTerms,
          prev.agreement.datesLabel,
        ),
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  /**
   * Turn the accepted agreement into a Request For Transport and "send" it
   * to the transport side of PaddockME. Built from the live request (pickup
   * + livestock) on top of the demo RFT template (route, distance, access).
   */
  function sendRft() {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        transportRequestSent: true,
        transportRft: {
          ...demoTransportRft,
          pickup: prev.request.location,
          livestock: `${prev.request.headCount} ${prev.request.livestockType}`,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function resetWorkflow() {
    setState(defaultState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }

  const isComplete =
    state.agreement.priceAgreed &&
    state.agreement.datesConfirmed &&
    state.agreement.paymentTermsConfirmed &&
    state.agreement.transportArranged &&
    state.agreement.reviewAccepted;

  const value = useMemo<WorkflowContextValue>(
    () => ({
      state,
      setRequestDetails,
      proposeRate,
      acceptRate,
      proposeDates,
      acceptDates,
      proposePaymentTerms,
      acceptPaymentTerms,
      sendRft,
      acceptTransport,
      advanceTransport,
      acceptReview,
      resetWorkflow,
      isComplete,
      hasHydrated: hasLoadedStoredState,
    }),
    [state, isComplete, hasLoadedStoredState],
  );

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function usePaddockmeWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error(
      "usePaddockmeWorkflow must be used within a PaddockmeWorkflowProvider",
    );
  }
  return ctx;
}

/* ---------- display helpers ---------- */

/** e.g. "120 Cattle" — used across the workspace + review screens. */
export function livestockLabel(request: RequestDetails): string {
  return `${request.headCount} ${request.livestockType}`;
}

/** e.g. "Need feed until 30 Aug 2025" — landowner + account screens. */
export function needUntilLabel(request: RequestDetails): string {
  const date = new Date(`${request.needUntil}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Dates flexible";
  const formatted = date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `Need feed until ${formatted}`;
}

/** Friendly "last updated" time for the live agreement panel. */
export function lastUpdatedLabel(iso: string | null): string {
  if (!iso) return "Not updated yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Not updated yet";
  return date
    .toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })
    .toUpperCase();
}
