// components/ProductFormDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, MapPin } from "lucide-react";
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
import { Product, ProductFormData, availableTags } from "@/constants/product";
import { Money } from "iconsax-react";

interface ProductFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: ProductFormData) => void;
  initialData?: Product;
  isEditing: boolean;
}

export const ProductFormDialog: React.FC<ProductFormDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing,
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    price: "",
    description: "",
    tags: [],
    address: "",
    images: [],
  });

  // Initialize form with product data when editing
  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        title: initialData.title,
        price: initialData.price.toString(),
        description: initialData.description,
        tags: initialData.tags.map((t) => t.name),
        address: initialData.address.address,
        images: initialData.images.map((i) => i.src),
      });
    } else {
      // Reset form when creating a new product
      setFormData({
        title: "",
        price: "",
        description: "",
        tags: [],
        address: "",
        images: [],
      });
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

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (
      !formData.title ||
      !formData.price ||
      !formData.description ||
      formData.tags.length === 0 ||
      !formData.address
    ) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
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
            {/* Product Image */}
            <div className="border rounded-lg p-4 flex justify-center items-center bg-gray-50 h-48">
              <img
                src={formData.images[0]}
                alt="Product preview"
                className="max-h-full max-w-full object-contain"
              />
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

            {/* Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Price {initialData?.currency || "NGN"} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Money color="#222" className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
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
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
