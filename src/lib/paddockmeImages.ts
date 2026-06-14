/**
 * Central image manifest for the PaddockME guided-workflow MVP.
 *
 * Rules (from the rebuild brief):
 * - Never hardcode image paths in components. Import from here.
 * - Keep these key names stable. When real photography arrives, replace
 *   the files in /public/images/paddockme/ — no code changes needed.
 */
export const paddockmeImages = {
  homepageHero: "/images/paddockme/hero-homepage.jpg",
  registrationBackground: "/images/paddockme/registration-cattle.jpg",
  requestStepCow: "/images/paddockme/request-step-cow.jpg",
  requestStepRoad: "/images/paddockme/request-step-road.jpg",
  matchesPaddockCard: "/images/paddockme/matches-paddock-card.jpg",
  matchesRiverbendCard: "/images/paddockme/matches-riverbend-card.jpg",
  propertyMain: "/images/paddockme/property-main-green-hills.jpg",
  propertyGalleryOne: "/images/paddockme/property-gallery-1.jpg",
  propertyGalleryTwo: "/images/paddockme/property-gallery-2.jpg",
  propertyGalleryThree: "/images/paddockme/property-gallery-3.jpg",
  propertyGalleryFour: "/images/paddockme/property-gallery-4.jpg",
  requestSentBackground: "/images/paddockme/request-sent-paddock.jpg",
  landownerRequestBackground: "/images/paddockme/landowner-request-cattle.jpg",
  workspaceCattle: "/images/paddockme/workspace-cattle.jpg",
  workspaceProperty: "/images/paddockme/workspace-property.jpg",
  agreementReviewSide: "/images/paddockme/agreement-review-cattle.jpg",
  transportQuotesSide: "/images/paddockme/transport-quotes-truck.jpg",
  footerFarmBanner: "/images/paddockme/footer-australian-farm.jpg",
} as const;

export type PaddockmeImageKey = keyof typeof paddockmeImages;
