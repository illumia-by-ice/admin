"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Bed,
  Bath,
  DoorOpen,
  Save,
  ImageIcon,
  Youtube,
  DollarSign,
  Building,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getProperties, 
  updateProperty, 
  addPropertyImage, 
  deletePropertyImage,
  type Property,
  type PropertyImage
} from "@/lib/api/dashboard"

// Define predefined amenities with categories
const PREDEFINED_AMENITIES = {
  essentials: [
    "Air Conditioning",
    "Heating",
    "Wi-Fi",
    "Electricity",
    "Water Supply",
    "Security System",
    "Parking Space"
  ],
  comfort: [
    "Swimming Pool", 
    "Gym/Fitness Center",
    "Garden/Yard",
    "Balcony/Terrace",
    "Elevator",
    "Generator",
    "Laundry Room",
    "Storage Space"
  ],
  extras: [
    "Furnished",
    "Semi-Furnished",
    "Pet Friendly",
    "Playground",
    "24/7 Security",
    "CCTV Surveillance",
    "Gated Community",
    "Backup Power"
  ]
}

export default function EditPropertyPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState("")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([])
  const [propertyData, setPropertyData] = useState({
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
  })

  // Fetch property data
  const { data: propertiesResponse, isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getProperties(),
  })

  const property = propertiesResponse?.data?.find(p => p.id === id)  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: (formData: FormData) => updateProperty(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      // Reset new images after successful update
      setSelectedImages([])
      setImagePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      toast({
        title: "Success",
        description: "Property updated successfully",
      })
    },
    onError: (error: Error) => {      toast({
        title: "Error",
        description: error.message || "Failed to update property",
        variant: "destructive",
      })
    },
  })

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: ({ propertyId, imageId }: { propertyId: string; imageId: string }) => 
      deletePropertyImage(propertyId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] })
      toast({
        title: "Success",
        description: "Image deleted successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      })
    },  })

  // Initialize form data when property is loaded
  useEffect(() => {
    if (property) {
      setPropertyData({
        title: property.title || "",
        description: property.description || "",
        price: property.price || "",
        currency: property.currency || "NGN",
        amenities: property.amenities || "",
        city: property.city || "",
        address: property.address || "",
        listingType: property.listingType || "rent",
        type: property.type || "property",
        bathrooms: property.bathrooms || 0,
        beds: property.beds || 0,
        bedrooms: property.bedrooms || 0,
        youtube_link: property.youtube_link || "",
      })

      // Set existing images
      setExistingImages(property.images || [])

      // Set selected amenities
      if (property.amenities) {
        setSelectedAmenities(property.amenities.split(', ').map(a => a.trim()))
      }
    }
  }, [property])
  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handleAddCustomAmenity = () => {
    const trimmedAmenity = customAmenity.trim()
    if (trimmedAmenity && !selectedAmenities.includes(trimmedAmenity)) {
      setSelectedAmenities(prev => [...prev, trimmedAmenity])
      setCustomAmenity("")
      toast({
        title: "Success",
        description: "Custom amenity added successfully",
      })
    } else if (selectedAmenities.includes(trimmedAmenity)) {
      toast({
        title: "Notice",
        description: "This amenity is already selected",
        variant: "destructive",
      })
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleImageFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    handleImageFiles(files)
  }

  const handleImageFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Error", 
        description: "Please select only image files",
        variant: "destructive",
      })
      return
    }

    if (validFiles.some(file => file.size > 2 * 1024 * 1024)) {
      toast({
        title: "Error", 
        description: "Each image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    const newFiles = validFiles.slice(0, 5 - selectedImages.length)
    
    if (newFiles.length !== validFiles.length) {
      toast({
        title: "Error", 
        description: "Maximum 5 images allowed",
        variant: "destructive",
      })
      return
    }

    setSelectedImages(prev => [...prev, ...newFiles])

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }
  const handleSaveProperty = () => {
    // Validate form
    if (
      !propertyData.title ||
      !propertyData.description ||
      !propertyData.price ||
      !propertyData.city ||
      !propertyData.address
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }    // Prepare the JSON data according to API structure
    const jsonData = {
      title: propertyData.title,
      description: propertyData.description,
      price: propertyData.price,
      currency: propertyData.currency,
      type: propertyData.type,
      listingType: propertyData.listingType,
      address: propertyData.address,
      city: propertyData.city,
      amenities: selectedAmenities.join(', '), // Convert array to comma-separated string
      bed: propertyData.beds, // Note: API expects 'bed', not 'beds'
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      youtube: propertyData.youtube_link || "", // Note: API expects 'youtube', not 'youtube_link'
      lat: property?.lat || 0,
      lon: property?.lon || 0,
    }

    // Prepare existing images to keep
    const existingImages = property?.images || []
    const otherImages = existingImages.length > 0 ? [{ images: existingImages }] : []

    // Create FormData
    const formData = new FormData()
    formData.append("json", JSON.stringify(jsonData))
    formData.append("otherImages", JSON.stringify(otherImages))
    
    // Add new images
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    updatePropertyMutation.mutate(formData)
  }

  const handleImageDelete = (imageId: string) => {
    deleteImageMutation.mutate({ propertyId: id as string, imageId })
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Property not found</p>
          <p className="text-muted-foreground">The property you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/properties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>
          <p className="text-muted-foreground">Update property details and information</p>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                  value={propertyData.title}
                  onChange={(e) => setPropertyData({ ...propertyData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter property description"
                  value={propertyData.description}
                  onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
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
                      value={propertyData.price}
                      onChange={(e) => setPropertyData({ ...propertyData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={propertyData.currency}
                    onValueChange={(value) => setPropertyData({ ...propertyData, currency: value })}
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
                    value={propertyData.listingType}
                    onValueChange={(value) => setPropertyData({ ...propertyData, listingType: value })}
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
                    value={propertyData.type}
                    onValueChange={(value) => setPropertyData({ ...propertyData, type: value })}
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
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={propertyData.city}
                  onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                />
              </div>              <div className="grid gap-2">
                <Label htmlFor="amenities">Amenities</Label>
                  {/* Selected Amenities with Remove Option */}
                {selectedAmenities.length > 0 && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">
                        Selected amenities ({selectedAmenities.length}):
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAmenities([])}
                        className="text-xs h-7"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAmenities.map((amenity) => (
                        <Badge 
                          key={amenity} 
                          variant="secondary" 
                          className="text-xs pl-3 pr-1 py-1 flex items-center gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          onClick={() => handleAmenityToggle(amenity)}
                        >
                          {amenity}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click on any amenity to remove it
                    </p>
                  </div>
                )}

                {/* Predefined Amenities */}
                <div className="space-y-6">
                  {Object.entries(PREDEFINED_AMENITIES).map(([category, amenities]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-sm capitalize text-muted-foreground">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`amenity-${amenity}`}
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => handleAmenityToggle(amenity)}
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
                  ))}
                </div>                {/* Custom Amenity Input */}
                <div className="mt-6 p-4 border rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">Add Custom Amenity</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom amenity"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomAmenity()
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleAddCustomAmenity}
                      disabled={!customAmenity.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Add amenities not listed above
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="beds">Beds</Label>
                  <Input
                    id="beds"
                    type="number"
                    placeholder="Number of beds"
                    value={propertyData.beds}
                    onChange={(e) => setPropertyData({ ...propertyData, beds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="Number of bedrooms"
                    value={propertyData.bedrooms}
                    onChange={(e) => setPropertyData({ ...propertyData, bedrooms: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="Number of bathrooms"
                    value={propertyData.bathrooms}
                    onChange={(e) => setPropertyData({ ...propertyData, bathrooms: parseInt(e.target.value) || 0 })}
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
                    value={propertyData.youtube_link}
                    onChange={(e) => setPropertyData({ ...propertyData, youtube_link: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Existing Images */}
              {property.images && property.images.length > 0 && (
                <div className="grid gap-2">
                  <Label>Current Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.images.map((image, index) => (
                      <div key={image.id} className="relative group">                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                          <img
                            src={image.src}
                            alt={`Property image ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImageDelete(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 text-xs bg-blue-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Images */}
              <div className="grid gap-2">
                <Label>Add New Images</Label>
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

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                            <img
                              src={preview}
                              alt={`New preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <Badge className="absolute bottom-2 left-2 text-xs bg-green-500">
                            New
                          </Badge>
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
          
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <Button variant="outline" asChild>
              <Link href="/dashboard/properties">Cancel</Link>
            </Button>
            <Button 
              onClick={handleSaveProperty}
              disabled={updatePropertyMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updatePropertyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
