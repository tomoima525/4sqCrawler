import fetch from 'node-fetch';
import type { Venue } from './types';
const version = '20130815';
const baseUrl = 'https://api.foursquare.com/v2/';

export default async function getVenues(params: string): Promise<Array<Venue>> {
  const queryParams = [
    `client_id=${process.env.CLIENT_ID}`,
    `client_secret=${process.env.CLIENT_KEY}`,
    `v=${version}`,
    params
  ].join('&');
  const url = `${baseUrl}/venues/search/?${queryParams}`;
  const response = await fetch(url);
  const json = await response.json();

  return json.response.venues;
}
