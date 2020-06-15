import fetch from 'node-fetch';
import type { Empty, VenueDetail } from './types';
const version = '20130815';
const baseUrl = 'https://api.foursquare.com/v2/';

export default async function getSingleVenue(id: string): Promise<VenueDetail | Empty> {
  const queryParams = [
    `client_id=${process.env.CLIENT_ID}`,
    `client_secret=${process.env.CLIENT_KEY}`,
    `v=${version}`
  ].join('&');
  try {
    const url = `${baseUrl}/venues/${id}/?${queryParams}`;
    const response = await fetch(url);
    const json = await response.json();
    return json.response.venue;
  } catch (e) {
    console.log(`getSingleVenue error: ${e}`);
    return undefined;
  }
}
