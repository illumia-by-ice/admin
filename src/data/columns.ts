import { User } from "@/types/tables";
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
