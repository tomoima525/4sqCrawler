import type { VenueDetail } from './types';

/**
 * Parse Venue object to string
 * @param venue
 */
export default function parseVenue(venue: VenueDetail): string {
  const { location, categories, bestPhoto } = venue;
  if (!location) return '';
  const {
    labeledLatLngs,
    formattedAddress,
    crossStreet,
    address,
    lat,
    lng,
    postalCode,
    cc,
    state,
    country,
    city
  } = location;
  const category = categories[0];
  let bestPhotoUrl;
  if (bestPhoto) {
    const { prefix, suffix } = bestPhoto;
    bestPhotoUrl = `${prefix}width960${suffix}`;
  } else {
    bestPhotoUrl = '';
  }
  const data = {
    id: venue.id,
    name: `"${venue.name}"`,
    address: `"${address}"`,
    lat,
    lng,
    postalCode,
    city,
    state,
    country,
    cc,
    categoryId: category.id,
    categoryName: category.name,
    primary: category.primary,
    bestPhoto: bestPhotoUrl,
    rating: venue.rating,
    tips: venue.tips.count,
    createdAt: venue.createdAt
  };
  const commaSeperatedStr = (Object.keys(data) as Array<keyof typeof data>).map((key) => data[key]).join(',');
  return commaSeperatedStr;
}
