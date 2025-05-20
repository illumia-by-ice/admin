"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Filter,
  Eye,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  AlertTriangle,
  Home,
  ShoppingBag,
  Download,
  DollarSign,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for transactions
const mockTransactions = [
  {
    id: "1",
    reference: "TRX-12345",
    amount: 250000,
    currency: "NGN",
    type: "payment",
    status: "successful",
    payment_method: "card",
    card_last4: "4242",
    property_id: "prop1",
    property_title: "Luxury 3-Bedroom Apartment",
    user_id: "user1",
    user_name: "Jane Smith",
    user_email: "jane.smith@example.com",
    created_at: "2023-05-10T10:00:00Z",
    description: "Rent payment for Luxury 3-Bedroom Apartment",
  },
  {
    id: "2",
    reference: "TRX-23456",
    amount: 5000,
    currency: "NGN",
    type: "payment",
    status: "successful",
    payment_method: "bank_transfer",
    property_id: null,
    property_title: null,
    product_id: "prod1",
    product_title: "Professional Plumbing Services",
    user_id: "user2",
    user_name: "John Doe",
    user_email: "john.doe@example.com",
    created_at: "2023-06-15T14:30:00Z",
    description: "Payment for plumbing services",
  },
  {
    id: "3",
    reference: "TRX-34567",
    amount: 150000000,
    currency: "NGN",
    type: "payment",
    status: "failed",
    payment_method: "card",
    card_last4: "1234",
    property_id: "prop2",
    property_title: "5-Bedroom Detached Duplex",
    user_id: "user3",
    user_name: "Michael Brown",
    user_email: "michael.brown@example.com",
    created_at: "2023-07-20T09:15:00Z",
    description: "Property purchase payment",
    failure_reason: "Insufficient funds",
  },
  {
    id: "4",
    reference: "TRX-45678",
    amount: 25000,
    currency: "NGN",
    type: "payment",
    status: "pending",
    payment_method: "bank_transfer",
    property_id: null,
    property_title: null,
    product_id: "prod2",
    product_title: "Interior Design Consultation",
    user_id: "user4",
    user_name: "Sarah Johnson",
    user_email: "sarah.johnson@example.com",
    created_at: "2023-08-05T16:45:00Z",
    description: "Payment for interior design consultation",
  },
  {
    id: "5",
    reference: "TRX-56789",
    amount: 15000,
    currency: "NGN",
    type: "refund",
    status: "successful",
    payment_method: "card",
    card_last4: "5678",
    property_id: null,
    property_title: null,
    product_id: "prod3",
    product_title: "Smart Home Security System",
    user_id: "user5",
    user_name: "David Wilson",
    user_email: "david.wilson@example.com",
    created_at: "2023-09-12T11:20:00Z",
    description: "Refund for cancelled order",
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return currency === "NGN" ? `₦${amount.toLocaleString()}` : `$${amount.toLocaleString()}`
  }

  const handleExportTransactions = () => {
    toast({
      title: "Transactions Exported",
      description: "The transactions have been exported successfully",
    })
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.property_title && transaction.property_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.product_title && transaction.product_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  const totalAmount = transactions
    .filter((t) => t.status === "successful" && t.type === "payment")
    .reduce((acc, t) => acc + t.amount, 0)

  const totalRefunds = transactions
    .filter((t) => t.status === "successful" && t.type === "refund")
    .reduce((acc, t) => acc + t.amount, 0)

  const successfulTransactions = filteredTransactions.filter((t) => t.status === "successful")
  const pendingTransactions = filteredTransactions.filter((t) => t.status === "pending")
  const failedTransactions = filteredTransactions.filter((t) => t.status === "failed")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">View and manage payment transactions</p>
        </div>
        <Button onClick={handleExportTransactions}>
          <Download className="mr-2 h-4 w-4" />
          Export Transactions
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{formatCurrency(totalAmount, "NGN")}</div>
            <p className="text-xs text-muted-foreground">From successful payments</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{formatCurrency(totalRefunds, "NGN")}</div>
            <p className="text-xs text-muted-foreground">From successful refunds</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {Math.round((transactions.filter((t) => t.status === "successful").length / transactions.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Transaction success rate</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">All transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="successful">Successful</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-2">
                    {filteredTransactions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="successful">
                  Successful
                  <Badge variant="secondary" className="ml-2">
                    {successfulTransactions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending
                  <Badge variant="secondary" className="ml-2">
                    {pendingTransactions.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="failed">
                  Failed
                  <Badge variant="secondary" className="ml-2">
                    {failedTransactions.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {["all", "successful", "pending", "failed"].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(status === "all"
                          ? filteredTransactions
                          : filteredTransactions.filter((t) => t.status === status)
                        ).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center">
                              No {status === "all" ? "" : status} transactions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          (status === "all"
                            ? filteredTransactions
                            : filteredTransactions.filter((t) => t.status === status)
                          ).map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">{transaction.reference}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={`/placeholder.svg?height=32&width=32`}
                                      alt={transaction.user_name}
                                    />
                                    <AvatarFallback>
                                      {transaction.user_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{transaction.user_name}</div>
                                    <div className="text-xs text-muted-foreground">{transaction.user_email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {transaction.type === "payment" ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <ArrowDownLeft className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className={transaction.type === "refund" ? "text-red-500" : "text-green-500"}>
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    transaction.type === "payment"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }
                                >
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    transaction.status === "successful"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : transaction.status === "pending"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }
                                >
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatDate(transaction.created_at)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(transaction.created_at)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                                  <span className="capitalize">{transaction.payment_method.replace("_", " ")}</span>
                                  {transaction.card_last4 && (
                                    <span className="text-xs text-muted-foreground">**** {transaction.card_last4}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedTransaction(transaction)
                                        setIsViewDialogOpen(true)
                                      }}
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download receipt
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTransaction && (
            <>
              <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>Reference: {selectedTransaction.reference}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedTransaction.type === "payment" ? "Payment" : "Refund"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedTransaction.created_at)} at {formatTime(selectedTransaction.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      selectedTransaction.status === "successful"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : selectedTransaction.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }
                  >
                    {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </Badge>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-xl font-bold">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/placeholder.svg?height=32&width=32`} alt={selectedTransaction.user_name} />
                        <AvatarFallback>
                          {selectedTransaction.user_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTransaction.user_name}</p>
                        <p className="text-xs text-muted-foreground">{selectedTransaction.user_email}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="capitalize">{selectedTransaction.payment_method.replace("_", " ")}</p>
                        {selectedTransaction.card_last4 && (
                          <p className="text-xs text-muted-foreground">
                            **** **** **** {selectedTransaction.card_last4}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{selectedTransaction.description}</p>
                </div>

                {(selectedTransaction.property_title || selectedTransaction.product_title) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Related To</h3>
                    <div className="mt-2 flex items-center gap-3 rounded-md border p-3">
                      {selectedTransaction.property_title ? (
                        <>
                          <Home className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedTransaction.property_title}</p>
                            <p className="text-sm text-muted-foreground">Property</p>
                          </div>
                        </>
                      ) : selectedTransaction.product_title ? (
                        <>
                          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{selectedTransaction.product_title}</p>
                            <p className="text-sm text-muted-foreground">Product/Service</p>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                {selectedTransaction.status === "failed" && selectedTransaction.failure_reason && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <h3 className="font-medium text-red-600 dark:text-red-400">Failure Reason</h3>
                    </div>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{selectedTransaction.failure_reason}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
