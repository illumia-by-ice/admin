"use client";

import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/state/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa6";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //@ts-ignore
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, [token, router]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <FaSpinner size={52} className="animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="w-[18%] h-full">
        <Sidebar />
      </div>
      <div className="flex-grow bg-[#FAFBFF] h-full">{children}</div>
    </main>
  );
}
