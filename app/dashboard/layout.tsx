import type React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { DashboardProvider } from "@/lib/contexts/dashboard-context"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardProvider>
  )
}
