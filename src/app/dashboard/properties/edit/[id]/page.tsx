"use client";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "@/helpers/api";
import { useParams } from "next/navigation";
import { Property } from "@/types/tables";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa6";
import { useAuthStore } from "@/state/auth.store";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState<Property>(null!);
  const [fetching, setFetching] = useState(true);

  // Validation schema using Yup
  const validationSchema = Yup.object({
    title: Yup.string().required("Property title is required"),
    description: Yup.string().required("Property description is required"),
    price: Yup.number()
      .typeError("Price must be a number")
      .positive("Price must be positive")
      .required("Property price is required"),
    bedrooms: Yup.number()
      .typeError("Bedrooms must be a number")
      .integer("Bedrooms must be a whole number")
      .min(0, "Bedrooms cannot be negative"),
    bathrooms: Yup.number()
      .typeError("Bathrooms must be a number")
      .min(0, "Bathrooms cannot be negative"),
    yearBuilt: Yup.number()
      .typeError("Year built must be a number")
      .integer("Year built must be a whole number")
      .min(1800, "Year built must be after 1800")
      .max(new Date().getFullYear(), "Year built cannot be in the future"),
    squareFeet: Yup.number().typeError("Square feet must be a number"),
    address: Yup.string(),
    listingType: Yup.string().required("Listing type is required"),
  });
  const token = useAuthStore((state: any) => state.token);
  // Initialize form with Formik
  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      price: "",
      bedrooms: "",
      propertyId: id || "",
      bathrooms: "",
      yearBuilt: "",
      squareFeet: "",
      address: "",
      listingType: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.put("/admin/property", values, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status == 200) {
          toast.success("Property Updated");
          return window.location.assign("/dashboard/properties");
        }
        setSuccess(false);
        return toast.error("Failed to update Property");

        setSuccess(true);
        // Optionally redirect or show success message
      } catch (err: any) {
        setError(
          err?.message || "An error occurred while updating the property"
        );
        return toast.error("Failed to update Property");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const fetchData = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/property/${id}`);
      const pro = response.data.data as Property;

      formik.setFieldValue("title", pro?.title);
      formik.setFieldValue("description", pro?.description);
      formik.setFieldValue("price", pro?.price);
      formik.setFieldValue("bedrooms", pro?.specifications?.bedrooms);
      formik.setFieldValue("bathrooms", pro?.specifications?.bathrooms);
      formik.setFieldValue("yearBuilt", pro?.specifications?.yearBuilt);
      formik.setFieldValue("squareFeet", pro?.specifications?.squareFeet);
      formik.setFieldValue("address", pro?.address?.address);
      formik.setFieldValue("listingType", pro?.listingType);
      formik.setFieldValue("propertyId", id);
      setData(pro);
    } catch (error) {
      toast("An Error Occurred while retrieving data");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  if (fetching) {
    return (
      <div className="h-screen flex justify-center items-center">
        <FaSpinner size={50} className="animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="p-8">
        <div className="">
          <h1 className="text-2xl font-semibold">Edit Properties</h1>

          <div className="">
            <form
              encType="multipart/form-data"
              className="mt-5"
              onSubmit={formik.handleSubmit}
            >
              <div className="flex flex-col">
                <label htmlFor="title" className="text-xs mb-1">
                  Property Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Title"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-sm text-red-500">{formik.errors.title}</p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="description" className="text-xs mb-1">
                  Property Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Description"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-sm text-red-500">
                    {formik.errors.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="price" className="text-xs mb-1">
                  Property Price<span className="text-red-500">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Property Price"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.price}
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="text-sm text-red-500">{formik.errors.price}</p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="bedrooms" className="text-xs mb-1">
                  No of Bedrooms
                </label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter No of bedrooms"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.bedrooms}
                />
                {formik.touched.bedrooms && formik.errors.bedrooms && (
                  <p className="text-sm text-red-500">
                    {formik.errors.bedrooms}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="bathrooms" className="text-xs mb-1">
                  No of Bathrooms
                </label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter No of bathrooms"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.bathrooms}
                />
                {formik.touched.bathrooms && formik.errors.bathrooms && (
                  <p className="text-sm text-red-500">
                    {formik.errors.bathrooms}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="yearBuilt" className="text-xs mb-1">
                  Year Built
                </label>
                <input
                  id="yearBuilt"
                  name="yearBuilt"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Year Built"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.yearBuilt}
                />
                {formik.touched.yearBuilt && formik.errors.yearBuilt && (
                  <p className="text-sm text-red-500">
                    {formik.errors.yearBuilt}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="squareFeet" className="text-xs mb-1">
                  Square Feet
                </label>
                <input
                  id="squareFeet"
                  name="squareFeet"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Square Feet of property"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.squareFeet}
                />
                {formik.touched.squareFeet && formik.errors.squareFeet && (
                  <p className="text-sm text-red-500">
                    {formik.errors.squareFeet}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="address" className="text-xs mb-1">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="outline-none p-3 border rounded-lg"
                  placeholder="Enter Address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-sm text-red-500">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              <div className="flex flex-col mt-5">
                <label htmlFor="listingType" className="text-xs mb-1">
                  Listing Type<span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      id="listingType"
                      name="listingType"
                      type="radio"
                      value="Rent"
                      className="outline-none border rounded-lg"
                      onChange={formik.handleChange}
                      checked={
                        formik.values.listingType?.toLowerCase() === "rent"
                      }
                    />
                    <span>Rent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      id="listingType"
                      name="listingType"
                      type="radio"
                      value="Sale"
                      className="outline-none border rounded-lg"
                      onChange={formik.handleChange}
                      checked={
                        formik.values.listingType?.toLowerCase() === "sale"
                      }
                    />
                    <span>Sale</span>
                  </label>
                </div>
                {formik.touched.listingType && formik.errors.listingType && (
                  <p className="text-sm text-red-500">
                    {formik.errors.listingType}
                  </p>
                )}
              </div>

              {/* <div className="flex flex-col mt-5">
                <label htmlFor="videoTour" className="text-xs mb-1">
                  Property Video Tour
                </label>
                <input
                  id="videoTour"
                  name="videoTour"
                  type="text"
                  placeholder="https://youtube.com/watch/asin289"
                  className="outline-none p-3 border rounded-lg"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.videoTour}
                />
                {formik.touched.videoTour && formik.errors.videoTour && (
                  <p className="text-sm text-red-500">
                    {formik.errors.videoTour}
                  </p>
                )}
              </div> */}

              <button
                type="submit"
                className={`${
                  isLoading ? "bg-green-300" : "bg-green-500"
                } text-white w-full p-3 rounded-lg mt-5 flex justify-center`}
                disabled={isLoading || fetching || !formik.isValid}
              >
                {isLoading ? "Updating..." : "Edit Property"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
