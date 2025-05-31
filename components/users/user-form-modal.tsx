"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, CreateUserData, UpdateUserData } from "@/lib/api/users";
import { useToast } from "@/hooks/use-toast";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User; // If provided, we're editing; otherwise, we're adding
  onSubmit: (userData: CreateUserData | UpdateUserData) => any;
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSubmit,
}: UserFormModalProps) {
  const { toast } = useToast();
  const isEditing = !!user;
  const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    user_type: user?.user_type || "buyer",
    // verified: user?.verified,
    // verification_status: user?.verification_status,
    bio: user?.bio || "",
    services: user?.services || "",
    address: user?.address || "",
    city: user?.city || "",
    available: user?.available,
    subscription_id: user?.subscription_id || "",
    ...(!isEditing && { password: "" }), // Password field for new users only
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBooleanChange = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
      toast({
        title: isEditing ? "User Updated" : "User Created",
        description: isEditing
          ? "User has been successfully updated"
          : "New user has been successfully created",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || `Failed to ${isEditing ? "update" : "create"} user`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user details and preferences"
              : "Enter details to create a new user account"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={(formData as CreateUserData).password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                required={!isEditing}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="user_type">User Type</Label>
            <Select
              value={formData.user_type}
              onValueChange={(value) => handleChange("user_type", value)}
            >
              <SelectTrigger id="user_type">
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="artisan">Artisan</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="verification_status">Verification Status</Label>
              <Select 
                value={formData.verification_status || "pending"} 
                onValueChange={(value) => handleChange("verification_status", value)}
              >
                <SelectTrigger id="verification_status">
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )} */}

          {isEditing && formData.user_type == "artisan" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={formData.bio || ""}
                  onChange={(e) => handleChange("bio", e.target.value)}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update User"
                : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
