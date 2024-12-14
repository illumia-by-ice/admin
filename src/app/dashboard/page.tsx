// import { SearchNormal } from "iconsax-react";
import { UserDataTable } from "@/components/UserDataTable";
import { users } from "@/data";
import { userColumns } from "@/data/columns";


const page = () => {
  return (
    <div className="p-8">
      <div className="">
        <h1 className="text-2xl font-semibold">Hello There👋,</h1>
        {/* <div className="bg-white flex items-center gap-2 p-3 rounded-lg">
          <SearchNormal size="26" color="#000" />
          <input type="text" name="search" id="search" placeholder="Search" className="outline-none"/>
        </div> */}
      </div>
      <div>
        <UserDataTable columns={userColumns} data={users}/>
      </div>
    </div>
  );
};

export default page;
