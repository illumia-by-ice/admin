"use client";

import { PropertyTableData } from "@/components/PropertyTableData";
import { propertyColumns } from "@/data/columns";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FaPlus } from "react-icons/fa6";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

// Validation schema
const propertySchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  price: yup.string().required("Price is required"),
  bedrooms: yup.string().optional(),
  bathrooms: yup.string().optional(),
  yearBuilt: yup.string().optional(),
  squareFeet: yup.string().optional(),
  address: yup.string().optional(),
  // statues: yup.string().optional(),
  listingType: yup.string().required("Listing Type is required"),
  tags: yup.string().required("Tags are required"),
  images: yup.mixed().required("Images are required"),
  videoTour: yup.string().optional(),
});

const Page = () => {
  //@ts-expect-error error
  const token = useAuthStore((state) => state.token);

  const [properties, setProperties] = useState([]);
  const [meta, setMeta] = useState(null);
  // const [createPropertyLoading, setCreatePropertyLoading] = useState(false);

  const fetchProperties = async (page = 1) => {
    try {
      const res = await api.get("/property", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page },
      });

      console.log(res);

      if (res.data) {
        setProperties(res.data.data.data);
        setMeta(res.data.data.meta);
      }
    } catch (error) {
      // console.error("Error fetching properties:", error);
    }
  };

  const createProperty = async (formData: any) => {
    try {
      const res = await api.post("/property", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        reset(); // Reset the form fields
        window.location.reload();
        // fetchProperties(); // Refresh property list
      }
    } catch (err) {
      // console.log("Error creating property:", error);

      const error = err as AxiosError;
      // console.log(error)
      //@ts-expect-error error
      throw new Error(error.response?.data.message);
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
    mode: "all",
  });

  const onSubmit: SubmitHandler<ICreatePropertyFormInput> = async (data) => {
    // console.log(Array.from(data.images));

    // setCreatePropertyLoading(true);
    const formData = new FormData();

    // const tagsArray = data.tags.split(",").map((tag) => tag.trim());
    // const images = []

    // Append text fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("type", "PROPERTY");
    formData.append("bedrooms", data.bedrooms || "");
    formData.append("bathrooms", data.bathrooms || "");
    formData.append("yearBuilt", data.yearBuilt || "");
    formData.append("squareFeet", data.squareFeet || "");
    formData.append("address", data.address || "");
    // formData.append("status", data.status || "");
    formData.append("listingType", data.listingType.toLowerCase());
    // console.log(data.listingType)
    // formData.append("images", data.images)
    //@ts-ignore
    // formData.append("tags", tagsArray);

    formData.append("videoTour", data?.videoTour);

    Array.from(data.images).forEach((image) => {
      //@ts-ignore
      formData.append(`images`, image);
    });

    toast.promise(createProperty(formData), {
      loading: "Creating Property",
      error: "Failed To Create Property",
      success: "Property Created Successfully",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Properties</h1>
        <Sheet>
          <SheetTrigger className="text-white bg-green-600 p-3 rounded-md flex items-center gap-2">
            <FaPlus size={24} />
            <span>Add Property</span>
          </SheetTrigger>
          <SheetContent className="overflow-auto">
            <SheetHeader>
              <SheetTitle>Add Property</SheetTitle>
              <SheetDescription>
                Fill in the fields below. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
              className="mt-5"
            >
              <div className="flex flex-col">
                <label htmlFor="title" className="text-xs mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Title"
                  {...register("title")}
                />
                <p className="text-sm text-red-500">{errors.title?.message}</p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="description" className="text-xs mb-1">
                  Property Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Description"
                  {...register("description")}
                />
                <p className="text-sm text-red-500">
                  {errors.description?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="price" className="text-xs mb-1">
                  Property Price<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Price"
                  {...register("price")}
                />
                <p className="text-sm text-red-500">{errors.price?.message}</p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="bedrooms" className="text-xs mb-1">
                  No of Bedrooms
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter No of bedrooms"
                  {...register("bedrooms")}
                />
                <p className="text-sm text-red-500">
                  {errors.bedrooms?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="bathrooms" className="text-xs mb-1">
                  No of Bathrooms
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter No of bathrooms"
                  {...register("bathrooms")}
                />
                <p className="text-sm text-red-500">
                  {errors.bathrooms?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="yearBuilt" className="text-xs mb-1">
                  Year Built
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Year Built"
                  {...register("yearBuilt")}
                />
                <p className="text-sm text-red-500">
                  {errors.yearBuilt?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="squareFeet" className="text-xs mb-1">
                  Square Feet
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Square Feet of property"
                  {...register("squareFeet")}
                />
                <p className="text-sm text-red-500">
                  {errors.squareFeet?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="address" className="text-xs mb-1">
                  Address
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Address"
                  {...register("address")}
                />
                <p className="text-sm text-red-500">
                  {errors.address?.message}
                </p>
              </div>
              {/* <div className="flex flex-col mt-5">
                <label htmlFor="status" className="text-xs mb-1">
                  Status
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter property status"
                  {...register("status")}
                />
                <p className="text-sm text-red-500">
                  {errors.squareFeet?.message}
                </p>
              </div> */}
              <div className="flex flex-col mt-5">
                <label htmlFor="listingType" className="text-xs mb-1">
                  Listing Type<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Rent"
                      className="outline-none border rounded-lg"
                      {...register("listingType")}
                    />
                    <span>Rent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Sale"
                      className="outline-none border rounded-lg"
                      {...register("listingType")}
                    />
                    <span>Sale</span>
                  </label>
                </div>
                <p className="text-sm text-red-500">
                  {errors.listingType?.message}
                </p>
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="price" className="text-xs mb-1">
                  Tags(Seperate Multiple Tags With A Comma)
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Tags (comma-separated)"
                  {...register("tags", {
                    validate: (value) =>
                      value.split(",").filter((tag) => tag.trim() !== "")
                        .length > 0 || "At least one valid tag is required",
                  })}
                />
                <p className="text-sm text-red-500">{errors.tags?.message}</p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="videoTour" className="text-xs mb-1">
                  Property Video Tour
                </label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch/asin289"
                  className="outline-none p-3 border rounded-lg"
                  {...register("videoTour")}
                />
                <p className="text-sm text-red-500">
                  {errors.videoTour?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="images" className="text-xs mb-1">
                  Select Property Pictures
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="outline-none p-3 border rounded-lg"
                  {...register("images")}
                />
                {/* @ts-ignore */}
                <p className="text-sm text-red-500">{errors.images?.message}</p>
              </div>
              <SheetFooter>
                <button
                  type="submit"
                  className="bg-green-500 text-white w-full p-3 rounded-lg mt-5 flex justify-center"
                >
                  Create Property
                </button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mt-10">
        <PropertyTableData columns={propertyColumns} data={properties} />
      </div>
      {meta && (
        <div className="mt-6 flex flex-col items-end">
          <p>
            {/* @ts-expect-error error */}
            Showing page {meta.currentPage} of {meta.totalPages} | Total
            properties: {/* @ts-expect-error error */}
            {meta.totalItems}
          </p>
          <div className="flex items-center">
            <button
              className="mt-3 mr-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              //@ts-expect-error error
              disabled={meta.currentPage <= 1}
              //@ts-expect-error error
              onClick={() => fetchProperties(meta.currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              //@ts-expect-error error
              disabled={meta.currentPage >= meta.totalPages}
              //@ts-expect-error error
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
