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
import { MoreHorizontal, Search, UserPlus, Filter, CheckCircle, XCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock data for users
const mockUsers = [
  {
    id: "1",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe",
    phone: "+2348012345678",
    verified: true,
    user_type: "buyer",
    created_at: "2023-05-10T10:00:00Z",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    first_name: "Jane",
    last_name: "Smith",
    phone: "+2348023456789",
    verified: true,
    user_type: "agent",
    created_at: "2023-06-15T14:30:00Z",
  },
  {
    id: "3",
    email: "michael.brown@example.com",
    first_name: "Michael",
    last_name: "Brown",
    phone: "+2348034567890",
    verified: false,
    user_type: "vendor",
    created_at: "2023-07-20T09:15:00Z",
  },
  {
    id: "4",
    email: "sarah.johnson@example.com",
    first_name: "Sarah",
    last_name: "Johnson",
    phone: "+2348045678901",
    verified: true,
    user_type: "artisan",
    created_at: "2023-08-05T16:45:00Z",
  },
  {
    id: "5",
    email: "david.wilson@example.com",
    first_name: "David",
    last_name: "Wilson",
    phone: "+2348056789012",
    verified: false,
    user_type: "buyer",
    created_at: "2023-09-12T11:20:00Z",
  },
  {
    id: "6",
    email: "admin@example.com",
    first_name: "Admin",
    last_name: "User",
    phone: "+2348067890123",
    verified: true,
    user_type: "admin",
    created_at: "2023-04-01T08:00:00Z",
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [verificationFilter, setVerificationFilter] = useState("all")
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleVerifyUser = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, verified: true } : user)))
    toast({
      title: "User Verified",
      description: "User has been successfully verified",
    })
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
    toast({
      title: "User Deleted",
      description: "User has been successfully deleted",
      variant: "destructive",
    })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)

    const matchesUserType = userTypeFilter === "all" || user.user_type === userTypeFilter

    const matchesVerification =
      verificationFilter === "all" ||
      (verificationFilter === "verified" && user.verified) ||
      (verificationFilter === "unverified" && !user.verified)

    return matchesSearch && matchesUserType && matchesVerification
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage and monitor user accounts</p>
        </div>
        <Button className="sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
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
                              <span>Unverified</span>
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
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/users/${user.id}`
                                }}
                              >
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/users/${user.id}/edit`
                                }}
                              >
                                Edit user
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!user.verified && (
                                <DropdownMenuItem onClick={() => handleVerifyUser(user.id)}>
                                  Verify user
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
