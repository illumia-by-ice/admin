"use client";

import { UserDataTable } from "@/components/UserDataTable";
import { userColumns } from "@/data/columns";
import api from "@/helpers/api";
import { useAuthStore } from "@/state/auth.store";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

const Page = () => {
  //@ts-ignore
  const token = useAuthStore((state) => state.token);

  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState(null);

  const fetchUsers = async (page = 1) => {
    try {
      const res = await api.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page, // Pass the page number for pagination
        },
      });

      if (res.data) {
        setUsers(res.data.data.data); // User data
        setMeta(res.data.data.meta); // Meta data
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch first page on load
  }, []);

  return (
    <div className="p-8">
      <div>
        <h1 className="text-2xl font-semibold">Hello There👋,</h1>
      </div>
      <div className="mt-10">
        <UserDataTable columns={userColumns} data={users} />
      </div>
      {meta && (
        <div className="mt-6 flex flex-col items-end">
          <p>
            {/* @ts-ignore */}
            Showing page {meta.currentPage} of {meta.totalPages} | Total users:{" "}
            {/* @ts-ignore */}
            {meta.totalItems}
          </p>
          <div className="flex items-center">
            <button
              className="mt-3 mr-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              //@ts-ignore
              disabled={meta.currentPage <= 1}
              //@ts-ignore
              onClick={() => fetchUsers(meta.currentPage - 1)}
            >
              Previous
            </button>
            <button
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
              //@ts-ignore
              disabled={meta.currentPage >= meta.totalPages}
              //@ts-ignore
              onClick={() => fetchUsers(meta.currentPage + 1)}
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
