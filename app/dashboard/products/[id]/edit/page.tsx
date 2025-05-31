"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Trash2,
  ImageIcon,
  DollarSign,
  Tag,
  MapPin,
  Package,
  Plus,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getProduct, 
  updateProduct, 
  deleteProduct,
  type Product
} from "@/lib/api/dashboard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    city: "",
    address: "",
    type: "furniture",
  })

  // Fetch product data
  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  })

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (formData: FormData) => updateProduct(productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", productId] })
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully",
      })
      router.push("/dashboard/products")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      })
    },
  })

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully",
        variant: "destructive",
      })
      router.push("/dashboard/products")
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    },
  })
  // Initialize form data when product loads
  useEffect(() => {
    if (product) {
      const productData = product.data || product; // Handle wrapped response
      setProductData({
        title: productData.title,
        description: productData.description,
        price: productData.price.toString(),
        currency: productData.currency,
        city: productData.city,
        address: productData.address,
        type: productData.type,
      })
      setExistingImages(productData.images || [])
    }
  }, [product])

  const formatCurrency = (amount: number, currency: string) => {
    return currency === "NGN" ? `₦${amount.toLocaleString()}` : `$${amount.toLocaleString()}`
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
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

    const totalImages = existingImages.length + selectedImages.length + validFiles.length
    if (totalImages > 5) {
      toast({
        title: "Error", 
        description: "Maximum 5 images allowed",
        variant: "destructive",
      })
      return
    }

    setSelectedImages(prev => [...prev, ...validFiles])

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreviews(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpdateProduct = () => {
    // Validate form
    if (!productData.title || !productData.description || !productData.price || !productData.city || !productData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const totalImages = existingImages.length + selectedImages.length
    if (totalImages === 0) {
      toast({
        title: "Error",
        description: "Please keep at least one product image",
        variant: "destructive",
      })
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append("title", productData.title)
    formData.append("description", productData.description)
    formData.append("price", productData.price)
    formData.append("currency", productData.currency)
    formData.append("type", productData.type)
    formData.append("city", productData.city)
    formData.append("address", productData.address)
    formData.append("lat", "0") // Default coordinates
    formData.append("lon", "0")

    // Add existing image IDs to keep
    existingImages.forEach((image, index) => {
      formData.append(`keep_images[${index}]`, image.id)
    })

    // Add new images
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    updateProductMutation.mutate(formData)
  }

  const handleDeleteProduct = () => {
    deleteProductMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Error loading product</p>
          <p className="text-muted-foreground">{error?.message || "Product not found"}</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/products")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">Update product information and images</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleteProductMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>      {/* Product Summary Card */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center justify-between">
            <span>{product.data.title}</span>
            <Badge variant="outline" className="capitalize">
              {product.data.type}
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {product.data.city}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(product.data.price, product.data.currency)}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Edit Form */}
      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Update the product details and images</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  placeholder="Enter product title"
                  value={productData.title}
                  onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
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
                      value={productData.price}
                      onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={productData.currency}
                    onValueChange={(value) => setProductData({ ...productData, currency: value })}
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
              <div className="grid gap-2">
                <Label htmlFor="type">Product Type</Label>
                <Select
                  value={productData.type}
                  onValueChange={(value) => setProductData({ ...productData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={productData.address}
                  onChange={(e) => setProductData({ ...productData, address: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={productData.city}
                  onChange={(e) => setProductData({ ...productData, city: e.target.value })}
                />
              </div>
            </TabsContent>
            <TabsContent value="media" className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Product Images</Label>
                <div className="flex flex-wrap gap-4">
                  {/* Existing Images */}
                  {existingImages.map((image, index) => (
                    <div key={`existing-${image.id}`} className="relative h-32 w-32 overflow-hidden rounded border bg-muted">
                      <img
                        src={image.src || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeExistingImage(index)}
                      >
                        ×
                      </Button>
                      <Badge className="absolute bottom-1 left-1 text-xs">
                        Existing
                      </Badge>
                    </div>
                  ))}
                  
                  {/* New Images */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative h-32 w-32 overflow-hidden rounded border bg-muted">
                      <img
                        src={preview}
                        alt={`New image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0"
                        onClick={() => removeNewImage(index)}
                      >
                        ×
                      </Button>
                      <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">
                        New
                      </Badge>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  {(existingImages.length + selectedImages.length) < 5 && (
                    <div
                      className="h-32 w-32 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Add Image</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <p className="text-xs text-muted-foreground">
                  Upload product images (max 5 images total, 2MB each). Supported formats: JPG, PNG, GIF
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
