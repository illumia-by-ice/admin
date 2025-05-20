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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Filter,
  Trash2,
  Eye,
  Bell,
  Send,
  CheckCircle,
  Plus,
  Users,
  Home,
  ShoppingBag,
  User,
  Clock,
  File,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    title: "New Property Listed",
    message: "A new property has been listed: Luxury 3-Bedroom Apartment",
    type: "property",
    property_id: "prop1",
    property_title: "Luxury 3-Bedroom Apartment",
    user_id: "user1",
    user_name: "Jane Smith",
    status: "sent",
    recipients: "all",
    created_at: "2023-05-10T10:00:00Z",
    sent_at: "2023-05-10T10:01:00Z",
    read_count: 156,
    total_recipients: 2853,
  },
  {
    id: "2",
    title: "New Product Added",
    message: "A new product has been added: Modern Sofa Set",
    type: "product",
    product_id: "prod1",
    product_title: "Modern Sofa Set",
    user_id: "user2",
    user_name: "John Doe",
    status: "sent",
    recipients: "all",
    created_at: "2023-06-15T14:30:00Z",
    sent_at: "2023-06-15T14:31:00Z",
    read_count: 98,
    total_recipients: 2853,
  },
  {
    id: "3",
    title: "Verification Approved",
    message: "Your verification request has been approved. You can now access all features.",
    type: "verification",
    user_id: "user3",
    user_name: "Michael Brown",
    status: "sent",
    recipients: "single",
    created_at: "2023-07-20T09:15:00Z",
    sent_at: "2023-07-20T09:16:00Z",
    read_count: 1,
    total_recipients: 1,
  },
  {
    id: "4",
    title: "Special Offer",
    message: "Limited time offer: 20% discount on all premium listings!",
    type: "promotion",
    user_id: "admin",
    user_name: "Admin User",
    status: "scheduled",
    recipients: "agents",
    created_at: "2023-08-05T16:45:00Z",
    scheduled_for: "2023-08-10T09:00:00Z",
    read_count: 0,
    total_recipients: 450,
  },
  {
    id: "5",
    title: "System Maintenance",
    message: "The system will be down for maintenance on Sunday, September 15, from 2 AM to 5 AM.",
    type: "system",
    user_id: "admin",
    user_name: "Admin User",
    status: "draft",
    recipients: "all",
    created_at: "2023-09-12T11:20:00Z",
    read_count: 0,
    total_recipients: 2853,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "system",
    recipients: "all",
    status: "draft",
  })
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleCreateNotification = () => {
    // Validate form
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const createdNotification = {
      id: `${notifications.length + 1}`,
      ...newNotification,
      user_id: "admin",
      user_name: "Admin User",
      created_at: new Date().toISOString(),
      read_count: 0,
      total_recipients:
        newNotification.recipients === "all"
          ? 2853
          : newNotification.recipients === "agents"
            ? 450
            : newNotification.recipients === "buyers"
              ? 1200
              : 1,
    }

    setNotifications([createdNotification, ...notifications])
    setIsCreateDialogOpen(false)
    setNewNotification({
      title: "",
      message: "",
      type: "system",
      recipients: "all",
      status: "draft",
    })

    toast({
      title: "Notification Created",
      description: "The notification has been created successfully",
    })
  }

  const handleSendNotification = (notificationId: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              status: "sent",
              sent_at: new Date().toISOString(),
            }
          : notification,
      ),
    )
    toast({
      title: "Notification Sent",
      description: "The notification has been sent successfully",
    })
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== notificationId))
    toast({
      title: "Notification Deleted",
      description: "The notification has been deleted successfully",
      variant: "destructive",
    })
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || notification.type === typeFilter
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Home className="h-4 w-4" />
      case "product":
        return <ShoppingBag className="h-4 w-4" />
      case "verification":
        return <CheckCircle className="h-4 w-4" />
      case "promotion":
        return <Bell className="h-4 w-4" />
      case "system":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getRecipientIcon = (recipients: string) => {
    switch (recipients) {
      case "all":
        return <Users className="h-4 w-4" />
      case "agents":
        return <User className="h-4 w-4" />
      case "buyers":
        return <User className="h-4 w-4" />
      case "single":
        return <User className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage and send notifications to users</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Notification
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "sent").length}</div>
            <p className="text-xs text-muted-foreground">Sent notifications</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "scheduled").length}</div>
            <p className="text-xs text-muted-foreground">Scheduled notifications</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{notifications.filter((n) => n.status === "draft").length}</div>
            <p className="text-xs text-muted-foreground">Draft notifications</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Notification Management</CardTitle>
          <CardDescription>View and manage all notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2">
                    {filteredNotifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="sent">
                  Sent
                  <Badge variant="secondary" className="ml-2">
                    {filteredNotifications.filter((n) => n.status === "sent").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="scheduled">
                  Scheduled
                  <Badge variant="secondary" className="ml-2">
                    {filteredNotifications.filter((n) => n.status === "scheduled").length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="draft">
                  Draft
                  <Badge variant="secondary" className="ml-2">
                    {filteredNotifications.filter((n) => n.status === "draft").length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {["all", "sent", "scheduled", "draft"].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Notification</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Recipients</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Engagement</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(status === "all"
                          ? filteredNotifications
                          : filteredNotifications.filter((n) => n.status === status)
                        ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No {status === "all" ? "" : status} notifications found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (status === "all"
                            ? filteredNotifications
                            : filteredNotifications.filter((n) => n.status === status)
                          ).map((notification) => (
                            <TableRow key={notification.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={`/placeholder.svg?height=40&width=40`}
                                      alt={notification.user_name}
                                    />
                                    <AvatarFallback>
                                      {notification.user_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{notification.title}</div>
                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                      {notification.message}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(notification.type)}
                                  <span className="capitalize">{notification.type}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {getRecipientIcon(notification.recipients)}
                                  <span className="capitalize">{notification.recipients}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    notification.status === "sent"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : notification.status === "scheduled"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  }
                                >
                                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(notification.created_at)}</div>
                                {notification.sent_at && (
                                  <div className="text-xs text-muted-foreground">
                                    Sent: {formatTime(notification.sent_at)}
                                  </div>
                                )}
                                {notification.scheduled_for && (
                                  <div className="text-xs text-muted-foreground">
                                    Scheduled: {formatDate(notification.scheduled_for)}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {notification.status === "sent" ? (
                                  <div className="text-sm">
                                    {notification.read_count} / {notification.total_recipients}
                                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                      <div
                                        className="h-1.5 rounded-full bg-green-500"
                                        style={{
                                          width: `${(notification.read_count / notification.total_recipients) * 100}%`,
                                        }}
                                      ></div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {Math.round((notification.read_count / notification.total_recipients) * 100)}%
                                      read rate
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">Not sent yet</div>
                                )}
                              </TableCell>
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
                                        setSelectedNotification(notification)
                                        setIsViewDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View details
                                    </DropdownMenuItem>
                                    {notification.status !== "sent" && (
                                      <DropdownMenuItem onClick={() => handleSendNotification(notification.id)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send now
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteNotification(notification.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
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
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>Create a new notification to send to users</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter notification title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Enter notification message"
                rows={4}
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">
                  Type
                </label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="verification">Verification</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="recipients" className="text-sm font-medium">
                  Recipients
                </label>
                <Select
                  value={newNotification.recipients}
                  onValueChange={(value) => setNewNotification({ ...newNotification, recipients: value })}
                >
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Select recipients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="agents">Agents Only</SelectItem>
                    <SelectItem value="buyers">Buyers Only</SelectItem>
                    <SelectItem value="single">Single User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={newNotification.status}
                onValueChange={(value) => setNewNotification({ ...newNotification, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="scheduled">Schedule for Later</SelectItem>
                  <SelectItem value="sent">Send Immediately</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newNotification.status === "scheduled" && (
              <div className="grid gap-2">
                <label htmlFor="scheduled-date" className="text-sm font-medium">
                  Schedule Date
                </label>
                <Input id="scheduled-date" type="datetime-local" />
              </div>
            )}
            {newNotification.recipients === "single" && (
              <div className="grid gap-2">
                <label htmlFor="user-search" className="text-sm font-medium">
                  Search User
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="user-search" placeholder="Search by name or email" className="pl-8" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNotification}>
              {newNotification.status === "sent"
                ? "Send Notification"
                : newNotification.status === "scheduled"
                  ? "Schedule Notification"
                  : "Save as Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Notification Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotification.title}</DialogTitle>
                <DialogDescription>
                  Created on {formatDate(selectedNotification.created_at)} by {selectedNotification.user_name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={selectedNotification.user_name} />
                    <AvatarFallback className="text-lg">
                      {selectedNotification.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedNotification.user_name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          selectedNotification.status === "sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : selectedNotification.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {selectedNotification.status.charAt(0).toUpperCase() + selectedNotification.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedNotification.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Message</h3>
                  <div className="mt-2 rounded-md border p-4">
                    <p className="text-sm">{selectedNotification.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Recipients</h3>
                    <p className="capitalize">{selectedNotification.recipients}</p>
                    <p className="text-sm text-muted-foreground">Total: {selectedNotification.total_recipients}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Timing</h3>
                    <p>Created: {formatDate(selectedNotification.created_at)}</p>
                    {selectedNotification.sent_at && (
                      <p className="text-sm text-muted-foreground">
                        Sent: {formatDate(selectedNotification.sent_at)} at {formatTime(selectedNotification.sent_at)}
                      </p>
                    )}
                    {selectedNotification.scheduled_for && (
                      <p className="text-sm text-muted-foreground">
                        Scheduled: {formatDate(selectedNotification.scheduled_for)} at{" "}
                        {formatTime(selectedNotification.scheduled_for)}
                      </p>
                    )}
                  </div>
                </div>

                {selectedNotification.status === "sent" && (
                  <div>
                    <h3 className="text-lg font-medium">Engagement</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Read rate</span>
                        <span className="text-sm font-medium">
                          {Math.round((selectedNotification.read_count / selectedNotification.total_recipients) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{
                            width: `${(selectedNotification.read_count / selectedNotification.total_recipients) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{selectedNotification.read_count} opened</span>
                        <span>
                          {selectedNotification.total_recipients - selectedNotification.read_count} not opened
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {selectedNotification.status !== "sent" && (
                  <Button
                    onClick={() => {
                      handleSendNotification(selectedNotification.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteNotification(selectedNotification.id)
                    setIsViewDialogOpen(false)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
