"use client"

import Link from "next/link"

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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Plus,
  Filter,
  HomeIcon,
  MapPin,
  Bed,
  Bath,
  DoorOpen,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Youtube,
  DollarSign,
  Building,
  Tag,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for properties
const mockProperties = [
  {
    id: "1",
    title: "Luxury 3-Bedroom Apartment",
    description: "Beautiful 3-bedroom apartment with modern amenities in a serene environment.",
    price: 250000,
    currency: "NGN",
    amenities: "Swimming Pool, Gym, 24/7 Security, Parking Space",
    lat: 6.4351,
    lon: 3.4501,
    city: "Lekki",
    youtube_link: "https://www.youtube.com/watch?v=example1",
    address: "15 Admiralty Way, Lekki Phase 1",
    listingType: "rent",
    type: "apartment",
    bathrooms: 3,
    beds: 3,
    bedrooms: 3,
    user_id: "101",
    user_name: "Jane Smith",
    created_at: "2023-05-10T10:00:00Z",
    images: [
      { id: "img1", src: "/placeholder.svg?height=600&width=800" },
      { id: "img2", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "2",
    title: "Modern Office Space",
    description: "Spacious office space suitable for startups and small businesses.",
    price: 500000,
    currency: "NGN",
    amenities: "Conference Room, High-Speed Internet, Backup Power, Parking Space",
    lat: 6.4551,
    lon: 3.3751,
    city: "Victoria Island",
    youtube_link: "https://www.youtube.com/watch?v=example2",
    address: "10 Kofo Abayomi Street, Victoria Island",
    listingType: "rent",
    type: "office",
    bathrooms: 2,
    beds: 0,
    bedrooms: 0,
    user_id: "102",
    user_name: "John Doe",
    created_at: "2023-06-15T14:30:00Z",
    images: [{ id: "img3", src: "/placeholder.svg?height=600&width=800" }],
  },
  {
    id: "3",
    title: "5-Bedroom Detached Duplex",
    description: "Exquisite 5-bedroom detached duplex with state-of-the-art facilities.",
    price: 150000000,
    currency: "NGN",
    amenities: "Swimming Pool, Home Theater, Garden, Parking Space for 4 cars",
    lat: 6.4651,
    lon: 3.5651,
    city: "Ikoyi",
    youtube_link: "https://www.youtube.com/watch?v=example3",
    address: "7 Banana Island Road, Ikoyi",
    listingType: "sale",
    type: "house",
    bathrooms: 6,
    beds: 5,
    bedrooms: 5,
    user_id: "103",
    user_name: "Michael Brown",
    created_at: "2023-07-20T09:15:00Z",
    images: [
      { id: "img4", src: "/placeholder.svg?height=600&width=800" },
      { id: "img5", src: "/placeholder.svg?height=600&width=800" },
      { id: "img6", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "4",
    title: "Studio Apartment",
    description: "Cozy studio apartment perfect for singles or couples.",
    price: 80000,
    currency: "NGN",
    amenities: "24/7 Security, Parking Space, Backup Power",
    lat: 6.5151,
    lon: 3.3851,
    city: "Yaba",
    youtube_link: "",
    address: "12 Herbert Macaulay Way, Yaba",
    listingType: "rent",
    type: "apartment",
    bathrooms: 1,
    beds: 1,
    bedrooms: 0,
    user_id: "104",
    user_name: "Sarah Johnson",
    created_at: "2023-08-05T16:45:00Z",
    images: [{ id: "img7", src: "/placeholder.svg?height=600&width=800" }],
  },
  {
    id: "5",
    title: "2-Bedroom Terrace House",
    description: "Beautiful 2-bedroom terrace house in a gated community.",
    price: 45000000,
    currency: "NGN",
    amenities: "Swimming Pool, Gym, Children's Playground, 24/7 Security",
    lat: 6.6051,
    lon: 3.3551,
    city: "Ajah",
    youtube_link: "https://www.youtube.com/watch?v=example5",
    address: "5 Lekki Gardens Estate, Ajah",
    listingType: "sale",
    type: "house",
    bathrooms: 2,
    beds: 2,
    bedrooms: 2,
    user_id: "105",
    user_name: "David Wilson",
    created_at: "2023-09-12T11:20:00Z",
    images: [
      { id: "img8", src: "/placeholder.svg?height=600&width=800" },
      { id: "img9", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState(mockProperties)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [listingTypeFilter, setListingTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    amenities: "",
    city: "",
    address: "",
    listingType: "rent",
    type: "apartment",
    bathrooms: "",
    beds: "",
    bedrooms: "",
    youtube_link: "",
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

  const handleCreateProperty = () => {
    // Validate form
    if (
      !newProperty.title ||
      !newProperty.description ||
      !newProperty.price ||
      !newProperty.city ||
      !newProperty.address
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const createdProperty = {
      id: `${properties.length + 1}`,
      ...newProperty,
      price: Number(newProperty.price),
      bathrooms: Number(newProperty.bathrooms) || 0,
      beds: Number(newProperty.beds) || 0,
      bedrooms: Number(newProperty.bedrooms) || 0,
      lat: 6.5151,
      lon: 3.3851,
      user_id: "101",
      user_name: "Admin User",
      created_at: new Date().toISOString(),
      images: [{ id: "img-new", src: "/placeholder.svg?height=600&width=800" }],
    }

    setProperties([createdProperty, ...properties])
    setIsCreateDialogOpen(false)
    setNewProperty({
      title: "",
      description: "",
      price: "",
      currency: "NGN",
      amenities: "",
      city: "",
      address: "",
      listingType: "rent",
      type: "apartment",
      bathrooms: "",
      beds: "",
      bedrooms: "",
      youtube_link: "",
    })

    toast({
      title: "Property Created",
      description: "The property has been created successfully",
    })
  }

  const handleDeleteProperty = (propertyId: string) => {
    setProperties(properties.filter((property) => property.id !== propertyId))
    toast({
      title: "Property Deleted",
      description: "The property has been deleted successfully",
      variant: "destructive",
    })
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || property.type === typeFilter
    const matchesListingType = listingTypeFilter === "all" || property.listingType === listingTypeFilter
    const matchesCity = cityFilter === "all" || property.city === cityFilter

    return matchesSearch && matchesType && matchesListingType && matchesCity
  })

  const cities = Array.from(new Set(properties.map((property) => property.city)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage and monitor property listings</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground">All listed properties</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">For Rent</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{properties.filter((p) => p.listingType === "rent").length}</div>
            <p className="text-xs text-muted-foreground">Properties for rent</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">For Sale</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{properties.filter((p) => p.listingType === "sale").length}</div>
            <p className="text-xs text-muted-foreground">Properties for sale</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{cities.length}</div>
            <p className="text-xs text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Property Management</CardTitle>
          <CardDescription>View and manage all property listings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={listingTypeFilter} onValueChange={setListingTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Listings</SelectItem>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sale">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
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
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Features</TableHead>
                    <TableHead>Listed By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No properties found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 overflow-hidden rounded bg-muted">
                              <img
                                src={property.images[0]?.src || "/placeholder.svg"}
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium line-clamp-1">{property.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {property.images.length} {property.images.length === 1 ? "image" : "images"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="line-clamp-1">{property.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="capitalize">
                              {property.type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                property.listingType === "rent"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              }
                            >
                              {property.listingType === "rent" ? "For Rent" : "For Sale"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(property.price, property.currency)}</div>
                          <div className="text-xs text-muted-foreground">
                            {property.listingType === "rent" ? "per month" : "one-time"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {property.bedrooms > 0 && (
                              <div className="flex items-center gap-1" title="Bedrooms">
                                <Bed className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.bedrooms}</span>
                              </div>
                            )}
                            {property.bathrooms > 0 && (
                              <div className="flex items-center gap-1" title="Bathrooms">
                                <Bath className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.bathrooms}</span>
                              </div>
                            )}
                            {property.beds > 0 && (
                              <div className="flex items-center gap-1" title="Beds">
                                <DoorOpen className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.beds}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{property.user_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(property.created_at)}</div>
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
                                  setSelectedProperty(property)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/properties/${property.id}/edit`
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit property
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete property
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

      {/* Create Property Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>Fill in the details to create a new property listing</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter property title"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter property description"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        value={newProperty.price}
                        onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newProperty.currency}
                      onValueChange={(value) => setNewProperty({ ...newProperty, currency: value })}
                    >
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
                    <Label htmlFor="listingType">Listing Type</Label>
                    <Select
                      value={newProperty.listingType}
                      onValueChange={(value) => setNewProperty({ ...newProperty, listingType: value })}
                    >
                      <SelectTrigger id="listingType">
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Property Type</Label>
                    <Select
                      value={newProperty.type}
                      onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter property address"
                    value={newProperty.address}
                    onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={newProperty.city}
                    onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    placeholder="Enter amenities (comma separated)"
                    value={newProperty.amenities}
                    onChange={(e) => setNewProperty({ ...newProperty, amenities: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="Number of bedrooms"
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="Number of bathrooms"
                      value={newProperty.bathrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="beds">Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      placeholder="Number of beds"
                      value={newProperty.beds}
                      onChange={(e) => setNewProperty({ ...newProperty, beds: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="media" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="youtube_link">YouTube Link</Label>
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="youtube_link"
                      placeholder="Enter YouTube video link"
                      value={newProperty.youtube_link}
                      onChange={(e) => setNewProperty({ ...newProperty, youtube_link: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Property Images</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="relative h-32 w-32 overflow-hidden rounded border bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="h-32 w-32">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload property images (max 5 images, 2MB each)</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProperty}>Create Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Property Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProperty.title}</DialogTitle>
                <DialogDescription>
                  {selectedProperty.address}, {selectedProperty.city}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src={selectedProperty.images[0]?.src || "/placeholder.svg"}
                        alt={selectedProperty.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {selectedProperty.images.length > 1 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                        {selectedProperty.images.map((image: any) => (
                          <div key={image.id} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            <img src={image.src || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Details</h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProperty.listingType === "rent" ? "For Rent" : "For Sale"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{selectedProperty.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(selectedProperty.price, selectedProperty.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProperty.city}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Features</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        {selectedProperty.bedrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProperty.bedrooms} Bedrooms</span>
                          </div>
                        )}
                        {selectedProperty.bathrooms > 0 && (
                          <div className="flex items-center gap-2">
                            <Bath className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProperty.bathrooms} Bathrooms</span>
                          </div>
                        )}
                        {selectedProperty.beds > 0 && (
                          <div className="flex items-center gap-2">
                            <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProperty.beds} Beds</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Amenities</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProperty.amenities.split(",").map((amenity: string, index: number) => (
                          <Badge key={index} variant="secondary" className="capitalize">
                            {amenity.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Listed By</h3>
                      <div className="mt-2 text-sm">
                        <p>{selectedProperty.user_name}</p>
                        <p className="text-muted-foreground">Listed on {formatDate(selectedProperty.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedProperty.description}</p>
                </div>

                {selectedProperty.youtube_link && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Video Tour</h3>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <Youtube className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">YouTube video link: {selectedProperty.youtube_link}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="default" asChild>
                  <Link href={`/dashboard/properties/${selectedProperty.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Property
                  </Link>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
