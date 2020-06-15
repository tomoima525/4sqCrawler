export type Location = {
  address: string;
  crossStreet: string;
  postalCode: string;
  cc: string;
  city: string;
  country: string;
  state: string;
  lat: number;
  lng: number;
  labeledLatLngs: Array<any>;
  formattedAddress: Array<string>;
};

export type Category = {
  id: string;
  name: string;
  primary: boolean;
};

export type Venue = {
  id: string;
  name: string;
};

export type BestPhoto = {
  prefix: string;
  suffix: string;
};

export type Tips = {
  count: number;
};

export type VenueDetail = {
  id: string;
  name: string;
  rating: number;
  bestPhoto: BestPhoto;
  tips: Tips;
  location: Location;
  categories: Array<Category>;
  createdAt: number;
};

export type Empty = undefined;
