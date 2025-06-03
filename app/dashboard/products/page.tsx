"use client"

import { useState, useRef } from "react"
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
  ShoppingBag,
  MapPin,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  DollarSign,
  Tag,
  Package,
  Star,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  type Product,
  type ProductsResponse
} from "@/lib/api/dashboard"
import Link from "next/link"
export default function ProductsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    city: "",
    address: "",
    type: "furniture",
  })

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleCityFilterChange = (value: string) => {
    setCityFilter(value)
    setCurrentPage(1)
  }

  // Fetch products with React Query
  const { data: productsData, isLoading, isError, error } = useQuery({
    queryKey: ["products", currentPage, typeFilter, cityFilter, searchTerm],
    queryFn: () => getProducts({
      page: currentPage,
      limit: 10,
      type: typeFilter !== "all" ? typeFilter : undefined,
      city: cityFilter !== "all" ? cityFilter : undefined,
      search: searchTerm || undefined,
    }),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  })

  const createProductMutation = useMutation({
    mutationFn: (formData: FormData) => createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsCreateDialogOpen(false)
      setNewProduct({
        title: "",
        description: "",
        price: "",
        currency: "NGN",
        city: "",
        address: "",
        type: "furniture",
      })
      setSelectedImages([])
      setImagePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      toast({
        title: "Product Created",
        description: "The product has been created successfully",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      })
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully",
        variant: "destructive",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    },
  })

  const products = productsData?.data || []
  const meta = productsData?.meta

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

  const handleCreateProduct = () => {
    // Validate form
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.city || !newProduct.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product image",
        variant: "destructive",
      })
      return
    }

    // Create FormData
    const formData = new FormData()
    formData.append("title", newProduct.title)
    formData.append("description", newProduct.description)
    formData.append("price", newProduct.price)
    formData.append("currency", newProduct.currency)
    formData.append("type", newProduct.type)
    formData.append("city", newProduct.city)
    formData.append("address", newProduct.address)
    formData.append("lat", "0") // Default coordinates
    formData.append("lon", "0")

    // Add images
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    createProductMutation.mutate(formData)
  }

  const handleDeleteProduct = (productId: string) => {
    deleteProductMutation.mutate(productId)
  }

  // Since we're using the API, we don't need to filter on the frontend
  // The API already handles filtering via query parameters
  const displayProducts = products

  const cities = Array.from(new Set(products.map((product) => product.city)))
  const productTypes = Array.from(new Set(products.map((product) => product.type)))

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">Error loading products</p>
          <p className="text-muted-foreground">{error?.message || "Something went wrong"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage and monitor product listings</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{meta?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All listed products</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{products.filter((p) => p.type === "service").length}</div>
            <p className="text-xs text-muted-foreground">Listed services</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Products on this page</p>
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
          <CardTitle>Product Management</CardTitle>
          <CardDescription>View and manage all product listings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {productTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={cityFilter} onValueChange={handleCityFilterChange}>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Listed By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-16 overflow-hidden rounded bg-muted">
                              <img
                                src={product.images[0]?.src || "/placeholder.svg"}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium line-clamp-1">{product.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {product.images.length} {product.images.length === 1 ? "image" : "images"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="line-clamp-1">{product.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{formatCurrency(product.price, product.currency)}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.type === "service" ? "per service" : "one-time"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span>{product.reviews?.length || 0}</span>
                            <span className="text-xs text-muted-foreground">reviews</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{product.user?.name || "Unknown"}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(product.created_at)}</div>
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
                                  setSelectedProduct(product)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  window.location.href = `/dashboard/products/${product.id}/edit`
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit product
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={deleteProductMutation.isPending}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete product
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

            {/* Pagination Controls */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          disabled={isLoading}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {meta.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={currentPage === meta.totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(meta.totalPages)}
                          disabled={isLoading}
                        >
                          {meta.totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(meta.totalPages, currentPage + 1))}
                    disabled={currentPage === meta.totalPages || isLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="h-[95vh] overflow-y-scroll sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Fill in the details to create a new product listing</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
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
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
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
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newProduct.currency}
                      onValueChange={(value) => setNewProduct({ ...newProduct, currency: value })}
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
                    value={newProduct.type}
                    onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
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
                    value={newProduct.address}
                    onChange={(e) => setNewProduct({ ...newProduct, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={newProduct.city}
                    onChange={(e) => setNewProduct({ ...newProduct, city: e.target.value })}
                  />
                </div>
              </TabsContent>
              <TabsContent value="media" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Product Images</Label>
                  <div className="flex flex-wrap gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative h-32 w-32 overflow-hidden rounded border bg-muted">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    {selectedImages.length < 5 && (
                      <div
                        className="h-32 w-32 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
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
                    Upload product images (max 5 images, 2MB each). Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={createProductMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="h-[95vh] overflow-y-scroll sm:max-w-[800px]">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProduct.title}</DialogTitle>
                <DialogDescription>
                  {selectedProduct.address}, {selectedProduct.city}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <img
                        src={selectedProduct.images[0]?.src || "/placeholder.svg"}
                        alt={selectedProduct.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                        {selectedProduct.images.map((image: any) => (
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
                          <span className="capitalize">{selectedProduct.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedProduct.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(selectedProduct.price, selectedProduct.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span>
                            {selectedProduct.reviews?.length || 0} reviews
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Listed By</h3>
                      <div className="mt-2 text-sm">
                        <p>{selectedProduct.user?.name || "Unknown User"}</p>
                        <p className="text-muted-foreground">Listed on {formatDate(selectedProduct.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedProduct.description}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button variant="default" asChild>
                  <Link href={`/dashboard/products/${selectedProduct.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Product
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
