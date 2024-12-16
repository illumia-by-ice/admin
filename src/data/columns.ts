import { Property, User } from "@/types/tables";
import { ColumnDef } from "@tanstack/react-table";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    accessorKey: "type",
    header: "User Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    //@ts-ignore
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
];


export const propertyColumns: ColumnDef<Property>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ getValue }) => `₦${Number(getValue()).toLocaleString()}`,
  },
  {
    accessorKey: "listingType",
    header: "Listing Type",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "hasLegalDocuments",
    header: "Legal Docs",
    cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) => {
      const value = getValue();
      //@ts-ignore
      return value ? new Date(value).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ getValue }) => {
      const value = getValue();
      //@ts-ignore
      return value ? new Date(value).toLocaleDateString() : "N/A";
    },
  },
  {
    accessorKey: "address.address",
    header: "Address",
    cell: ({ getValue }) => {
      const value = getValue();

      return value === "undefined" ?  "N/A" : value  
    }
  },
];
