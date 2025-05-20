"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  BarChart3,
  ImageIcon,
  LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  PauseCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock data for ads
const mockAds = [
  {
    id: "1",
    title: "Premium Property Listing",
    description: "Get your property featured at the top of search results",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "https://example.com/premium-listing",
    status: "active",
    placement: "homepage",
    start_date: "2023-04-15T00:00:00Z",
    end_date: "2023-07-15T00:00:00Z",
    impressions: 12450,
    clicks: 348,
    ctr: 2.8,
    cost: 45000,
    currency: "NGN",
  },
  {
    id: "2",
    title: "Artisan Services Promotion",
    description: "Promote your artisan services to thousands of potential customers",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "https://example.com/artisan-promo",
    status: "active",
    placement: "search_results",
    start_date: "2023-05-01T00:00:00Z",
    end_date: "2023-08-01T00:00:00Z",
    impressions: 8320,
    clicks: 215,
    ctr: 2.6,
    cost: 30000,
    currency: "NGN",
  },
  {
    id: "3",
    title: "Property Agent Spotlight",
    description: "Highlight your profile as a trusted property agent",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "https://example.com/agent-spotlight",
    status: "paused",
    placement: "property_details",
    start_date: "2023-03-10T00:00:00Z",
    end_date: "2023-09-10T00:00:00Z",
    impressions: 5640,
    clicks: 187,
    ctr: 3.3,
    cost: 35000,
    currency: "NGN",
  },
  {
    id: "4",
    title: "New Property Listings Alert",
    description: "Be the first to know about new properties in your area",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "https://example.com/new-listings",
    status: "scheduled",
    placement: "email",
    start_date: "2023-06-01T00:00:00Z",
    end_date: "2023-09-01T00:00:00Z",
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cost: 25000,
    currency: "NGN",
  },
  {
    id: "5",
    title: "Vendor Special Offer",
    description: "Limited time offer for property vendors",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "https://example.com/vendor-offer",
    status: "ended",
    placement: "sidebar",
    start_date: "2023-02-15T00:00:00Z",
    end_date: "2023-05-15T00:00:00Z",
    impressions: 9870,
    clicks: 412,
    ctr: 4.2,
    cost: 40000,
    currency: "NGN",
  },
]

