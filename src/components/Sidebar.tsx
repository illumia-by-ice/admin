"use client";

import { useState } from "react";
import {
  House2,
  People,
  Setting,
  UserSquare,
  Menu,
  DeviceMessage,
  SmsEdit,
  Logout,
} from "iconsax-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars } from "react-icons/fa6";
import { useAuthStore } from "@/state/auth.store";
import { Users2 } from "lucide-react";

//@ts-ignore
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();

  //@ts-expect-error error
  const updateToken = useAuthStore((state) => state.updateToken);

  const logout = () => {
    updateToken(null);
    window.location.replace("/login");
  };

  return (
    <div
      className={`w-full h-full p-6 bg-white fixed lg:static ${
        isOpen ? "left-0" : "-left-full"
      } transition-all duration-300 z-50 flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h1 className="flex items-center">
            <Setting size="32" color="#000" />
            <span className="text-2xl font-extrabold ml-2">Dashboard</span>
          </h1>
          <button onClick={toggleSidebar}>
            <FaBars size="32" color="#000" />
          </button>
        </div>
        <h1 className="hidden lg:flex items-center">
          <Setting size="32" color="#000" />
          <span className="text-2xl font-extrabold ml-2">Dashboard</span>
        </h1>
        <ul className="mt-12 flex flex-col gap-6">
          <Link href={"/dashboard"}>
            <li
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${
                pathname === "/dashboard" ? "bg-[#00B087] text-white" : ""
              }`}
            >
              <UserSquare
                size="26"
                color={`${pathname === "/dashboard" ? "#FFF" : "#000"}`}
              />
              <span className="text-lg">Users</span>
            </li>
          </Link>
          <Link href={"/dashboard/properties"}>
            <li
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${
                pathname === "/dashboard/properties"
                  ? "bg-[#00B087] text-white"
                  : ""
              }`}
            >
              <House2
                size="26"
                color={`${
                  pathname === "/dashboard/properties" ? "#FFF" : "#000"
                }`}
              />
              <span className="text-lg">Properties</span>
            </li>
          </Link>
          <Link href={"/dashboard/vendors"}>
            <li
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${
                pathname === "/dashboard/vendors"
                  ? "bg-[#00B087] text-white"
                  : ""
              }`}
            >
              <Users2
                size="26"
                color={`${
                  pathname === "/dashboard/vendors" ? "#FFF" : "#000"
                }`}
              />
              <span className="text-lg">Vendor</span>
            </li>
          </Link>
          <Link href={"/dashboard/ads"}>
            <li
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${
                pathname === "/dashboard/ads" ? "bg-[#00B087] text-white" : ""
              }`}
            >
              <DeviceMessage
                size="26"
                color={`${pathname === "/dashboard/ads" ? "#FFF" : "#000"}`}
              />
              <span className="text-lg">Ads</span>
            </li>
          </Link>
          <Link href={"/dashboard/messaging"}>
            <li
              className={`flex items-center gap-3 cursor-pointer p-3 rounded-md ${
                pathname === "/dashboard/messaging"
                  ? "bg-[#00B087] text-white"
                  : ""
              }`}
            >
              <SmsEdit
                size="26"
                color={`${
                  pathname === "/dashboard/messaging" ? "#FFF" : "#000"
                }`}
              />
              <span className="text-lg">Messaging</span>
            </li>
          </Link>
        </ul>
      </div>
      <button className="flex items-center gap-2 text-[#ff0000]" onClick={() => logout()}>
        <Logout size="32" color="#ff0000" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
