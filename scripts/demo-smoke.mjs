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
  "In /workspace/agreement-glenbarra, click Agree as Dale, switch to Brett, and confirm the same section.",
  "Click Open transport room and confirm it opens /transport/transport-glenbarra.",
  "In the transport room, switch to Driver and confirm the quote/backload moment is visible.",
  "Switch to Farmer A and confirm Accept the quote changes the room state.",
  "Open /requests as Brett and confirm Offer a paddock opens the paddock picker.",
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
