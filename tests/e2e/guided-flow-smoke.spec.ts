import { expect, test } from "playwright/test";

const routeChecks = [
  {
    path: "/",
    text: [
      "Find Feed. Find Stock. Move Livestock.",
      "I Need Feed",
      "I Have Feed",
      "Transport",
      "Find transport jobs",
    ],
  },
  {
    path: "/requests/new",
    text: ["What stock do you have?", "How many head?", "Where is your stock now?"],
  },
  {
    path: "/requests/new/requirements",
    text: ["Feed Requirements", "Need feed until", "Distance willing to travel"],
  },
  {
    path: "/requests/matches",
    text: ["Suitable Properties Found", "Green Hills Farm", "Refine Search"],
  },
  {
    path: "/properties/green-hills-farm",
    text: ["Green Hills Farm", "Bungendore NSW", "Request Discussion"],
  },
  {
    path: "/requests/sent",
    text: ["Request Sent!", "Continue as John", "John Smith"],
  },
  {
    path: "/landowner/requests/1023",
    text: ["New Request Received", "Accept Discussion", "Decline"],
  },
  {
    path: "/workspaces/1023",
    text: ["Workspace", "Green Hills Farm", "Continue to Agreement"],
  },
  {
    path: "/workspaces/1023/agreement",
    text: ["Agree the terms", "Checklist", "Live Agreement"],
  },
  {
    path: "/workspaces/1023/review",
    text: ["Review Agreement", "Accept Agreement & Send RFT", "Request For Transport"],
  },
  {
    // Direct navigation with no RFT on foot must NOT show a phantom deal —
    // these pages explain the stage instead. The full quote/booking surfaces
    // are covered by the walkthrough spec, which reaches them via the flow.
    path: "/transport/quotes/1023",
    text: ["No transport request yet", "Go to your Agreement"],
  },
  {
    path: "/transport/rooms/1023",
    text: ["No transport underway", "Go to your Agreement"],
  },
] as const;

test.describe("PaddockME 2.0 guided flow smoke", () => {
  for (const check of routeChecks) {
    test(`${check.path} renders guided-flow copy`, async ({ page }) => {
      await page.goto(check.path);

      for (const text of check.text) {
        await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
      }
    });
  }
});
