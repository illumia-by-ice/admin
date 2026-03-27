import { AxiosError, AxiosResponse } from "axios";
import api from "../axios-client";

// Dashboard data response interface
export interface DashboardResponse {
  counts: {
    users: number;
    properties: number;
    products: number;
    verifications: number;
    pendingVerifications: number;
    reviews: number;
    files: number;
    transactions: number;
    advertisements: number;
  };
  recentUsers: User[];
  recentVerifications: Verification[];
  recentTransactions: Transaction[];
  recentAds: Advertisement[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  avatarUrl?: string;
}

export interface Verification {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  user: {
    name: string;
    email: string;
  };
  documentType: string;
  created_at: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  type: string;
  userId: string;

  created_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  status: "active" | "inactive" | "scheduled";
  startDate: string;
  endDate: string;
  clicks: number;
  impressions: number;
  created_at: string;
}

/**
 * Fetch dashboard data
 * @returns DashboardResponse with counts and recent data
 */
export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response: AxiosResponse<DashboardResponse> = await api.get(
      "/admin/dashboard"
    );
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const { status, data } = axiosError.response as any;

      if (status === 401 || status === 403) {
        throw new Error("You are not authorized to access this data");
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    }

    throw new Error(
      "Failed to fetch dashboard data. Please check your connection and try again."
    );
  }
};

export interface AdImage {
  id: string;
  src: string;
  name: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  cta: string;
  cta_link: string;
  images: AdImage[];
  status: string;
  placement: string;
  start_date: string;
  end_date: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  currency: string;
}

export interface AdsResponse {
  data: Ad[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAds = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    placement?: string;
    search?: string;
  } = {}
): Promise<AdsResponse> => {
  const response = await api.get("/admin/ads", { params });
  return response.data;
};

export const createAd = async (data: {
  title: string;
  description: string;
  cta: string;
  cta_link: string;
}) => {
  const response = await api.post(`/admin/ads`, data,{
    headers:{
      "Content-Type": "multipart/form-data",
    }
  });
  return response.data;
};
export const updateAd = async (
  id: string,
  data: { title: string; description: string; cta: string; cta_link: string }
): Promise<Ad> => {
  const response = await api.put(`/admin/ads/${id}`, data);
  return response.data;
};

export const deleteAd = async (id: string): Promise<void> => {
  await api.delete(`/admin/ads/${id}`);
};

export const deleteAdImage = async (
  adId: string,
  imageId: string
): Promise<void> => {
  await api.delete(`/admin/ads/${adId}/images/${imageId}`);
};

export const addAdImage = async (
  adId: string,
  file: File
): Promise<AdImage> => {
  const formData = new FormData();
  formData.append("images", file);
  const response = await api.post(`/admin/ads/${adId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Properties API Types and Functions
export interface PropertyImage {
  id: string;
  src: string;
  name: string;
  type: string;
  provider: string;
}

export interface PropertySpecifications {
  bedrooms: number;
  beds: number;
  bathrooms: number;
  squareFeet?: string;
  lotSize?: string;
  yearBuilt?: string;
  furnishing?: string;
  parkingSpaces?: number;
  gym?: boolean;
  garden?: boolean;
  pool?: boolean;
}

export interface PropertyAddress {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  longitude?: number;
  latitude?: number;
}

export interface PropertyTag {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  amenities?: string;
  lat?: number;
  lon?: number;
  city?: string;
  youtube_link?: string;
  address: string;
  listingType: string;
  type: string;
  bathrooms: number;
  beds: number;
  bedrooms: number;
  parking_spaces?: number;
  square_feet?: string;
  year_built?: string;
  user_id: string;
  status: string;
  marketplace: boolean;
  hasLegalDocuments: boolean;
  phone?: string;
  images: PropertyImage[];
  tags: PropertyTag[];
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertiesResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getProperties = async (
  params: {
    page?: number;
    limit?: number;
    type?: string;
    listingType?: string;
    status?: string;
    city?: string;
    search?: string;
  } = {}
): Promise<PropertiesResponse> => {
  const response = await api.get("/property", { params });
  return response.data;
};

// Interface for PropertyFormData structure expected by backend
export interface PropertyFormData {
  json: string; // Stringified JSON data
  images: File[]; // Array of image files
}

export const createProperty = async (formData: FormData): Promise<Property> => {
  const response = await api.post("/property", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProperty = async (
  id: string,
  formData: FormData
): Promise<Property> => {
  const response = await api.put(`/property/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProperty = async (id: string): Promise<void> => {
  await api.delete(`/property/${id}`);
};

export const addPropertyImage = async (
  propertyId: string,
  file: File
): Promise<PropertyImage> => {
  const formData = new FormData();
  formData.append("images", file);
  const response = await api.post(`/property/${propertyId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deletePropertyImage = async (
  propertyId: string,
  imageId: string
): Promise<void> => {
  await api.delete(`/property/${propertyId}/images/${imageId}`);
};

// Products API Types and Functions
export interface ProductImage {
  id: string;
  src: string;
  name: string;
  type: string;
  provider: string;
}

export interface ProductUser {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  created_at: string;
  profile_photo: ProductImage | null;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  lat?: number;
  lon?: number;
  city: string;
  address: string;
  type: string;
  user_id: string;
  images: ProductImage[];
  user?: ProductUser;
  reviews?: ProductReview[];
  created_at: string;
  updated_at: string;
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getProducts = async (
  params: {
    page?: number;
    limit?: number;
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  } = {}
): Promise<ProductsResponse> => {
  const response = await api.get("/marketplace/product", { params });
  return response.data;
};

export const getProduct = async (id: string): Promise<{ data: Product }> => {
  const response = await api.get(`/marketplace/product/${id}`);
  return response.data;
};

export const createProduct = async (formData: FormData): Promise<Product> => {
  const response = await api.post("/marketplace/product", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (
  id: string,
  formData: FormData
): Promise<Product> => {
  const response = await api.put(`/marketplace/product/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/marketplace/product/${id}`);
};

export const getMyProducts = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<ProductsResponse> => {
  const response = await api.get("/marketplace/product/mine", { params });
  return response.data;
};
