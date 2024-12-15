import { UserData } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the Zustand store
interface UserStore {
  user: UserData | null; // Store the user data
  setUser: (user: UserData) => void; // Function to set user data
  clearUser: () => void; // Function to clear user data
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null, // Initial state
      setUser: (user) => set(() => ({ user })), // Set the user data
      clearUser: () => set(() => ({ user: null })), // Clear the user data
    }),
    {
      name: "user-storage", // Key for localStorage
    }
  )
);
