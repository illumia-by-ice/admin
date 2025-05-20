import { UsersProvider } from "@/lib/contexts/users-context";

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <UsersProvider>{children}</UsersProvider>;
}
