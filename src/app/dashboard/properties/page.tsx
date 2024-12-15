"use client";

import { PropertyTableData } from "@/components/PropertyTableData";
import { propertyColumns } from "@/data/columns";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPlus } from "react-icons/fa6";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";

// Validation schema
const propertySchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  price: yup
    .string()
    .required("Price is required"),
  listingType: yup.string().required("Listing Type is required"),
  tags: yup.string().required("Tags are required"),
  images: yup.mixed().required("Images are required"),
});

const Page = () => {

    //@ts-ignore
  const token = useAuthStore((state) => state.token);

  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState(null);

  const fetchProperties = async (page = 1) => {
    try {
      const res = await api.get("/property", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page },
      });

      if (res.data) {
        setProperties(res.data.data.data);
        setMeta(res.data.data.meta);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreatePropertyFormInput>({
    resolver: yupResolver(propertySchema),
    mode: "all"
  });

  const onSubmit: SubmitHandler<ICreatePropertyFormInput> = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("listingType", data.listingType);
    formData.append("tags", data.tags)
    //@ts-ignore
    Array.from(data.images).forEach((file) => formData.append("images", file));

    try {
      const res = await api.post("/property", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        alert("Property created successfully!");
        reset(); // Reset the form fields
        fetchProperties(); // Refresh property list
      }
    } catch (err) {
      // console.log("Error creating property:", error);
      const error = err as AxiosError
      console.log(error)
      alert("Failed to create property. Please try again.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Properties</h1>
        <Dialog>
          <DialogTrigger className="text-white bg-green-600 p-3 rounded-md flex items-center gap-2">
            <FaPlus size={24} />
            <span>Add Property</span>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Add Property</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
              <div className="flex flex-col">
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Title"
                  {...register("title")}
                />
                <p className="text-sm text-red-500">{errors.title?.message}</p>
              </div>
              <div className="flex flex-col mt-2">
                <textarea
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Description"
                  {...register("description")}
                />
                <p className="text-sm text-red-500">
                  {errors.description?.message}
                </p>
              </div>
              <div className="flex flex-col mt-2">
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Price"
                  {...register("price")}
                />
                <p className="text-sm text-red-500">{errors.price?.message}</p>
              </div>
              <div className="flex flex-col mt-2">
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Listing Type"
                  {...register("listingType")}
                />
                <p className="text-sm text-red-500">
                  {errors.listingType?.message}
                </p>
              </div>
              <div className="flex flex-col mt-2">
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Tags (comma-separated)"
                  {...register("tags")}
                />
                <p className="text-sm text-red-500">{errors.tags?.message}</p>
              </div>
              <div className="flex flex-col mt-2">
                <input
                  type="file"
                  multiple
                  className="outline-none p-3 border rounded-lg"
                  {...register("images")}
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white text-xl w-full p-4 rounded-lg mt-3"
              >
                Create Property
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-10">
        <PropertyTableData columns={propertyColumns} data={properties} />
      </div>
      {meta && (
        <div className="mt-6 flex flex-col items-end">
          <p>
            {/* @ts-ignore */}
            Showing page {meta.currentPage} of {meta.totalPages} | Total properties:{" "}
            {/* @ts-ignore */}
            {meta.totalItems}
          </p>
          <div className="flex items-center">
            <button
              className="mt-3 mr-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              // @ts-ignore
              disabled={meta.currentPage <= 1}
              // @ts-ignore
              onClick={() => fetchProperties(meta.currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              // @ts-ignore
              disabled={meta.currentPage >= meta.totalPages}
              // @ts-ignore
              onClick={() => fetchProperties(meta.currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
