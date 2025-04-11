// components/SearchFilter.tsx
"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { availableTags } from "@/constants/product";

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterTag: string;
  setFilterTag: (tag: string) => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
  filterTag,
  setFilterTag,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-3 top-3"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
      {/* <Select value={filterTag} onValueChange={setFilterTag}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          {availableTags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
    </div>
  );
};
