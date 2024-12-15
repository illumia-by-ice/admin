"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/state/auth.store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaBars, FaSpinner } from "react-icons/fa6";
import { Menu, Setting } from "iconsax-react";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //@ts-ignore
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, [token, router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <FaSpinner size={52} className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="w-full mb-6 p-6 md:hidden fixed top-4 z-50 flex justify-between items-center">
        <h1 className="flex items-center">
          <Setting size="32" color="#000" />
          <span className="text-2xl font-extrabold ml-2">Dashboard</span>
        </h1>
        <button
          className=""
          onClick={toggleSidebar}
        >
          <FaBars size="32" color="#000" />
        </button>
      </div>
      <div
        className={`w-full md:w-1/5 h-full md:relative ${
          isSidebarOpen ? "block" : "hidden"
        } md:block`}
      >
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="flex-grow bg-[#FAFBFF] h-full mt-20 md:mt-0">{children}</div>
    </main>
  );
}
