// components/ProductCard.tsx
"use client";

import React from "react";
import { Edit, Trash, MapPin, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/constants/product";

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={product.images[0].src}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{product.title}</CardTitle>
          <p className="font-semibold text-lg">{product.currency}{Number(product.price||0)}</p>
        </div>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          {product.address
            ? product.address.address.slice(0, 30) + "..."
            : product.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1 mt-3">
          {product.tags.map((tag) => (
            <Badge key={tag.name} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" onClick={() => onView(product)}>
          <Info className="mr-2 h-4 w-4" /> Details
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={() => onDelete(product)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
