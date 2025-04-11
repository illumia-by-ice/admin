// components/ProductDetailDialog.tsx
"use client";

import React from "react";
import { DollarSign, MapPin, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/constants/product";

interface ProductDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailDialog: React.FC<ProductDetailDialogProps> = ({
  isOpen,
  onOpenChange,
  product,
  onEdit,
  onDelete,
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.images[0].src}
              alt={product.title}
              className="w-full rounded-lg object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold">{product.currency}{product.price}</span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{product.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Tags</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {product.tags.map((tag) => (
                  <Badge key={tag.name} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                <span>{product.address?.address}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(product);
                }}
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(product);
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
