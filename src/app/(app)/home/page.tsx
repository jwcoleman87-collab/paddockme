import { CheckCircle } from "lucide-react";

export default function AppHomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-2xl bg-sage-mist border border-sage-glow p-6 inline-flex items-center gap-3 text-sage-deep">
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">Authenticated home</span>
      </div>
      <h1 className="font-display italic text-4xl text-sage-deep mt-8 mb-2">
        Welcome to PaddockME.
      </h1>
      <p className="text-bark/80 max-w-2xl">
        Day-one scaffold. The home dashboard, request flow, match engine, and
        workspace will land here in the next builds.
      </p>
    </div>
  );
}
