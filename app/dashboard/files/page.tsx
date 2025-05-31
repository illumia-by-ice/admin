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
  Trash2,
  Eye,
  Download,
  ImageIcon,
  FileText,
  File,
  Upload,
  Home,
  User,
  ShoppingBag,
  Grid,
  List,
  Copy,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Mock data for files
const mockFiles = [
  {
    id: "1",
    src: "/placeholder.svg?height=600&width=800",
    name: "property-image-1.jpg",
    provider: "cloudinary",
    property_id: "prop1",
    property_title: "Luxury 3-Bedroom Apartment",
    user_id: "user1",
    user_name: "Jane Smith",
    type: "image",
    size: 1240000,
    mime_type: "image/jpeg",
    created_at: "2023-05-10T10:00:00Z",
    category: "property",
  },
  {
    id: "2",
    src: "/placeholder.svg?height=600&width=800",
    name: "product-image-1.jpg",
    provider: "cloudinary",
    product_id: "prod1",
    product_title: "Modern Sofa Set",
    user_id: "user2",
    user_name: "John Doe",
    type: "image",
    size: 980000,
    mime_type: "image/jpeg",
    created_at: "2023-06-15T14:30:00Z",
    category: "product",
  },
  {
    id: "3",
    src: "/placeholder.svg?height=600&width=800",
    name: "id-verification.pdf",
    provider: "aws",
    user_id: "user3",
    user_name: "Michael Brown",
    type: "document",
    size: 2500000,
    mime_type: "application/pdf",
    created_at: "2023-07-20T09:15:00Z",
    category: "verification",
  },
  {
    id: "4",
    src: "/placeholder.svg?height=600&width=800",
    name: "property-floor-plan.pdf",
    provider: "aws",
    property_id: "prop2",
    property_title: "5-Bedroom Detached Duplex",
    user_id: "user4",
    user_name: "Sarah Johnson",
    type: "document",
    size: 3200000,
    mime_type: "application/pdf",
    created_at: "2023-08-05T16:45:00Z",
    category: "property",
  },
  {
    id: "5",
    src: "/placeholder.svg?height=600&width=800",
    name: "artisan-profile-image.jpg",
    provider: "cloudinary",
    user_id: "user5",
    user_name: "David Wilson",
    type: "image",
    size: 1050000,
    mime_type: "image/jpeg",
    created_at: "2023-09-12T11:20:00Z",
    category: "user",
  },
  {
    id: "6",
    src: "/placeholder.svg?height=600&width=800",
    name: "property-video-tour.mp4",
    provider: "aws",
    property_id: "prop3",
    property_title: "2-Bedroom Terrace House",
    user_id: "user6",
    user_name: "Thomas Anderson",
    type: "video",
    size: 25000000,
    mime_type: "video/mp4",
    created_at: "2023-10-18T13:25:00Z",
    category: "property",
  },
]

