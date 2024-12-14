import Sidebar from "@/components/Sidebar";

export default function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-screen overflow-hidden">
        <div className="w-[18%] h-full">
            <Sidebar />
        </div>
        <div className="w-[82%] bg-[#FAFBFF] h-full">{children}</div>
    </main>
  );
}
