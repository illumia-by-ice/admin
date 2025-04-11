// app/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Product, ProductFormData, initialProducts } from "@/constants/product";
import { SearchFilter } from "@/components/SearchFilter";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailDialog } from "@/components/ProductDetailsDialog";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { nanoid } from "nanoid";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import toast from "react-hot-toast";
export default function ProductMarketplace() {
  // Use client-side only initialization for dynamic state
  const [mounted, setMounted] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setMore] = useState(false);

  const fetchProperties = async () => {
    try {
      setFetching(true);
      const { data } = await api.get("/property", {
        params: {
          marketplace: true,
          type: "PRODUCT",
          limit: 100,
          page,
        },
      });
      setProducts(data?.data?.data || []);
      setMore(data.data.meta.totalPages > data.data.meta.currentPage);
    } catch (error) {
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page]);

  const handleNext = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };
  const handlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");

  // Initialize products client-side only to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter products based on search term and tag filter
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      filterTag === "" || product.tags.some((tag) => tag.name === filterTag);

    return matchesSearch && matchesTag;
  });

  // Open form for creating a new product
  const handleCreateProduct = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setIsFormOpen(true);
  };

  // Open form for editing an existing product
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  // View product details
  const handleViewProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsViewOpen(true);
  };

  // Confirm delete dialog
  const handleDeleteConfirm = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const [deleting, setDeleting] = useState(false);
  // Delete a product
  const deleteProduct = async () => {
    if (currentProduct) {
      setDeleting(true);
      try {
        await api.delete(`/admin/products/${currentProduct.uuid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.error("Deleted");
        fetchProperties();
        setIsDeleteDialogOpen(false);
      } catch (error) {
        toast.error("An error Occurred");
      } finally {
        setDeleting(false);
      }
    }
  };

  const [loading, setLoading] = useState(false);

  const token = useAuthStore((state: any) => state.token);
  // Generate a stable ID (avoiding Date.now())
  // Submit form (create or update)
  const handleSubmit = async (formData: {
    formData: FormData;
    rawData: ProductFormData;
  }) => {
    try {
      setLoading(true);
      if (isEditing && currentProduct) {
        console.log("EDITING", formData.rawData);
        console.log("EDITING", formData.formData.values());
        const response = await api.put(
          `/admin/products/${currentProduct.uuid}`,
          formData.formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Created");
        setIsFormOpen(false);
        fetchProperties();

        // Update existing product
      } else {
        const response = await api.post("/admin/products", formData.formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("Created");
        setIsFormOpen(false);
        fetchProperties();
      }
    } catch (error) {
      toast.error("An Error Occurred");
    } finally {
      setLoading(false);
    }
  };

  // Return a loading state during server-side rendering
  if (!mounted || fetching) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vendors Marketplace</h1>
            <p className="text-gray-500 mt-2">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Marketplace</h1>
          <p className="text-gray-500 mt-2">
            Browse, create, and manage products
          </p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={handleCreateProduct}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <SearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
      />

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.uuid}
                product={product}
                onView={handleViewProduct}
                onEdit={handleEditProduct}
                onDelete={handleDeleteConfirm}
              />
            ))}
          </div>
          <div className="m-8 flex gap-4 items-center">
            <Button disabled={page <= 1} onClick={handlePrev}>
              Prev
            </Button>
            <span className="font-bold">{page}</span>
            <Button disabled={!hasMore} onClick={handleNext}>
              Next
            </Button>
          </div>
        </div>
      ) : (
        <Alert className="mt-8">
          <AlertDescription>
            No products found. Try adjusting your search or filter, or add a new
            product.
          </AlertDescription>
        </Alert>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={currentProduct!}
        isLoading={loading}
        isEditing={isEditing}
      />

      {/* Product Detail Dialog */}
      <ProductDetailDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        product={currentProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteConfirm}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={currentProduct}
        deleting={deleting}
        onConfirm={deleteProduct}
      />
    </div>
  );
}
