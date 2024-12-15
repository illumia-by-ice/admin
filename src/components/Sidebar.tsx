"use client"

import { House2, People, Setting, UserSquare } from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {

  const pathname = usePathname()

  return (
    <div className="w-full h-full p-6">
      <h1 className="flex items-center">
        <Setting size="32" color="#000" />
        <span className="text-2xl font-extrabold">Dashboard</span>
      </h1>
      <ul className="mt-12 flex flex-col gap-6">
        <Link href={"/dashboard"}>
          <li className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${pathname === "/dashboard" ? "bg-[#00B087] text-white" : ""}`}>
            <UserSquare size="26" color={`${pathname === "/dashboard" ? "#FFF" : "#000"}`} />
            <span className="text-lg">Users</span>
          </li>
        </Link>
        <Link href={"/dashboard/properties"}>
          <li className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${pathname === "/dashboard/properties" ? "bg-[#00B087] text-white" : ""}`}>
            <House2 size="26" color={`${pathname === "/dashboard/properties" ? "#FFF" : "#000"}`} />
            <span className="text-lg">Properties</span>
          </li>
        </Link>
        <Link href={"/dashboard/vendors"}>
          <li className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${pathname === "/dashboard/vendors" ? "bg-[#00B087] text-white" : ""}`}>
            <People size="26" color={`${pathname === "/dashboard/vendors" ? "#FFF" : "#000"}`} />
            <span className="text-lg">Vendors</span>
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Sidebar;
