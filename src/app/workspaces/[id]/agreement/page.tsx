"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { ChecklistPanel } from "@/components/paddockme/ChecklistPanel";
import {
  ChatPanel,
  LiveAgreementPanel,
  NegotiationStep,
} from "@/components/paddockme/WorkspacePanels";
import { AppBottomNav } from "@/components/paddockme/PmNav";
import { demoConversation, demoRequest } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  lastUpdatedLabel,
  PAYMENT_TERM_CHOICES,
} from "@/lib/paddockmeWorkflow";

/**
 * Screen 10 — the core product screen: guided agreement checklist,
 * conversation, and a live agreement summary forming in real time.
 * Mobile stacks: Live Agreement → Checklist → Conversation.
 */
export default function WorkspaceAgreementPage() {
  const {
    state,
    proposeRate,
    acceptRate,
    proposeDates,
    acceptDates,
    proposePaymentTerms,
    acceptPaymentTerms,
  } = usePaddockmeWorkflow();
  const { agreement } = state;

  const checklistItems = [
    { label: "Stock Numbers", done: true },
    { label: "Property Details", done: true },
    { label: "Price", done: agreement.priceAgreed },
    { label: "Dates", done: agreement.datesConfirmed },
    { label: "Payment Terms", done: agreement.paymentTermsConfirmed },
    { label: "Transport", done: agreement.transportArranged },
  ];
  const firstPending = checklistItems.findIndex((item) => !item.done);
  const checklist = checklistItems.map((item, idx) => ({
    ...item,
    current: idx === firstPending,
  }));

  const agreementFields = [
    { label: "Livestock", value: livestockLabel(state.request) },
    { label: "Duration", value: demoRequest.duration },
    {
      label: "Rate",
      value: agreement.rate ?? "Pending",
      pending: !agreement.priceAgreed,
    },
    {
      label: "Dates",
      value: agreement.datesLabel ?? "Pending",
      pending: !agreement.datesConfirmed,
    },
    {
      label: "Payment Terms",
      value: agreement.paymentTerms ?? "Pending",
      pending: !agreement.paymentTermsConfirmed,
    },
    { label: "Property", value: "Green Hills Farm" },
    {
      label: "Transport",
      value: agreement.transportArranged
        ? `${agreement.transportCompany} — ${agreement.transportPrice}`
        : "Pending",
      pending: !agreement.transportArranged,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-pm-cream-50">
      <header className="border-b border-pm-border bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/workspaces/1023"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-pm-green-900 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Workspace
          </Link>
          <PaddockMeLogo variant="dark" />
          <PmButton
            href="/workspaces/1023/review"
            v