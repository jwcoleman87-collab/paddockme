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
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "paddockme-workflow-v1";

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

export type AgreementState = {
  rate: string | null;
  priceAgreed: boolean;
  datesConfirmed: boolean;
  paymentTerms: string | null;
  paymentTermsConfirmed: boolean;
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
      datesConfirmed: false,
      paymentTerms: null,
      paymentTermsConfirmed: false,
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
  setRate: (rate: string) => void;
  confirmDates: () => void;
  setPaymentTerms: (terms: string) => void;
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
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g. private browsing)
    }
  }, [state]);

  function setRequestDetails(partial: Partial<RequestDetails>) {
    setState((prev) => ({ ...prev, request: { ...prev.request, ...partial } }));
  }

  function setRate(rate: string) {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        rate,
        priceAgreed: true,
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function confirmDates() {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        datesConfirmed: true,
        lastUpdated: new Date().toISOString(),
      },
    }));
  }

  function setPaymentTerms(terms: string) {
    setState((prev) => ({
      ...prev,
      agreement: {
        ...prev.agreement,
        paymentTerms: terms,
        paymentTermsConfirmed: true,
        lastUpdated: new Date().toISOString(),
      },
    }));
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
      agreement: { ...prev.agreement, reviewAccepted: true },
    }));
  }

  function resetWorkflow() {
    setState(defaultState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const isComplete =
    state.agreement.priceAgreed &&
    state.agreement.datesConfirmed &&
    state.agreement.paymentTermsConfirmed &&
    state.agreement.transportArranged;

  return (
    <WorkflowContext.Provider
      value={{
        state,
        setRequestDetails,
        setRate,
        confirmDates,
        setPaymentTerms,
        acceptTransport,
        acceptReview,
        resetWorkflow,
        isComplete,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function usePaddockmeWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) {
    throw new Error(
      "usePaddockmeWorkflow must be used within PaddockmeWorkflowProvider",
    );
  }
  return ctx;
}

/* ---------- Display helpers ---------- */

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** e.g. "120 Cattle" */
export function livestockLabel(request: RequestDetails): string {
  return `${request.headCount} ${request.livestockType}`;
}

/** e.g. "Needed until 12 August 2026" */
export function needUntilLabel(request: RequestDetails): string {
  return `Needed until ${formatDateLong(request.needUntil)}`;
}

/** e.g. "10:19 AM" or "Not yet confirmed" */
export function lastUpdatedLabel(iso: string | null): string {
  if (!iso) return "Not yet confirmed";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
