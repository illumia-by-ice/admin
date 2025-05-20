"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MoreHorizontal, 
  Search, 
  UserPlus, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle 
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { UserFormModal } from "@/components/users/user-form-modal"
import { ConfirmDeleteDialog } from "@/components/users/confirm-delete-dialog"
import { useUsers } from "@/lib/contexts/users-context"
import { CreateUserData, UpdateUserData, User } from "@/lib/api/users"

export default function UsersPage() {
  // State for modal controls
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    // Get users data and functions from context
  const {
    usersData,
    isLoading,
    isError,
    error,
    searchTerm,
    userTypeFilter,
    verificationFilter,
    setSearchTerm,
    setUserTypeFilter,
    setVerificationFilter,
    currentPage,
    setCurrentPage,
    refetchUsers,
    handleDeleteUser,
    handleCreateUser,
    handleUpdateUser
  } = useUsers();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  // Placeholder handlers for add/edit user (to be connected to real API later)
  const handleAddUser = async (userData: CreateUserData): Promise<void> => {
    // This would be connected to an API call in the future
    console.log("Creating user:", userData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    await refetchUsers();
  };

  const handleEditUser = async (userData: UpdateUserData): Promise<void> => {
    if (selectedUser) {
      await handleUpdateUser(selectedUser.id, userData);
    }
  };

  const handleDelete = (userId: string) => {
    setDeletingUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingUserId) {
      await handleDeleteUser(deletingUserId);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  // Generate pagination links
  const generatePagination = () => {
    if (!usersData?.meta) return null;
    
    const { page, totalPages } = usersData.meta;
    const pages = [];
    
    // Always show first page
    if (page > 3) {
      pages.push(1);
      if (page > 4) pages.push('...');
    }
    
    // Show pages around current page
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) {
      pages.push(i);
    }
    
    // Always show last page
    if (page < totalPages - 2) {
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Show error state if there's an error
  if (isError && error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage and monitor user accounts</p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => refetchUsers()}
          >
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage and monitor user accounts</p>
        </div>
        {/* <Button className="sm:w-auto" onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-[180px]">
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="artisan">Artisan</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Verification status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="false">Unverified</SelectItem>
                      <SelectItem value="true">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon" onClick={() => refetchUsers()}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : usersData?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    usersData?.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40`}
                                alt={`${user.first_name} ${user.last_name}`}
                              />
                              <AvatarFallback>
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.user_type === "admin"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : user.user_type === "agent"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : user.user_type === "vendor"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                    : user.user_type === "artisan"
                                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                      : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            }
                          >
                            {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.verified ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-amber-600">
                              <XCircle className="h-4 w-4" />
                              <span>{"Unverified"}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {/* <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/users/${user.id}`
                                }}
                              >
                                View details
                              </DropdownMenuItem> */}
                              <DropdownMenuItem
                                onClick={() => openEditModal(user)}
                              >
                                Edit user
                              </DropdownMenuItem>
                              {/* <DropdownMenuSeparator />
                              {!user.verified && (
                                <DropdownMenuItem onClick={() => openEditModal(user)}>
                                  Update verification
                                </DropdownMenuItem>
                              )} */}
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDelete(user.id)}
                              >
                                Delete user
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {usersData?.meta && usersData.meta.totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {generatePagination()?.map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <span className="px-4 py-2">...</span>
                        ) : (
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page as number);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < usersData.meta.totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === usersData.meta.totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {/* <UserFormModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSubmit={handleAddUser}
      /> */}

      {/* Edit User Modal */}
      {selectedUser && (
        <UserFormModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={handleEditUser}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeletingUserId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user and all associated data."
      />
    </div>
  );
}
