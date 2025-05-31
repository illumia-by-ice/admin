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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAds, updateAd, deleteAd, addAdImage, deleteAdImage, Ad, createAd } from "@/lib/api/dashboard"
import { useForm } from "react-hook-form"

export default function AdsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [placementFilter, setPlacementFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [imageUploadAdId, setImageUploadAdId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  // React Hook Form for ad creation
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const {
    data: adsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ads", { searchTerm, statusFilter, placementFilter }],
    queryFn: () =>
      getAds({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
        placement: placementFilter === "all" ? undefined : placementFilter,
      }),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })

  const createAdMutation = useMutation({
    mutationFn: async (data: any) => {
      // expects FormData with title, description, cta, cta_link
      return await createAd(data) // replace with correct POST endpoint if needed
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      toast({ title: "Ad Created", description: "Your ad has been created successfully" })
      setIsCreateDialogOpen(false)
      reset()
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create ad", variant: "destructive" })
    },
  })

  const deleteAdMutation = useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      toast({ title: "Ad Deleted", description: "The ad has been deleted successfully", variant: "destructive" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete ad", variant: "destructive" })
    },
  })

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      toast({ title: "Ad Updated", description: "The ad has been updated successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update ad", variant: "destructive" })
    },
  })

  const addAdImageMutation = useMutation({
    mutationFn: ({ adId, file }: { adId: string; file: File }) => addAdImage(adId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      toast({ title: "Image Uploaded", description: "Ad image uploaded successfully" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" })
    },
  })

  const deleteAdImageMutation = useMutation({
    mutationFn: ({ adId, imageId }: { adId: string; imageId: string }) => deleteAdImage(adId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] })
      toast({ title: "Image Deleted", description: "Ad image deleted successfully", variant: "destructive" })
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to delete image", variant: "destructive" })
    },
  })

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

  // Remove all local state for ads and ad creation
  // Use only adsData for rendering and filtering
  const filteredAds = adsData?.data?.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter
    const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter
    return matchesSearch && matchesStatus && matchesPlacement
  }) || []

  // Ad creation handler
  const onCreateAd = (formData: any) => {
    const data = new FormData()
    data.append("title", formData.title)
    data.append("description", formData.description)
    data.append("cta", formData.cta)
    data.append("cta_link", formData.cta_link)
    if (formData.image && formData.image[0]) {
      data.append("images", formData.image[0])
    }
    createAdMutation.mutate(data)
  }

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

      {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAds.filter(ad => ad.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently running ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Ads</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAds.filter(ad => ad.status === 'scheduled').length}</div>
            <p className="text-xs text-muted-foreground">Ads waiting to start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paused Ads</CardTitle>
            <PauseCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAds.filter(ad => ad.status === 'paused').length}</div>
            <p className="text-xs text-muted-foreground">Temporarily paused ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ended Ads</CardTitle>
            <XCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredAds.filter(ad => ad.status === 'ended').length}</div>
            <p className="text-xs text-muted-foreground">Completed ad campaigns</p>
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>Ad Campaigns</CardTitle>
          <CardDescription>View and manage all your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading ads...</div>
          ) : isError ? (
            <div>Error loading ads: {error?.message}</div>
          ) : (
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
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      {/* <TableHead>Placement</TableHead> */}
                      {/* <TableHead>Status</TableHead> */}
                      <TableHead>Images</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAds.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No ads found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredAds.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>{ad.title}</TableCell>
                          <TableCell>
                            {ad.images?.map((img) => (
                              <div key={img.id} className="inline-block mr-2 relative">
                                <img src={img.src} alt={img.name} className="h-10 w-16 object-cover rounded" />
                                <Button size="icon" variant="ghost" onClick={() => deleteAdImageMutation.mutate({ adId: ad.id, imageId: img.id })}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            ))}
                            {/* <Input type="file" onChange={e => {
                              if (e.target.files && e.target.files[0]) {
                                addAdImageMutation.mutate({ adId: ad.id, file: e.target.files[0] })
                              }
                            }} /> */}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" className="mx-3" onClick={() => updateAdMutation.mutate({ id: ad.id, data: { title: ad.title, description: ad.description, cta: ad.cta, cta_link: ad.cta_link } })}>Edit</Button>
                            <Button variant="destructive" onClick={() => deleteAdMutation.mutate(ad.id)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ad</DialogTitle>
            <DialogDescription>Fill in the details to create a new advertising campaign</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateAd)} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Ad Title</Label>
              <Input id="title" placeholder="Enter ad title" {...register("title", { required: true })} />
              {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Enter ad description" {...register("description", { required: true })} />
              {errors.description && <span className="text-red-500 text-xs">Description is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cta">CTA</Label>
              <Input id="cta" placeholder="Enter call to action" {...register("cta", { required: true })} />
              {errors.cta && <span className="text-red-500 text-xs">CTA is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cta_link">CTA Link</Label>
              <Input id="cta_link" placeholder="https://example.com" {...register("cta_link", { required: true })} />
              {errors.cta_link && <span className="text-red-500 text-xs">CTA Link is required</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Ad Image</Label>
              <Input id="image" type="file" accept="image/*" {...register("image", { required: true })} />
              {errors.image && <span className="text-red-500 text-xs">Image is required</span>}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAdMutation.status === 'pending' || createAdMutation.isPending}>Create Ad</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
