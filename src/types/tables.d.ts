export interface Avatar {
  id: number;
  uuid: string;
  src: string;
  file_id: string | null;
  type: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  propertyId: string | null;
  artisanId: string | null;
}

export interface Business {
  uuid: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  addressId: string | null;
  fileId: string | null;
  cac: Cac | null;
}

export interface Cac {
  id: number;
  uuid: string;
  src: string;
  file_id: string | null;
  type: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  propertyId: string | null;
  artisanId: string | null;
}

export interface Subscription {
  id: number;
  uuid: string;
  ref: string | null;
  userRef: string | null;
  type: string;
  expired: boolean;
  duration: string;
  price: number;
  active: boolean;
  updatedAt: string;
  nextPaymentAt: string | null;
  createdAt: string;
}

export interface GovtId {
  id: number;
  uuid: string;
  src: string;
  file_id: string | null;
  type: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
  propertyId: string | null;
  artisanId: string | null;
}

export interface User {
  uuid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  skills: string | null;
  bio: string | null;
  gender: string | null;
  type: string;
  root: boolean;
  authProvider: string;
  verified: boolean;
  fileId: string;
  govtFileId: string | null;
  keyId: string | null;
  createdAt: string;
  updatedAt: string;
  businessInfoId: string | null;
  subscriptionId: string | null;
  restrictionid: string | null;
  avatar: Avatar;
  business: Business | null;
  subscription: Subscription | null;
  govtId: GovtId | null;
}

export interface Property {
  id: number;
  uuid: string;
  marketplace: boolean;
  price: string;
  phone: string | null;
  type: string;
  hasLegalDocuments: boolean;
  title: string;
  currency: string;
  description: string;
  listingType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tourFileId: string | null;
  userId: string;
  specificationsId: string;
  specifications:{
    bedrooms: number;
    bathrooms: number;
    squareFeet: string;
    lotSize?: number | null;
    yearBuilt: string;
    furnishing: FurnishingType;
    parkingSpaces: number;
    gym: boolean;
    garden: boolean;
    pool: boolean;
  },
  addressId: string;
  images: {
    id: number;
    uuid: string;
    src: string;
    file_id: string | null;
    type: string;
    provider: string;
    createdAt: string;
    updatedAt: string;
    propertyId: string;
    artisanId: string | null;
  }[];
  address: {
    id: number;
    uuid: string;
    longitude: number;
    latitude: number;
    address: string;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    createdAt: string;
    updatedAt: string;
  };
  tags: {
    id: number;
    uuid: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    propertyId: string;
  }[];
}

export interface Ads {
  id: number;
  uuid: string;
  title: string;
  description: string;
  link: string | null;
  updatedAt: string;
  createdAt: string;
  fileId: string;
}