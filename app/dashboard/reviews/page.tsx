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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Filter,
  Star,
  MessageSquare,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  ShoppingBag,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for reviews
const mockReviews = [
  {
    id: "1",
    rating: 5,
    message:
      "Excellent property! The location is perfect and the amenities are top-notch. The agent was very professional and helpful throughout the process.",
    property_id: "prop1",
    property_title: "Luxury 3-Bedroom Apartment",
    product_id: null,
    product_title: null,
    user_id: "user1",
    user_name: "John Doe",
    user_email: "john.doe@example.com",
    artisan_id: null,
    artisan_name: null,
    created_at: "2023-05-15T10:30:00Z",
    status: "approved",
    type: "property",
  },
  {
    id: "2",
    rating: 4,
    message:
      "Great service! The plumber was punctual and fixed the issue quickly. Highly recommended for any plumbing needs.",
    property_id: null,
    property_title: null,
    product_id: "prod1",
    product_title: "Professional Plumbing Services",
    user_id: "user2",
    user_name: "Jane Smith",
    user_email: "jane.smith@example.com",
    artisan_id: "artisan1",
    artisan_name: "Michael Brown",
    created_at: "2023-06-20T14:45:00Z",
    status: "approved",
    type: "product",
  },
  {
    id: "3",
    rating: 2,
    message:
      "The property was not as described in the listing. The photos were misleading and the neighborhood is noisy.",
    property_id: "prop2",
    property_title: "2-Bedroom Terrace House",
    product_id: null,
    product_title: null,
    user_id: "user3",
    user_name: "David Wilson",
    user_email: "david.wilson@example.com",
    artisan_id: null,
    artisan_name: null,
    created_at: "2023-07-10T09:15:00Z",
    status: "flagged",
    type: "property",
  },
  {
    id: "4",
    rating: 5,
    message:
      "The interior design consultation was amazing! The designer understood my vision perfectly and provided excellent suggestions.",
    property_id: null,
    property_title: null,
    product_id: "prod2",
    product_title: "Interior Design Consultation",
    user_id: "user4",
    user_name: "Sarah Johnson",
    user_email: "sarah.johnson@example.com",
    artisan_id: "artisan2",
    artisan_name: "Emily Davis",
    created_at: "2023-08-05T16:20:00Z",
    status: "pending",
    type: "product",
  },
  {
    id: "5",
    rating: 3,
    message:
      "The property is decent but overpriced for what it offers. The location is good but the building needs maintenance.",
    property_id: "prop3",
    property_title: "Studio Apartment",
    product_id: null,
    product_title: null,
    user_id: "user5",
    user_name: "Robert Johnson",
    user_email: "robert.johnson@example.com",
    artisan_id: null,
    artisan_name: null,
    created_at: "2023-09-12T11:40:00Z",
    status: "approved",
    type: "property",
  },
  {
    id: "6",
    message: "This review contains inappropriate content and has been removed by the administrator.",
    rating: 1,
    property_id: null,
    property_title: null,
    product_id: "prod3",
    product_title: "Smart Home Security System",
    user_id: "user6",
    user_name: "Thomas Anderson",
    user_email: "thomas.anderson@example.com",
    artisan_id: "artisan3",
    artisan_name: "William Taylor",
    created_at: "2023-10-18T13:25:00Z",
    status: "rejected",
    type: "product",
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(mockReviews)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleApproveReview = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: "approved",
            }
          : review,
      ),
    )
    toast({
      title: "Review Approved",
      description: "The review has been approved successfully",
    })
  }

  const handleRejectReview = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: "rejected",
            }
          : review,
      ),
    )
    toast({
      title: "Review Rejected",
      description: "The review has been rejected successfully",
      variant: "destructive",
    })
  }

  const handleFlagReview = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: "flagged",
            }
          : review,
      ),
    )
    toast({
      title: "Review Flagged",
      description: "The review has been flagged for further review",
      variant: "default",
    })
  }

  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter((review) => review.id !== reviewId))
    toast({
      title: "Review Deleted",
      description: "The review has been deleted successfully",
      variant: "destructive",
    })
  }

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.property_title && review.property_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (review.product_title && review.product_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.artisan_name && review.artisan_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === "all" || review.type === typeFilter
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter

    return matchesSearch && matchesType && matchesStatus && matchesRating
  })

  const pendingReviews = filteredReviews.filter((review) => review.status === "pending")
  const approvedReviews = filteredReviews.filter((review) => review.status === "approved")
  const flaggedReviews = filteredReviews.filter((review) => review.status === "flagged")
  const rejectedReviews = filteredReviews.filter((review) => review.status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Manage and moderate user reviews</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">All reviews</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all reviews</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{reviews.filter((r) => r.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting moderation</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{reviews.filter((r) => r.status === "flagged").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Review Management</CardTitle>
          <CardDescription>View and moderate user reviews</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[150px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="product">Product/Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[150px]">
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2">
                    {filteredReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-2">
                    {pendingReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved
                  <Badge variant="secondary" className="ml-2">
                    {approvedReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="flagged">
                  Flagged
                  <Badge variant="secondary" className="ml-2">
                    {flaggedReviews.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected
                  <Badge variant="secondary" className="ml-2">
                    {rejectedReviews.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {["all", "pending", "approved", "flagged", "rejected"].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Review</TableHead>
                          <TableHead>For</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(status === "all"
                          ? filteredReviews
                          : status === "pending"
                            ? pendingReviews
                            : status === "approved"
                              ? approvedReviews
                              : status === "flagged"
                                ? flaggedReviews
                                : rejectedReviews
                        ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              No {status === "all" ? "" : status} reviews found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (status === "all"
                            ? filteredReviews
                            : status === "pending"
                              ? pendingReviews
                              : status === "approved"
                                ? approvedReviews
                                : status === "flagged"
                                  ? flaggedReviews
                                  : rejectedReviews
                          ).map((review) => (
                            <TableRow key={review.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={review.user_name} />
                                    <AvatarFallback>
                                      {review.user_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{review.user_name}</div>
                                    <div className="text-xs text-muted-foreground">{review.user_email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <p className="truncate text-sm">{review.message}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {review.type === "property" ? (
                                    <>
                                      <Home className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{review.property_title}</span>
                                    </>
                                  ) : review.artisan_id ? (
                                    <>
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{review.artisan_name}</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{review.product_title}</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(review.created_at)}</div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    review.status === "approved"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : review.status === "rejected"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : review.status === "flagged"
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  }
                                >
                                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                                </Badge>
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
                                        setSelectedReview(review)
                                        setIsViewDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {review.status !== "approved" && (
                                      <DropdownMenuItem onClick={() => handleApproveReview(review.id)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                    )}
                                    {review.status !== "rejected" && (
                                      <DropdownMenuItem onClick={() => handleRejectReview(review.id)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                    )}
                                    {review.status !== "flagged" && (
                                      <DropdownMenuItem onClick={() => handleFlagReview(review.id)}>
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        Flag
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteReview(review.id)}
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

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Review Details</DialogTitle>
                <DialogDescription>
                  Review by {selectedReview.user_name} on {formatDate(selectedReview.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={selectedReview.user_name} />
                    <AvatarFallback className="text-lg">
                      {selectedReview.user_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedReview.user_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedReview.user_email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < selectedReview.rating ? "fill-amber-500 text-amber-500" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          selectedReview.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : selectedReview.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : selectedReview.status === "flagged"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        }
                      >
                        {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Review For</h3>
                  <div className="mt-2 flex items-center gap-3 rounded-md border p-3">
                    {selectedReview.type === "property" ? (
                      <>
                        <Home className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{selectedReview.property_title}</p>
                          <p className="text-sm text-muted-foreground">Property</p>
                        </div>
                      </>
                    ) : selectedReview.artisan_id ? (
                      <>
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{selectedReview.artisan_name}</p>
                          <p className="text-sm text-muted-foreground">Artisan</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{selectedReview.product_title}</p>
                          <p className="text-sm text-muted-foreground">Product/Service</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Review Content</h3>
                  <div className="mt-2 rounded-md border p-4">
                    <p className="text-sm">{selectedReview.message}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {selectedReview.status !== "approved" && (
                  <Button
                    variant="default"
                    onClick={() => {
                      handleApproveReview(selectedReview.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                )}
                {selectedReview.status !== "rejected" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectReview(selectedReview.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                )}
                {selectedReview.status !== "flagged" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleFlagReview(selectedReview.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Flag
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteReview(selectedReview.id)
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
