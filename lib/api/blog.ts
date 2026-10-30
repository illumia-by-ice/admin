import api from "../axios-client";

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content?: string;
  cover_src: string | null;
  author: string | null;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogInput {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  cover_src?: string | null;
  author?: string | null;
  tags?: string[];
  status: BlogStatus;
}

export interface BlogListResponse {
  data: BlogPost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const getBlogPosts = async (params: { page?: number; limit?: number; search?: string }) => {
  const response = await api.get<BlogListResponse>("/admin/blog", { params });
  return response.data;
};

export const getBlogPost = async (id: string) => {
  const response = await api.get<{ data: BlogPost }>(`/admin/blog/${id}`);
  return response.data.data;
};

export const createBlogPost = async (input: BlogInput) => {
  const response = await api.post<{ data: BlogPost }>("/admin/blog", input);
  return response.data.data;
};

export const updateBlogPost = async (id: string, input: Partial<BlogInput>) => {
  const response = await api.put<{ data: BlogPost }>(`/admin/blog/${id}`, input);
  return response.data.data;
};

export const deleteBlogPost = async (id: string) => {
  const response = await api.delete(`/admin/blog/${id}`);
  return response.data;
};

export const uploadBlogImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post<{ data: { id: string; src: string } }>("/admin/blog/cover", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return response.data.data;
};

// Pull a readable message out of an API/validation error.
export const blogErrorMessage = (error: any, fallback = "Something went wrong") =>
  error?.response?.data?.message ||
  error?.response?.data?.error?.issues?.[0]?.message ||
  error?.message ||
  fallback;