export default function AdsPage() {
  const [ads, setAds] = useState(mockAds)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [placementFilter, setPlacementFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    image_url: "/placeholder.svg?height=300&width=600",
    target_url: "",
    placement: "homepage",
    start_date: "",
    end_date: "",
    cost: "",
    currency: "NGN",
  })
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return currency === "NGN" ? `₦${amount.toLocaleString()}` : `$${amount.toLocaleString()}`
  }

  const handleCreateAd = () => {
    // Validate form
    if (
      !newAd.title ||
      !newAd.description ||
      !newAd.target_url ||
      !newAd.start_date ||
      !newAd.end_date ||
      !newAd.cost
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const createdAd = {
      id: `${ads.length + 1}`,
      ...newAd,
      status: "scheduled",
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cost: Number.parseFloat(newAd.cost),
    }

    setAds([createdAd, ...ads])
    setIsCreateDialogOpen(false)
    setNewAd({
      title: "",
      description: "",
      image_url: "/placeholder.svg?height=300&width=600",
      target_url: "",
      placement: "homepage",
      start_date: "",
      end_date: "",
      cost: "",
      currency: "NGN",
    })

    toast({
      title: "Ad Created",
      description: "Your ad has been created successfully",
    })
  }

  const handleDeleteAd = (adId: string) => {
    setAds(ads.filter((ad) => ad.id !== adId))
    toast({
      title: "Ad Deleted",
      description: "The ad has been deleted successfully",
      variant: "destructive",
    })
  }

  const handleToggleAdStatus = (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active"

    setAds(ads.map((ad) => (ad.id === adId ? { ...ad, status: newStatus } : ad)))

    toast({
      title: `Ad ${newStatus === "active" ? "Activated" : "Paused"}`,
      description: `The ad has been ${newStatus === "active" ? "activated" : "paused"} successfully`,
    })
  }

  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter
    const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter

    return matchesSearch && matchesStatus && matchesPlacement
  })

  const activeAds = filteredAds.filter((ad) => ad.status === "active")
  const scheduledAds = filteredAds.filter((ad) => ad.status === "scheduled")
  const pausedAds = filteredAds.filter((ad) => ad.status === "paused")
  const endedAds = filteredAds.filter((ad) => ad.status === "ended")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ads Management</h1>
          <p className="text-muted-foreground">Create and manage advertising campaigns</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Ad
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAds.length}</div>
            <p className="text-xs text-muted-foreground">Currently running ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Ads</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledAds.length}</div>
            <p className="text-xs text-muted-foreground">Ads waiting to start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Ads</CardTitle>
            <PauseCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pausedAds.length}</div>
            <p className="text-xs text-muted-foreground">Temporarily paused ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ended Ads</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endedAds.length}</div>
            <p className="text-xs text-muted-foreground">Completed ad campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Campaigns</CardTitle>
          <CardDescription>View and manage all your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ads..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={placementFilter} onValueChange={setPlacementFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by placement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Placements</SelectItem>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="search_results">Search Results</SelectItem>
                      <SelectItem value="property_details">Property Details</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Campaign</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAds.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No ads found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAds.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 overflow-hidden rounded bg-muted">
                              <img
                                src={ad.image_url || "/placeholder.svg"}
                                alt={ad.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium">{ad.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{ad.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {ad.placement.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(ad.start_date)} - {formatDate(ad.end_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ad.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : ad.status === "paused"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                  : ad.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }
                          >
                            {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {ad.status === "scheduled" ? (
                            <span className="text-muted-foreground">Not started</span>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>Impressions: {ad.impressions.toLocaleString()}</span>
                                <span>Clicks: {ad.clicks.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <span>CTR: {ad.ctr}%</span>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>{formatCurrency(ad.cost, ad.currency)}</span>
                          </div>
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
                                  window.location.href = `/dashboard/ads/${ad.id}`
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/ads/${ad.id}/edit`
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit ad
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {(ad.status === "active" || ad.status === "paused") && (
                                <DropdownMenuItem onClick={() => handleToggleAdStatus(ad.id, ad.status)}>
                                  {ad.status === "active" ? (
                                    <>
                                      <PauseCircle className="mr-2 h-4 w-4" />
                                      Pause ad
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate ad
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteAd(ad.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ad
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ad</DialogTitle>
            <DialogDescription>Fill in the details to create a new advertising campaign</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Ad Title</Label>
              <Input
                id="title"
                placeholder="Enter ad title"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter ad description"
                value={newAd.description}
                onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_url">Target URL</Label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="target_url"
                  placeholder="https://example.com/landing-page"
                  value={newAd.target_url}
                  onChange={(e) => setNewAd({ ...newAd, target_url: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Ad Image</Label>
              <div className="flex items-center gap-2">
                <div className="h-20 w-32 overflow-hidden rounded border bg-muted">
                  <img
                    src={newAd.image_url || "/placeholder.svg"}
                    alt="Ad preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button variant="outline" className="h-10">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Recommended size: 1200x600px. Max file size: 2MB</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="placement">Placement</Label>
                <Select value={newAd.placement} onValueChange={(value) => setNewAd({ ...newAd, placement: value })}>
                  <SelectTrigger id="placement">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">Homepage</SelectItem>
                    <SelectItem value="search_results">Search Results</SelectItem>
                    <SelectItem value="property_details">Property Details</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={newAd.currency} onValueChange={(value) => setNewAd({ ...newAd, currency: value })}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newAd.start_date}
                  onChange={(e) => setNewAd({ ...newAd, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newAd.end_date}
                  onChange={(e) => setNewAd({ ...newAd, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Budget</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="cost"
                  type="number"
                  placeholder="Enter campaign budget"
                  value={newAd.cost}
                  onChange={(e) => setNewAd({ ...newAd, cost: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAd}>Create Ad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
