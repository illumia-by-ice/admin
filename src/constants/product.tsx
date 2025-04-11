// types.ts
export interface Tag {
  name: string;
}

export interface Specifications {
  bedrooms: number;
  bathrooms: number;
  squareFeet: string | null;
  lotSize: string | null;
  yearBuilt?: string;
  furnishing: "SEMI_FURNISHED" | "FURNISHED" | "UNFURNISHED";

  parkingSpaces: number;
  gym: boolean;
  garden: boolean;

  pool: boolean;
}

type PROPERTY_STATUS = "AVAILABLE" | "NOT AVAILABLE" | "SOLD";
export type PROPERTY_TYPE = "PROPERTY" | "PRODUCT" | "SERVICES";
export interface Property {
  uuid: string;
  price: string;
  title: string;
  status: PROPERTY_STATUS;
  description: string;
  marketplace: boolean;
  phone?: string;
  type: PROPERTY_TYPE;
  currency: string;
  listingType: "RENT" | "SALE";
  specifications: Specifications;
  images: Image[];

  videoTour?: Image;

  address: Address;
  // id;
  agent: Agent;
  tags: Tag[];
  userId?: string;
}

export type Product = Property
export type Avatar = any;
type userType = "BUYER" | "ADMIN" | "AGENT" | "VENDOR" | "ARTISAN";
export interface Agent {
  firstName: string;
  lastName: string;
  // uuid:string;
  avatar: Avatar;
  email: string;
  root: boolean; // is from Aje
  bio: string;
  phone: string;
  type: userType;

  business?: Business;
}

export interface Business {
  name: string;
  phone?: string;
  address: Address;
}

export interface Address {
  longitude?: string;
  latitude?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode: string;
}

export interface Image {
  provider: "SELF_HOSTED" | string;
  src: string;
  type: string;
}

export interface ProductFormData {
  title: string;
  price: string;
  description: string;
  tags: string[];
  address: string;
  images: string[];
}

export const availableTags = [
  "All",
  "Electronics",
  "Clothing",
  "Home",
  "Garden",
  "Sports",
  "Automotive",
  "Books",
  "Toys",
  "Health",
  "Beauty",
];

export const initialProducts: Property[] = [];
