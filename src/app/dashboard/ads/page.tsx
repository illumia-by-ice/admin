"use client";

import { AdsDataTable } from "@/components/AdsDataTable";
import { adsColumns } from "@/data/columns";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { AxiosError } from "axios";

const Page = () => {
  const createAdSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    description: yup.string().required("Description is required"),
    link: yup.string().optional(),
    image: yup.mixed().required("Image is required"),
  });

  //@ts-expect-error error
  const token = useAuthStore((state) => state.token);

  const [ads, setAds] = useState([]);

  const fetchAds = async () => {
    try {
      const res = await api.get("/ad", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setAds(res.data.data); // User data
      }
    } catch (err) {
      // const error = err as AxiosError;
      // console.error("Error fetching users:", error);
      toast.error("Error Occured While Fetching Ads");
    }
  };

  useEffect(() => {
    fetchAds(); // Fetch first page on load
  }, []);

  const deleteAd = async (id: string) => {
    try {
      const res = await api.delete(`/admin/ad/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        toast.success("Ads Deleted");
        fetchAds();
      }
    } catch (err) {
      const error = err as AxiosError;
      console.log(error);
      toast.error("An error occured while trying to delete the ad");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateAdFormInput>({
    resolver: yupResolver(createAdSchema),
    mode: "all",
  });

  const createAd = async (formData: any) => {
    try {
      const res = await api.post("/admin/ad", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        reset(); // Reset the form fields
        fetchAds(); // Refresh property list
      }
    } catch (err) {
      // console.log("Error creating property:", error);

      const error = err as AxiosError;
      console.log(error);
      //@ts-expect-error error
      throw new Error(error.response?.data.message);
    }
  };

  const onSubmit: SubmitHandler<ICreateAdFormInput> = async (data) => {
    const formData = new FormData();

    // Append text fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("link", data.link || "");
    formData.append(`image`, data.image[0]);

    toast.promise(createAd(formData), {
      loading: "Creating Ad",
      error: "Failed To Create Ad",
      success: "Ad Created Successfully",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Manage Ads</h1>
        <Sheet>
          <SheetTrigger className="text-white bg-green-600 p-3 rounded-md flex items-center gap-2">
            <FaPlus size={24} />
            <span>Create Ad</span>
          </SheetTrigger>
          <SheetContent className="overflow-auto">
            <SheetHeader>
              <SheetTitle>Create Ad</SheetTitle>
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
                  Ad Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Ad Title"
                  {...register("title")}
                />
                <p className="text-sm text-red-500">{errors.title?.message}</p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="description" className="text-xs mb-1">
                  Ad Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Ad Description"
                  {...register("description")}
                />
                <p className="text-sm text-red-500">
                  {errors.description?.message}
                </p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="link" className="text-xs mb-1">
                  Ad Link
                </label>
                <input
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Ad Link"
                  {...register("link")}
                />
                <p className="text-sm text-red-500">{errors.link?.message}</p>
              </div>
              <div className="flex flex-col mt-5">
                <label htmlFor="images" className="text-xs mb-1">
                  Select Ad Banner
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="outline-none p-3 border rounded-lg"
                  {...register("image")}
                />
                {/* @ts-ignore */}
                <p className="text-sm text-red-500">{errors.image?.message}</p>
              </div>
              <SheetFooter>
                <button
                  type="submit"
                  className="bg-green-500 text-white w-full p-3 rounded-lg mt-5 flex justify-center"
                >
                  Create Ad
                </button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mt-10">
        {/* Pass only filtered users to VendorDataTable */}
        {/* @ts-ignore */}
        <AdsDataTable columns={adsColumns} data={ads} deleteAd={deleteAd} />
      </div>
    </div>
  );
};

export default Page;
