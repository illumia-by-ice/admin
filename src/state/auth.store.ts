import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: "",
      updateToken: (newToken: string) => set(() => ({ token: newToken })),
    }),
    { name: "auth-storage" }
  )
);
