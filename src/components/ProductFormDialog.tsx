// components/ProductFormDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  MapPin,
  Plus,
  X,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductFormData, availableTags } from "@/constants/product";
import { Money } from "iconsax-react";

// Available currencies
const currencies = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

interface ImageData {
  file: File | null;
  preview: string;
}

interface ExtendedProductFormData extends ProductFormData {
  currency: string;
  imageFiles: File[];
}

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    rawData: ExtendedProductFormData;
    formData: FormData;
  }) => void;
  initialData?: Product;
  isEditing: boolean;
  isLoading: boolean;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing,
  isLoading,
}) => {
  const [formData, setFormData] = useState<ExtendedProductFormData>({
    title: "",
    price: "",
    description: "",
    tags: [],
    address: "",
    images: [],
    currency: "NGN",
    imageFiles: [],
  });

  const [imageData, setImageData] = useState<ImageData[]>([]);

  // Initialize form with product data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      // For editing, we need to set the image previews but can't recover the original files
      setFormData({
        title: initialData.title,
        price: initialData.price.toString(),
        description: initialData.description,
        tags: initialData.tags.map((t) => t.name),
        address: initialData.address.address,
        images: initialData.images.map((i) => i.src),
        currency: initialData.currency || "NGN",
        imageFiles: [], // We can't recover the files for editing, just the URLs
      });

      // Set image previews for existing images
      setImageData(
        initialData.images.map((img) => ({
          file: null, // Can't recover the original file
          preview: img.src,
        }))
      );
    } else {
      // Reset form when creating a new product
      setFormData({
        title: "",
        price: "",
        description: "",
        tags: [],
        address: "",
        images: [],
        currency: "NGN",
        imageFiles: [],
      });

      // Clear image data
      setImageData([]);
    }
  }, [initialData, isEditing, isOpen]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle currency selection
  const handleCurrencyChange = (value: string) => {
    setFormData({
      ...formData,
      currency: value,
    });
  };

  // Handle price input with validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setFormData({
        ...formData,
        price: value,
      });
    }
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter((t) => t !== tag),
      });
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImageFiles = Array.from(files);
    const newImageData = newImageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    // Update image data for preview
    setImageData([...imageData, ...newImageData]);

    // Update form data with files
    setFormData({
      ...formData,
      imageFiles: [...formData.imageFiles, ...newImageFiles],
      images: [...formData.images, ...newImageData.map((img) => img.preview)],
    });

    // Reset the input value so the same file can be selected again if needed
    e.target.value = "";
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    // Create new arrays without the removed image
    const newImageData = [...imageData];
    newImageData.splice(index, 1);
    setImageData(newImageData);

    // Update form data
    const newImageFiles = [...formData.imageFiles];
    if (index < newImageFiles.length) {
      newImageFiles.splice(index, 1);
    }

    const newImages = newImageData.map((img) => img.preview);

    setFormData({
      ...formData,
      imageFiles: newImageFiles,
      images: newImages,
    });
  };

  // Set featured image (move to first position)
  const setFeaturedImage = (index: number) => {
    if (index === 0) return; // Already the featured image

    // Reorder image data
    const newImageData = [...imageData];
    const [imageToFeature] = newImageData.splice(index, 1);
    newImageData.unshift(imageToFeature);
    setImageData(newImageData);

    // Reorder image files if they exist
    const newImageFiles = [...formData.imageFiles];
    if (index < newImageFiles.length) {
      const [fileToFeature] = newImageFiles.splice(index, 1);
      newImageFiles.unshift(fileToFeature);
    }

    // Update form data with reordered images
    setFormData({
      ...formData,
      imageFiles: newImageFiles,
      images: newImageData.map((img) => img.preview),
    });
  };

  // Find currency symbol
  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find((c) => c.code === code);
    return currency ? currency.symbol : code;
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.title ||
      !formData.price ||
      !formData.description ||
      formData.tags.length === 0 ||
      !formData.address ||
      imageData.length === 0
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Create a FormData object for submission
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("price", formData.price);
    submitData.append("description", formData.description);
    submitData.append("address", formData.address);
    submitData.append("currency", formData.currency);

    // Append tags
    formData.tags.forEach((tag, index) => {
      submitData.append(`tags[${index}]`, tag);
    });

    // Append images
    formData.imageFiles.forEach((file, index) => {
      submitData.append(`images`, file);
    });

    // For existing images in edit mode that don't have associated files
    if (isEditing) {
      imageData.forEach((img, index) => {
        if (!img.file && img.preview.startsWith("http")) {
          // This is an existing image URL
          submitData.append(`existingImages`, img.preview);
        }
      });
    }

    const rawData = {
      ...formData,
      images: imageData.map((img) => img.preview),
    };
    onSubmit({
      rawData,
      formData: submitData,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your product listing below."
              : "Fill in the details to add a new product to the marketplace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Product Images */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Product Images
                {imageData.length === 0 && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </Label>

              {/* Image Gallery */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                {imageData.length > 0 ? (
                  imageData.map((img, index) => (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden border bg-gray-50 aspect-square ${
                        index === 0 ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <img
                        src={img.preview}
                        alt={`Product image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-1 right-1 flex gap-1">
                        {index !== 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 bg-white bg-opacity-80 hover:bg-opacity-100"
                            onClick={() => setFeaturedImage(index)}
                            title="Set as featured image"
                          >
                            <ImageIcon className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 bg-white bg-opacity-80 hover:bg-opacity-100"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs bg-blue-500">
                          Featured
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 border rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                    <ImageIcon className="h-10 w-10 mb-2" />
                    <p>No images uploaded yet</p>
                  </div>
                )}

                {/* Add Image Button */}
                <div className="border border-dashed rounded-lg flex items-center justify-center bg-gray-50 aspect-square">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
                  >
                    <Plus className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">
                      Add Image
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {imageData.length === 0 && (
                <p className="text-xs text-red-500">
                  Please upload at least one product image
                </p>
              )}

              {imageData.length > 0 && (
                <p className="text-xs text-gray-500">
                  First image is featured. Click the image icon to set a
                  different featured image.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Product title"
                required
              />
            </div>

            {/* Price with Currency Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Currency Selector */}
              <div>
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger id="currency" className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <span className="flex items-center">
                          <span className="mr-2">{currency.symbol}</span>
                          <span>{currency.code}</span>
                          <span className="ml-2 text-gray-500 text-xs">
                            ({currency.name})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Input */}
              <div className="md:col-span-3">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-gray-500 font-medium">
                    {getCurrencySymbol(formData.currency)}
                  </div>
                  <Input
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
                required
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium">
                Tags <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      formData.tags.includes(tag) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {formData.tags.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Select at least one tag
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Location of the product"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Loading..."
              ) : (
                <> {isEditing ? "Save Changes" : "Create Product"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
