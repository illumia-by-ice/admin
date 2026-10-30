"use client";

import { useState, type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Home,
  ShoppingBag,
  FileText,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ImageIcon,
  CheckSquare,
  FileCheck,
  CircleIcon as AdCircle,
  Moon,
  Sun,
  Search,
  Gift,
  Newspaper,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { isAuthenticated, logoutAdmin } from "@/lib/api/auth";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  title: string;
  isActive: boolean;
}

function NavItem({ href, icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      {title}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();

  // Check authentication on component mount
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    // Use the logout function from our auth API
    logoutAdmin();

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });

    router.push("/login");
  };

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      title: "Dashboard",
    },
    {
      href: "/dashboard/users",
      icon: <Users className="h-4 w-4" />,
      title: "Users",
    },
    {
      href: "/dashboard/properties",
      icon: <Home className="h-4 w-4" />,
      title: "Properties",
    },
    {
      href: "/dashboard/products",
      icon: <ShoppingBag className="h-4 w-4" />,
      title: "Products",
    },
    // { href: "/dashboard/files", icon: <ImageIcon className="h-4 w-4" />, title: "Files" },
    // { href: "/dashboard/reviews", icon: <FileText className="h-4 w-4" />, title: "Reviews" },
    // { href: "/dashboard/notifications", icon: <Bell className="h-4 w-4" />, title: "Notifications" },
    // { href: "/dashboard/transactions", icon: <CreditCard className="h-4 w-4" />, title: "Transactions" },
    { href: "/dashboard/verification", icon: <FileCheck className="h-4 w-4" />, title: "Verification" },
    {
      href: "/dashboard/ads",
      icon: <AdCircle className="h-4 w-4" />,
      title: "Ads",
    },
    {
      href: "/dashboard/blog",
      icon: <Newspaper className="h-4 w-4" />,
      title: "Blog",
    },
    {
      href: "/dashboard/referrals",
      icon: <Gift className="h-4 w-4" />,
      title: "Refer and Earn",
    },
    // { href: "/dashboard/settings", icon: <Settings className="h-4 w-4" />, title: "Settings" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 pr-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-2">
                <CheckSquare className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Admin Panel</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="px-2 flex-1 py-2">
                {/* <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search..." className="pl-8 bg-muted/50" />
                </div> */}
              </div>
              <nav className="grid gap-1 px-2">
                {navItems.map((item, index) => (
                  <NavItem
                    key={index}
                    href={item.href}
                    icon={item.icon}
                    title={item.title}
                    isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))}
                  />
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold hidden md:flex">
            Admin Panel
          </span>
        </div>
        {/* <div className="relative hidden md:flex flex-1 max-w-md mx-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search..." className="pl-8 bg-muted/50" />
        </div> */}
        <div className="flex justify-between flex-1 w-full items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>
                <Link href="/dashboard/profile" className="flex w-full items-center">
                  Profile
                </Link>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem>
                <Link href="/dashboard/settings" className="flex w-full items-center">
                  Settings
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r md:flex bg-background">
          <nav className="grid gap-1 p-4">
            {navItems.map((item, index) => (
              <NavItem
                key={index}
                href={item.href}
                icon={item.icon}
                title={item.title}
                isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))}
              />
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
