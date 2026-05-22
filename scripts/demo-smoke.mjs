const DEFAULT_BASE_URL = "https://paddockme-oz51.vercel.app";

const baseUrl = (process.env.DEMO_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

const checks = [
  {
    path: "/",
    name: "Investor landing",
    mustInclude: [
      "Feed, paddocks and trucks in one room.",
      "Try the demo",
      "Dale",
      "Brett",
      "Wayne",
    ],
  },
  {
    path: "/sign-in",
    name: "Sign-in entry",
    mustInclude: ["Welcome back.", "Sign in", "Create an account"],
  },
  {
    path: "/sign-up",
    name: "Sign-up entry",
    mustInclude: ["Make a new account.", "Create account", "Sign in"],
  },
  {
    path: "/onboarding",
    name: "Onboarding role picker",
    mustInclude: [
      "What brings you here?",
      "I have livestock that need paddocks",
      "I have paddocks that could take stock",
      "I move stock for a living",
    ],
  },
  {
    path: "/agreements",
    name: "Dale agreements home",
    mustInclude: ["Dale", "Brett", "Wayne"],
  },
  {
    path: "/workspace/agreement-glenbarra",
    name: "Glenbarra agreement workspace",
    mustInclude: [
      "Glenbarra",
      "Dale Morgan",
      "Brett Donnelly",
      "Open transport room",
      "View snapshot",
    ],
  },
  {
    path: "/transport/transport-glenbarra",
    name: "Glenbarra transport room",
    mustInclude: ["Central West", "Southern NSW", "Wayne", "Driver"],
  },
  {
    path: "/messages",
    name: "Inbox",
    mustInclude: ["Messages"],
  },
  {
    path: "/workspace/agreement-glenbarra/snapshot",
    name: "Agreement snapshot",
    mustInclude: ["Glenbarra", "Dale", "Brett"],
  },
  {
    path: "/requests",
    name: "Landowner request browser",
    mustInclude: ["Tash", "Dale"],
  },
  {
    path: "/runs",
    name: "Wayne transport pipeline",
    mustInclude: ["Wayne"],
  },
  {
    path: "/profile",
    name: "Prototype reset surface",
    mustInclude: ["Reset prototype state"],
  },
];

const manualChecks = [
  "On /agreements, click Sections to confirm and confirm it opens /workspace/agreement-glenbarra.",
  "In /workspace/agreement-glenbarra, use Farmer A: Tap to agree, switch to Farmer B (Brett), and confirm the same section.",
  "Click Open transport room and confirm it opens /transport/transport-glenbarra.",
  "In the transport room, switch to Driver Transporter (Wayne) and confirm the quote/backload moment is visible.",
  "Switch to Farmer A Livestock owner (Dale), open the Rate tab, and confirm Accept rate changes the room state.",
  "Switch persona to Brett before opening /requests; confirm Offer a paddock opens the Pick a paddock to offer picker.",
];

let failures = 0;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const statusOk = response.status >= 200 && response.status < 300;
    const html = await response.text();
    const missing = check.mustInclude.filter((text) => !html.includes(text));

    if (!statusOk || missing.length > 0) {
      failures += 1;
      console.error(`FAIL ${check.name} (${check.path})`);
      console.error(`  status: ${response.status}`);
      if (missing.length > 0) {
        console.error(`  missing: ${missing.join(", ")}`);
      }
      continue;
    }

    console.log(`PASS ${check.name} (${check.path})`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${check.name} (${check.path})`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log("");
console.log("Manual demo clicks still required:");
for (const item of manualChecks) {
  console.log(`- ${item}`);
}

if (failures > 0) {
  console.error("");
  console.error(`${failures} route smoke check(s) failed for ${baseUrl}`);
  process.exit(1);
}

console.log("");
console.log(`All route smoke checks passed for ${baseUrl}`);
