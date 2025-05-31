"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Home,
  ShoppingBag,
  FileText,
  Bell,
  CreditCard,
  TrendingUp,
  FileCheck,
  CircleIcon as AdCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDashboard } from "@/lib/contexts/dashboard-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  User, 
  Verification, 
  Transaction, 
  Advertisement 
} from "@/lib/api/dashboard"

export default function DashboardPage() {
  const { dashboardData, isLoading, isError, error, refetch } = useDashboard();

  // If there's an error, show an error message
  if (isError && error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your system</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Alert>
      </div>
    )
  }

  // Use API data or fallback values
  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "Loading..." : dashboardData?.counts.users.toString() || "0",
      change: "+12.5%",
      trend: "up",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      description: "Total registered users",
    },
    {
      title: "Properties",
      value: isLoading ? "Loading..." : dashboardData?.counts.properties.toString() || "0",
      change: "+8.3%",
      trend: "up",
      icon: <Home className="h-5 w-5 text-muted-foreground" />,
      description: "Listed properties",
    },
    {
      title: "Products",
      value: isLoading ? "Loading..." : dashboardData?.counts.products.toString() || "0",
      change: "+5.7%",
      trend: "up",
      icon: <ShoppingBag className="h-5 w-5 text-muted-foreground" />,
      description: "Listed products",
    },
    {
      title: "Reviews",
      value: isLoading ? "Loading..." : dashboardData?.counts.reviews.toString() || "0",
      change: "-2.1%",
      trend: "down",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
      description: "User reviews",
    },
    {
      title: "Notifications",
      value: "156", // This data doesn't seem to be in the API response
      change: "+18.2%",
      trend: "up",
      icon: <Bell className="h-5 w-5 text-muted-foreground" />,
      description: "Pending notifications",
    },
    {
      title: "Transactions",
      value: isLoading ? "Loading..." : dashboardData?.counts.transactions.toString() || "0",
      change: "+7.4%",
      trend: "up",
      icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
      description: "Total transactions",
    },
    {
      title: "Pending Verifications",
      value: isLoading ? "Loading..." : dashboardData?.counts.pendingVerifications.toString() || "0",
      change: "-5.3%",
      trend: "down",
      icon: <FileCheck className="h-5 w-5 text-muted-foreground" />,
      description: "Users awaiting verification",
    },
    {
      title: "Active Ads",
      value: isLoading ? "Loading..." : dashboardData?.counts.advertisements.toString() || "0",
      change: "+22.8%",
      trend: "up",
      icon: <AdCircle className="h-5 w-5 text-muted-foreground" />,
      description: "Currently running ads",
    },
  ];

  // Generate activity items from API data once loaded
  const recentActivities = !isLoading && dashboardData ? [
    ...dashboardData.recentUsers.map((user: User) => ({
      id: `user-${user.id}`,
      type: "user_registered",
      title: "New user registered",
      description: `${user.name} registered as a ${user.role}`,
      time: new Date(user.created_at).toLocaleString(),
    })),
    ...dashboardData.recentVerifications.map((verification: Verification) => ({
      id: `verification-${verification.id}`,
      type: "verification_approved",
      title: `User verification ${verification.status}`,
      description: `${verification.user?.name}'s documents have been ${verification.status}`,
      time: new Date(verification.created_at).toLocaleString(),
    })),
    ...dashboardData.recentTransactions.map((transaction: Transaction) => ({
      id: `transaction-${transaction.id}`,
      type: "transaction_completed",
      title: `${transaction.status === 'completed' ? 'Payment received' : 'Payment ' + transaction.status}`,
      // description: `${transaction.user.name} - ${transaction.amount} ${transaction.currency} for ${transaction.type}`,
      time: new Date(transaction.created_at).toLocaleString(),
    })),
    ...dashboardData.recentAds.map((ad: Advertisement) => ({
      id: `ad-${ad.id}`,
      type: "ad_created",
      title: `Ad campaign ${ad.status}`,
      description: `${ad.title} - ${ad.impressions} impressions, ${ad.clicks} clicks`,
      time: new Date(ad.created_at).toLocaleString(),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6) : [
    // Placeholder items while loading
    {
      id: 1,
      type: "user_registered",
      title: "Loading...",
      description: "Loading recent activities...",
      time: "Loading...",
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of the system</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="overview" className="text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-sm">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.slice(0, 4).map((stat, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div
                      className={`flex items-center text-xs font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.slice(4).map((stat, i) => (
              <Card key={i} className="overflow-hidden border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div
                      className={`flex items-center text-xs font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-none shadow-md">
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest activities across the platform</CardDescription>
                  </div>
                  {/* <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/notifications">View All</Link>
                  </Button> */}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          activity.type === "user_registered"
                            ? "bg-blue-500"
                            : activity.type === "property_listed"
                              ? "bg-green-500"
                              : activity.type === "review_submitted"
                                ? "bg-purple-500"
                                : activity.type === "verification_approved"
                                  ? "bg-amber-500"
                                  : activity.type === "transaction_completed"
                                    ? "bg-emerald-500"
                                    : "bg-rose-500"
                        }`}
                      ></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        {/* <p className="text-sm text-muted-foreground">{activity.description}</p> */}
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3 border-none shadow-md">
              <CardHeader className="bg-muted/30">
                <CardTitle>Performance</CardTitle>
                <CardDescription>Platform growth metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">User Growth</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">+12.5%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: "75%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "loading": `${dashboardData?.counts.users || 0}`} total users
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Property Listings</span>
                    </div>
                    <span className="text-sm font-medium text-blue-500">+8.3%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: "65%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : `${dashboardData?.counts.properties || 0}`} total listings
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Verification Rate</span>
                    </div>
                    <span className="text-sm font-medium text-purple-500">+5.7%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: "45%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? "Loading..." : `${dashboardData?.counts.pendingVerifications || 0}`} pending
                  </p>
                </div>

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics will be displayed here</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-muted-foreground">Analytics charts will be displayed here</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-muted/30">
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generated reports will be displayed here</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-muted-foreground">Reports will be displayed here</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Download Reports
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
