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
import Link from "next/link"

// Mock data for products
const mockProducts = [
  {
    id: "1",
    title: "Modern Sofa Set",
    description: "Elegant 3-seater sofa with premium fabric upholstery.",
    price: 150000,
    currency: "NGN",
    lat: 6.4351,
    lon: 3.4501,
    city: "Lagos",
    address: "15 Admiralty Way, Lekki Phase 1",
    type: "furniture",
    user_id: "101",
    user_name: "Jane Smith",
    created_at: "2023-05-10T10:00:00Z",
    rating: 4.5,
    reviews: 12,
    images: [
      { id: "img1", src: "/placeholder.svg?height=600&width=800" },
      { id: "img2", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "2",
    title: "Professional Plumbing Services",
    description: "Expert plumbing services for residential and commercial properties.",
    price: 5000,
    currency: "NGN",
    lat: 6.4551,
    lon: 3.3751,
    city: "Lagos",
    address: "10 Kofo Abayomi Street, Victoria Island",
    type: "service",
    user_id: "102",
    user_name: "John Doe",
    created_at: "2023-06-15T14:30:00Z",
    rating: 4.8,
    reviews: 24,
    images: [{ id: "img3", src: "/placeholder.svg?height=600&width=800" }],
  },
  {
    id: "3",
    title: "Luxury Dining Table",
    description: "Handcrafted wooden dining table with 6 chairs.",
    price: 250000,
    currency: "NGN",
    lat: 6.4651,
    lon: 3.5651,
    city: "Lagos",
    address: "7 Banana Island Road, Ikoyi",
    type: "furniture",
    user_id: "103",
    user_name: "Michael Brown",
    created_at: "2023-07-20T09:15:00Z",
    rating: 4.2,
    reviews: 8,
    images: [
      { id: "img4", src: "/placeholder.svg?height=600&width=800" },
      { id: "img5", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "4",
    title: "Interior Design Consultation",
    description: "Professional interior design services for your home or office.",
    price: 25000,
    currency: "NGN",
    lat: 6.5151,
    lon: 3.3851,
    city: "Abuja",
    address: "12 Herbert Macaulay Way, Central District",
    type: "service",
    user_id: "104",
    user_name: "Sarah Johnson",
    created_at: "2023-08-05T16:45:00Z",
    rating: 5.0,
    reviews: 17,
    images: [{ id: "img7", src: "/placeholder.svg?height=600&width=800" }],
  },
  {
    id: "5",
    title: "Smart Home Security System",
    description: "Complete home security system with cameras and motion sensors.",
    price: 120000,
    currency: "NGN",
    lat: 6.6051,
    lon: 3.3551,
    city: "Port Harcourt",
    address: "5 Aba Road, GRA",
    type: "electronics",
    user_id: "105",
    user_name: "David Wilson",
    created_at: "2023-09-12T11:20:00Z",
    rating: 4.7,
    reviews: 9,
    images: [
      { id: "img8", src: "/placeholder.svg?height=600&width=800" },
      { id: "img9", src: "/placeholder.svg?height=600&width=800" },
    ],
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    currency: "NGN",
    city: "",
    address: "",
    type: "furniture",
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

    const createdProduct = {
      id: `${products.length + 1}`,
      ...newProduct,
      price: Number(newProduct.price),
      lat: 6.5151,
      lon: 3.3851,
      user_id: "101",
      user_name: "Admin User",
      created_at: new Date().toISOString(),
      rating: 0,
      reviews: 0,
      images: [{ id: "img-new", src: "/placeholder.svg?height=600&width=800" }],
    }

    setProducts([createdProduct, ...products])
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

    toast({
      title: "Product Created",
      description: "The product has been created successfully",
    })
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((product) => product.id !== productId))
    toast({
      title: "Product Deleted",
      description: "The product has been deleted successfully",
      variant: "destructive",
    })
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || product.type === typeFilter
    const matchesCity = cityFilter === "all" || product.city === cityFilter

    return matchesSearch && matchesType && matchesCity
  })

  const cities = Array.from(new Set(products.map((product) => product.city)))
  const productTypes = Array.from(new Set(products.map((product) => product.type)))

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
            <div className="text-2xl font-bold">{products.length}</div>
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
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {(products.reduce((acc, product) => acc + product.rating, 0) / products.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Across all products</p>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
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
                            <span>{product.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({product.reviews})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{product.user_name}</div>
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
          </div>
        </CardContent>
      </Card>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
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
                    <div className="relative h-32 w-32 overflow-hidden rounded border bg-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="h-32 w-32">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload product images (max 5 images, 2MB each)</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProduct}>Create Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
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
                            {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Listed By</h3>
                      <div className="mt-2 text-sm">
                        <p>{selectedProduct.user_name}</p>
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
