"use client";

import Link from "next/link";

import { useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  addPropertyImage,
  deletePropertyImage,
  type Property,
  type PropertiesResponse,
  type PropertyFormData,
} from "@/lib/api/dashboard";

// Define predefined amenities with categories
const PREDEFINED_AMENITIES = {
  essentials: [
    "Air Conditioning",
    "Heating",
    "Wi-Fi",
    "Electricity",
    "Water Supply",
    "Security System",
    "Parking Space",
  ],
  comfort: [
    "Swimming Pool",
    "Gym/Fitness Center",
    "Garden/Yard",
    "Balcony/Terrace",
    "Elevator",
    "Generator",
    "Laundry Room",
    "Storage Space",
  ],
  extras: [
    "Furnished",
    "Semi-Furnished",
    "Pet Friendly",
    "Playground",
    "24/7 Security",
    "CCTV Surveillance",
    "Gated Community",
    "Backup Power",
  ],
};

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [listingTypeFilter, setListingTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProperty, setNewProperty] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    amenities: "",
    city: "",
    address: "",
    listingType: "rent",
    type: "property",
    bathrooms: 0,
    beds: 0,
    bedrooms: 0,
    youtube_link: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper functions for image handling
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = selectedImages.length + newFiles.length;

    if (totalImages > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (2MB each)
    const invalidFiles = newFiles.filter((file) => file.size > 2 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Each image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    const totalImages = selectedImages.length + files.length;
    if (totalImages > 5) {
      toast({
        title: "Error",
        description: "Maximum 5 images allowed",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const invalidFiles = files.filter((file) => file.size > 2 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: "Error",
        description: "Each image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Fetch properties with React Query
  const {
    data: propertiesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "properties",
      currentPage,
      typeFilter,
      listingTypeFilter,
      cityFilter,
      searchTerm,
    ],
    queryFn: () =>
      getProperties({
        page: currentPage,
        limit: 10,
        type: typeFilter !== "all" ? typeFilter : undefined,
        listingType:
          listingTypeFilter !== "all" ? listingTypeFilter : undefined,
        city: cityFilter !== "all" ? cityFilter : undefined,
        search: searchTerm || undefined,
      }),
    staleTime: 60000, // Cache for 1 minute
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: (formData: FormData) => createProperty(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setIsCreateDialogOpen(false);
      setNewProperty({
        title: "",
        description: "",
        price: "",
        currency: "NGN",
        amenities: "",
        city: "",
        address: "",
        listingType: "rent",
        type: "property",
        bathrooms: 0,
        beds: 0,
        bedrooms: 0,
        youtube_link: "",
      });
      setSelectedAmenities([]);
      setSelectedImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Success",
        description: "Property created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProperty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete property",
        variant: "destructive",
      });
    },
  });

  // Add property image mutation
  const addImageMutation = useMutation({
    mutationFn: ({ propertyId, file }: { propertyId: string; file: File }) =>
      addPropertyImage(propertyId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  // Delete property image mutation
  const deleteImageMutation = useMutation({
    mutationFn: ({
      propertyId,
      imageId,
    }: {
      propertyId: string;
      imageId: string;
    }) => deletePropertyImage(propertyId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const properties = propertiesData?.data || [];
  const meta = propertiesData?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return currency === "NGN"
      ? `₦${amount.toLocaleString()}`
      : `$${amount.toLocaleString()}`;
  };

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
      });
      return;
    }

    // Prepare the JSON data
    const propertyData = {
      title: newProperty.title,
      description: newProperty.description,
      price: newProperty.price,
      currency: newProperty.currency,
      type: newProperty.type,
      listingType: newProperty.listingType,
      address: newProperty.address,
      city: newProperty.city,
      amenities: selectedAmenities.join(", "),
      bed: newProperty.beds,
      bedrooms: newProperty.bedrooms,
      bathrooms: newProperty.bathrooms,
      youtube_link: newProperty.youtube_link || undefined,
    };

    // Create FormData according to PropertyFormData interface
    const formData = new FormData();

    // Add JSON data as stringified field
    formData.append("json", JSON.stringify(propertyData));

    // Add images to FormData
    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    createPropertyMutation.mutate(formData);
  };

  const handleDeleteProperty = (propertyId: string) => {
    deletePropertyMutation.mutate(propertyId);
  };

  const handleImageUpload = (propertyId: string, file: File) => {
    addImageMutation.mutate({ propertyId, file });
  };

  const handleImageDelete = (propertyId: string, imageId: string) => {
    deleteImageMutation.mutate({ propertyId, imageId });
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.city || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || property.type === typeFilter;
    const matchesListingType =
      listingTypeFilter === "all" || property.listingType === listingTypeFilter;
    const matchesCity =
      cityFilter === "all" || (property.city || "") === cityFilter;

    return matchesSearch && matchesType && matchesListingType && matchesCity;
  });

  const cities = Array.from(
    new Set(
      properties
        .map((property) => property.city)
        .filter((city): city is string => Boolean(city))
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">
            Manage and monitor property listings
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : meta.total}
            </div>
            <p className="text-xs text-muted-foreground">
              All listed properties
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">For Rent</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : properties.filter((p) => p.listingType === "rent").length}
            </div>
            <p className="text-xs text-muted-foreground">Properties for rent</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">For Sale</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : properties.filter((p) => p.listingType === "sale").length}
            </div>
            <p className="text-xs text-muted-foreground">Properties for sale</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {isLoading ? "..." : cities.length}
            </div>
            <p className="text-xs text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Property Management</CardTitle>
          <CardDescription>
            View and manage all property listings
          </CardDescription>
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
                      <SelectItem value="shortlets">Shortlets</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select
                    value={listingTypeFilter}
                    onValueChange={setListingTypeFilter}
                  >
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
                        <SelectItem key={city} value={city || ""}>
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
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Loading properties...
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-red-600"
                      >
                        Error loading properties:{" "}
                        {error?.message || "Unknown error"}
                      </TableCell>
                    </TableRow>
                  ) : filteredProperties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
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
                                src={
                                  property.images[0]?.src || "/placeholder.svg"
                                }
                                alt={property.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium line-clamp-1">
                                {property.title}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {property.images.length}{" "}
                                {property.images.length === 1
                                  ? "image"
                                  : "images"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="line-clamp-1">
                              {property.city || "N/A"}
                            </span>
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
                              {property.listingType === "rent"
                                ? "For Rent"
                                : "For Sale"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatCurrency(
                              parseInt(property.price) || 0,
                              property.currency
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {property.listingType === "rent"
                              ? "per month"
                              : "one-time"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {property.beds && property.beds > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Beds"
                              >
                                <Bed className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{property.beds}</span>
                              </div>
                            )}
                            {property.bedrooms && property.bedrooms > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Bedrooms"
                              >
                                <Bed className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {property.bedrooms}
                                </span>
                              </div>
                            )}
                            {property.bathrooms && property.bathrooms > 0 && (
                              <div
                                className="flex items-center gap-1"
                                title="Bathrooms"
                              >
                                <Bath className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">
                                  {property.bathrooms}
                                </span>
                              </div>
                            )}
                            {property.parking_spaces &&
                              property.parking_spaces > 0 && (
                                <div
                                  className="flex items-center gap-1"
                                  title="Parking Spaces"
                                >
                                  <DoorOpen className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">
                                    {property.parking_spaces}
                                  </span>
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(property.created_at)}
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
                                  setSelectedProperty(property);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/properties/${property.id}/edit`;
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit property
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteProperty(property.id)
                                }
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
        <DialogContent className="h-[95vh] overflow-y-scroll sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new property listing
            </DialogDescription>
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
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter property description"
                    value={newProperty.description}
                    onChange={(e) =>
                      setNewProperty({
                        ...newProperty,
                        description: e.target.value,
                      })
                    }
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
                        onChange={(e) =>
                          setNewProperty({
                            ...newProperty,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newProperty.currency}
                      onValueChange={(value) =>
                        setNewProperty({ ...newProperty, currency: value })
                      }
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
                      onValueChange={(value) =>
                        setNewProperty({ ...newProperty, listingType: value })
                      }
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
                      onValueChange={(value) =>
                        setNewProperty({ ...newProperty, type: value })
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property">Property</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                        <SelectItem value="shortlets">Shortlets</SelectItem>
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
                    onChange={(e) =>
                      setNewProperty({
                        ...newProperty,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={newProperty.city}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, city: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <div className="space-y-6">
                    {Object.entries(PREDEFINED_AMENITIES).map(
                      ([category, amenities]) => (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-sm capitalize text-muted-foreground">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {amenities.map((amenity) => (
                              <div
                                key={amenity}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`amenity-${amenity}`}
                                  checked={selectedAmenities.includes(amenity)}
                                  onCheckedChange={() =>
                                    handleAmenityToggle(amenity)
                                  }
                                />
                                <Label
                                  htmlFor={`amenity-${amenity}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  {selectedAmenities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        Selected amenities ({selectedAmenities.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {selectedAmenities.map((amenity) => (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="text-xs"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="beds">Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      placeholder="Number of beds"
                      value={newProperty.beds}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          beds: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      placeholder="Number of bedrooms"
                      value={newProperty.bedrooms}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          bedrooms: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      placeholder="Number of bathrooms"
                      value={newProperty.bathrooms}
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          bathrooms: parseInt(e.target.value) || 0,
                        })
                      }
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
                      onChange={(e) =>
                        setNewProperty({
                          ...newProperty,
                          youtube_link: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Property Images</Label>
                  <div className="space-y-4">
                    {/* Image Upload Area */}
                    <div
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload images or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum 5 images, 2MB each (PNG, JPG, JPEG)
                      </p>
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                            {index === 0 && (
                              <Badge className="absolute bottom-2 left-2 text-xs bg-blue-500">
                                Featured
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add More Button */}
                    {selectedImages.length > 0 && selectedImages.length < 5 && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More Images ({selectedImages.length}/5)
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProperty}
              disabled={createPropertyMutation.isPending}
            >
              {createPropertyMutation.isPending
                ? "Creating..."
                : "Create Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Property Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="h-[95vh] overflow-y-auto sm:max-w-[800px]">
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
                        src={
                          selectedProperty.images[0]?.src || "/placeholder.svg"
                        }
                        alt={selectedProperty.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {selectedProperty.images.length > 1 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                        {selectedProperty.images.map((image: any) => (
                          <div
                            key={image.id}
                            className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted"
                          >
                            <img
                              src={image.src || "/placeholder.svg"}
                              alt=""
                              className="h-full w-full object-cover"
                            />
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
                          <span>
                            {selectedProperty.listingType === "rent"
                              ? "For Rent"
                              : "For Sale"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">
                            {selectedProperty.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {formatCurrency(
                              parseInt(selectedProperty.price) || 0,
                              selectedProperty.currency
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProperty.city || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Features</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        {selectedProperty.beds && selectedProperty.beds > 0 && (
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProperty.beds} Beds</span>
                          </div>
                        )}
                        {selectedProperty.bedrooms &&
                          selectedProperty.bedrooms > 0 && (
                            <div className="flex items-center gap-2">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedProperty.bedrooms} Bedrooms</span>
                            </div>
                          )}
                        {selectedProperty.bathrooms &&
                          selectedProperty.bathrooms > 0 && (
                            <div className="flex items-center gap-2">
                              <Bath className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {selectedProperty.bathrooms} Bathrooms
                              </span>
                            </div>
                          )}
                        {selectedProperty.parking_spaces &&
                          selectedProperty.parking_spaces > 0 && (
                            <div className="flex items-center gap-2">
                              <DoorOpen className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {selectedProperty.parking_spaces} Parking Spaces
                              </span>
                            </div>
                          )}
                        {selectedProperty.square_feet && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedProperty.square_feet} sq ft</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Amenities</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProperty.amenities &&
                          selectedProperty.amenities
                            .split(", ")
                            .map((amenity, index) => (
                              <Badge key={index} variant="secondary">
                                {amenity.trim()}
                              </Badge>
                            ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Listed By</h3>
                      <div className="mt-2 text-sm">
                        <p>{selectedProperty.user_name}</p>
                        <p className="text-muted-foreground">
                          Listed on {formatDate(selectedProperty.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedProperty.description}
                  </p>
                </div>

                {selectedProperty.youtube_link && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Video Tour</h3>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                      <Youtube className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      YouTube video link: {selectedProperty.youtube_link}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button variant="default" asChild>
                  <Link
                    href={`/dashboard/properties/${selectedProperty.id}/edit`}
                  >
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
  );
}
