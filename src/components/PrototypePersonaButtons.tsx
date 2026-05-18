"use client";

import { useRouter } from "next/navigation";
import { useFlash } from "@/components/FlashProvider";
import {
  personaNames,
  setPrototypePersona,
  type PersonaId,
} from "@/lib/prototypeStore";

const buttons: { id: PersonaId; href: string }[] = [
  { id: "farmer-a", href: "/agreements" },
  { id: "farmer-b", href: "/agreements" },
  { id: "driver-1", href: "/transport" },
];

export function PrototypePersonaButtons() {
  const router = useRouter();
  const flash = useFlash();

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          onClick={() => {
            setPrototypePersona(button.id);
            flash(`Continuing as ${personaNames[button.id]}.`, "success");
            router.push(button.href);
          }}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-sage-deep/25 bg-cream px-4 py-2 text-sm font-semibold text-sage-deep transition hover:bg-sage-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
        >
          Continue as {personaNames[button.id]}
        </button>
      ))}
    </div>
  );
}
