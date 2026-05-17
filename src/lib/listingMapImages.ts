export const listingMapImages: Record<string, string> = {
  "paddock-glenbarra": "/location-maps/gundagai.png",
  "paddock-wattle-creek": "/location-maps/cowra.png",
  "paddock-hillview": "/location-maps/gippsland.png",
};

export function getListingMapImageSrc(listingId: string): string | undefined {
  return listingMapImages[listingId];
}