export default function FilesPage() {
  const [files, setFiles] = useState(mockFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles(files.filter((file) => file.id !== fileId))
    toast({
      title: "File Deleted",
      description: "The file has been deleted successfully",
      variant: "destructive",
    })
  }

  const handleCopyLink = (fileId: string) => {
    // In a real app, this would copy the actual file URL
    navigator.clipboard.writeText(`https://example.com/files/${fileId}`)
    toast({
      title: "Link Copied",
      description: "File link copied to clipboard",
    })
  }

  const handleUploadFile = () => {
    // This is a mock implementation
    const newFile = {
      id: `${files.length + 1}`,
      src: "/placeholder.svg?height=600&width=800",
      name: "new-uploaded-file.jpg",
      provider: "cloudinary",
      user_id: "user1",
      user_name: "Admin User",
      type: "image",
      size: 1500000,
      mime_type: "image/jpeg",
      created_at: new Date().toISOString(),
      category: "other",
    }

    setFiles([newFile, ...files])
    setIsUploadDialogOpen(false)

    toast({
      title: "File Uploaded",
      description: "The file has been uploaded successfully",
    })
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.property_title && file.property_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (file.product_title && file.product_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      file.user_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || file.type === typeFilter
    const matchesCategory = categoryFilter === "all" || file.category === categoryFilter

    return matchesSearch && matchesType && matchesCategory
  })

  const fileTypes = Array.from(new Set(files.map((file) => file.type)))
  const fileCategories = Array.from(new Set(files.map((file) => file.category)))

  const getFileIcon = (type: string, mimeType: string) => {
    if (type === "image") return <ImageIcon className="h-6 w-6 text-blue-500" />
    if (type === "video") return <FileText className="h-6 w-6 text-purple-500" />
    if (type === "document" && mimeType.includes("pdf")) return <FileText className="h-6 w-6 text-red-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "property":
        return <Home className="h-4 w-4" />
      case "product":
        return <ShoppingBag className="h-4 w-4" />
      case "user":
        return <User className="h-4 w-4" />
      case "verification":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files</h1>
          <p className="text-muted-foreground">Manage uploaded files and documents</p>
        </div>
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground">All uploaded files</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{files.filter((f) => f.type === "image").length}</div>
            <p className="text-xs text-muted-foreground">Image files</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{files.filter((f) => f.type === "document").length}</div>
            <p className="text-xs text-muted-foreground">Document files</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}</div>
            <p className="text-xs text-muted-foreground">Storage used</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>File Management</CardTitle>
              <CardDescription>View and manage all uploaded files</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="File type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {fileCategories.map((category) => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category}
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

            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredFiles.length === 0 ? (
                  <div className="col-span-full flex h-40 items-center justify-center rounded-md border">
                    <p className="text-muted-foreground">No files found.</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div key={file.id} className="group relative overflow-hidden rounded-md border bg-background">
                      <div className="absolute right-2 top-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/40">
                              <MoreHorizontal className="h-4 w-4 text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFile(file)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(file.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFile(file.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div
                        className="aspect-square w-full cursor-pointer overflow-hidden bg-muted"
                        onClick={() => {
                          setSelectedFile(file)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        {file.type === "image" ? (
                          <img
                            src={file.src || "/placeholder.svg"}
                            alt={file.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {getFileIcon(file.type, file.mime_type)}
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {file.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No files found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded bg-muted flex items-center justify-center">
                                {file.type === "image" ? (
                                  <img
                                    src={file.src || "/placeholder.svg"}
                                    alt={file.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getFileIcon(file.type, file.mime_type)
                                )}
                              </div>
                              <div>
                                <div className="font-medium line-clamp-1">{file.name}</div>
                                <div className="text-xs text-muted-foreground">{file.mime_type}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getCategoryIcon(file.category)}
                              <span className="capitalize">{file.category}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {file.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{file.user_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{formatDate(file.created_at)}</div>
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
                                    setSelectedFile(file)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCopyLink(file.id)}>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy link
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFile(file.id)}>
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload File Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Upload a new file to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">Drag and drop or click to upload</p>
                  <p className="text-xs text-muted-foreground">Supports images, videos, and documents up to 10MB</p>
                </div>
                <input id="file-upload" type="file" className="hidden" />
              </label>
            </div>
            <div className="grid gap-2">
              <label htmlFor="file-name" className="text-sm font-medium">
                File Name
              </label>
              <Input id="file-name" placeholder="Enter file name" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="file-category" className="text-sm font-medium">
                Category
              </label>
              <Select defaultValue="other">
                <SelectTrigger id="file-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">Property</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadFile}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View File Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFile.name}</DialogTitle>
                <DialogDescription>
                  Uploaded on {formatDate(selectedFile.created_at)} by {selectedFile.user_name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {selectedFile.type === "image" ? (
                    <img
                      src={selectedFile.src || "/placeholder.svg"}
                      alt={selectedFile.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {getFileIcon(selectedFile.type, selectedFile.mime_type)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">File Type</h3>
                    <p className="capitalize">{selectedFile.type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">MIME Type</h3>
                    <p>{selectedFile.mime_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                    <p>{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Storage Provider</h3>
                    <p className="capitalize">{selectedFile.provider}</p>
                  </div>
                </div>

                {(selectedFile.property_title || selectedFile.product_title) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Related To</h3>
                    <div className="mt-2 flex items-center gap-3 rounded-md border p-3">
                      {selectedFile.property_title ? (
                        <>
                          <Home className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedFile.property_title}</p>
                            <p className="text-sm text-muted-foreground">Property</p>
                          </div>
                        </>
                      ) : selectedFile.product_title ? (
                        <>
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedFile.product_title}</p>
                            <p className="text-sm text-muted-foreground">Product</p>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleCopyLink(selectedFile.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteFile(selectedFile.id)
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
