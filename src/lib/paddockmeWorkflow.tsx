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
import { demoTransportRft, type TransportRft } from "./paddockmeDemoData";

const STORAGE_KEY = "paddockme-workflow-v2";

// Opening offers — framed as James' (the livestock owner's) initial
// proposal, which John (the landowner) can accept or counter. Whoever's
// turn it isn't sees the other side's current offer and can accept it or
// send back their own.
export const SUGGESTED_RATE = "$12.50 / head / week";
export const SUGGESTED_DATES_LABEL = "1 Jun 2025 – 30 Aug 2025";
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
};

export type WorkflowState = {
  request: RequestDetails;
  agreement: AgreementState;
};

function defaultNeedUntil(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

function defaultState(): WorkflowState {
  return {
    request: {
      livestockType: "Cattle",
      headCount: 120,
      location: "Dubbo NSW",
      needUntil: defaultNeedUntil(),
      distanceKm: "300 km",
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
  acceptReview: () => void;
  resetWorkflow: () => void;
  isComplete: boolean;
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
        setState((prev) => ({
          request: { ...prev.request, ...parsed.request },
          agreement: { ...prev.agreement, ...parsed.agreement },
        }));
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
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function acceptReview() {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        reviewAccepted: true,
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
      acceptReview,
      resetWorkflow,
      isComplete,
    }),
    [state, isComplete],
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
  return date.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}
