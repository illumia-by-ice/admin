import { House2, People, Setting, UserSquare } from "iconsax-react";

const Sidebar = () => {
  return (
    <div className="w-full h-full p-6">
      <h1 className="flex items-center">
        <Setting size="32" color="#000" />
        <span className="text-2xl font-extrabold">Dashboard</span>
      </h1>
      <ul className="mt-12 flex flex-col gap-6">
        <li className="flex items-center gap-3 cursor-pointer p-3 bg-[#00B087] text-white rounded-md">
          <UserSquare size="26" color="#FFF" />
          <span className="text-lg">Users</span>
        </li>
        <li className="flex items-center gap-3 cursor-pointer p-3">
          <House2 size="26" color="#000" />
          <span className="text-lg">Properties</span>
        </li>
        <li className="flex items-center gap-3 cursor-pointer p-3">
          <People size="26" color="#000" />
          <span className="text-lg">Vendors</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
