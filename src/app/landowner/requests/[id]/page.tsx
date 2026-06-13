"use client";

import { Bell, UserCircle2 } from "lucide-react";
import { PaddockMeLogo } from "@/components/paddockme/PaddockMeLogo";
import { PmButton } from "@/components/paddockme/PmButton";
import { paddockmeImages } from "@/lib/paddockmeImages";
import { demoLivestockOwner, demoRequest } from "@/lib/paddockmeDemoData";
import {
  usePaddockmeWorkflow,
  livestockLabel,
  needUntilLabel,
} from "@/lib/paddockmeWorkflow";

/** Screen 8 — Landowner receives a discussion request: accept or decline. */
export default function LandownerRequestPage() {
  const { state } = usePaddockmeWorkflow();

  return (
    <main
      className="relative flex min-h-screen flex-col bg-cover bg-center"
      style={{
        backgroundImage: `url(${paddockmeImages.landownerRequestBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-pm-green-900/30" aria-hidden />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-6">
        <PaddockMeLogo variant="light" />
        <div className="flex items-center gap-3 text-white">
          <span className="relative" aria-label="1 new notification">
            <Bell className="h-6 w-6" aria-hidden />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pm-gold-500 text-[10px] font-bold text-pm-charcoal">
              1
            </span>
          </span>
          <UserCircle2 className="h-7 w-7" aria-hidden />
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h1 className="text-xl font-extrabold text-pm-charcoal">
            New Request Received
          </h1>
          <p className="mt-2 text-sm text-pm-muted">
            {demoLivestockOwner.name} is seeking agistment for:
          </p>
          <div className="mt-4 rounded-xl bg-pm-cream-50 px-4 py-4">
            <p className="text-lg font-extrabold text-pm-green-900">
              {livestockLabel(state.request)}
            </p>
            <p className="mt-1 text-sm text-pm-charcoal">
              {needUntilLabel(state.request)}
            </p>
            <p className="text-sm text-pm-muted">
              Located near {state.request.location}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <PmButton href={`/workspaces/${demoRequest.id}`} className="flex-1">
              Accept Discussion
            </PmButton>
            <PmButton variant="outline" href="/" className="flex-1">
              Decline
            </PmButton>
          </div>
        </div>
      </div>
    </main>
  );
}
