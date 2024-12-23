"use client";

import { AdsDataTable } from "@/components/AdsDataTable";
import { adsColumns } from "@/data/columns";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

const Page = () => {
  //@ts-expect-error error
  const token = useAuthStore((state) => state.token);

  const [ads, setAds] = useState([]);

  const fetchAds = async () => {
    try {
      const res = await api.get("/ad", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (res.data) {
        setAds(res.data.data); // User data
      }
    } catch (err) {
      const error = err as AxiosError;
      // console.error("Error fetching users:", error);
    }
  };


  useEffect(() => {
    fetchAds(); // Fetch first page on load
  }, []);


  return (
    <div className="p-8">
      <div>
        <h1 className="text-2xl font-semibold">Hello There👋,</h1>
      </div>
      <div className="mt-10">
        {/* Pass only filtered users to VendorDataTable */}
        <AdsDataTable columns={adsColumns} data={ads} />
      </div>
    </div>
  );
};

export default Page;
