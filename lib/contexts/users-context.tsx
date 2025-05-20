"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  PaginatedUsersResponse,
  UserParams,
  fetchUsers,
  deleteUser,
  User,
  CreateUserData,
  UpdateUserData,
  createUser,
  updateUser,
} from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface UsersContextProps {
  usersData: PaginatedUsersResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  limit: number;
  searchTerm: string;
  userTypeFilter: string;
  verificationFilter: string;
  setCurrentPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearchTerm: (search: string) => void;
  setUserTypeFilter: (userType: string) => void;
  setVerificationFilter: (verificationStatus: string) => void;
  refetchUsers: () => Promise<void>;
  handleDeleteUser: (userId: string) => Promise<void>;
  handleCreateUser: (userData: CreateUserData) => Promise<void>;
  handleUpdateUser: (userId: string, userData: UpdateUserData) => Promise<void>;
}

const UsersContext = createContext<UsersContextProps | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("");

  // Prepare query params
  const queryParams: UserParams = {
    page: currentPage,
    limit,
    ...(searchTerm && { search: searchTerm }),
    ...(userTypeFilter !== "all" && { user_type: userTypeFilter }),
    ...(verificationFilter !== "all" && { verified: verificationFilter == "true" }),
  };

  // Fetch users data
  const {
    data: usersData,
    isLoading,
    isError,
    error,
    refetch,
  }: UseQueryResult<PaginatedUsersResponse, Error> = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => fetchUsers(queryParams),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  // Refetch users
  const refetchUsers = async (): Promise<void> => {
    try {
      await refetch();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh user data",
        variant: "destructive",
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string): Promise<void> => {
    await deleteUserMutation.mutateAsync(userId);
  };

  // Handle create user
  const handleCreateUser = async (userData: CreateUserData): Promise<void> => {
    await createUserMutation.mutateAsync(userData);
  };

  // Handle update user
  const handleUpdateUser = async (
    userId: string,
    userData: UpdateUserData
  ): Promise<void> => {
    await updateUserMutation.mutateAsync({ id: userId, data: userData });
  };
  return (
    <UsersContext.Provider
      value={{
        usersData,
        isLoading,
        isError,
        error,
        currentPage,
        limit,
        searchTerm,
        userTypeFilter,
        verificationFilter,
        setCurrentPage,
        setLimit,
        setSearchTerm,
        setUserTypeFilter,
        setVerificationFilter,
        refetchUsers,
        handleDeleteUser,
        handleCreateUser,
        handleUpdateUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
