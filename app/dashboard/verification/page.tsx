"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { VerificationProvider, useVerification } from "@/lib/contexts/users-context"

// Mock data for verification requests
const mockVerificationRequests = [
  {
    id: "1",
    user_id: "101",
    user_name: "John Doe",
    user_email: "john.doe@example.com",
    user_type: "agent",
    status: "pending",
    submitted_at: "2023-05-10T10:00:00Z",
    documents: [
      { id: "d1", type: "id_card", name: "National ID Card", url: "/placeholder.svg?height=600&width=800" },
      { id: "d2", type: "profile_photo", name: "Profile Photo", url: "/placeholder.svg?height=400&width=400" },
      { id: "d3", type: "cac", name: "CAC Document", url: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "2",
    user_id: "102",
    user_name: "Jane Smith",
    user_email: "jane.smith@example.com",
    user_type: "vendor",
    status: "approved",
    submitted_at: "2023-06-15T14:30:00Z",
    approved_at: "2023-06-16T09:45:00Z",
    documents: [
      { id: "d4", type: "id_card", name: "Driver's License", url: "/placeholder.svg?height=600&width=800" },
      { id: "d5", type: "profile_photo", name: "Profile Photo", url: "/placeholder.svg?height=400&width=400" },
      { id: "d6", type: "cac", name: "CAC Document", url: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "3",
    user_id: "103",
    user_name: "Michael Brown",
    user_email: "michael.brown@example.com",
    user_type: "artisan",
    status: "rejected",
    submitted_at: "2023-07-20T09:15:00Z",
    rejected_at: "2023-07-21T11:30:00Z",
    rejection_reason: "Documents unclear or expired",
    documents: [
      { id: "d7", type: "id_card", name: "Voter's Card", url: "/placeholder.svg?height=600&width=800" },
      { id: "d8", type: "profile_photo", name: "Profile Photo", url: "/placeholder.svg?height=400&width=400" },
    ],
  },
  {
    id: "4",
    user_id: "104",
    user_name: "Sarah Johnson",
    user_email: "sarah.johnson@example.com",
    user_type: "agent",
    status: "pending",
    submitted_at: "2023-08-05T16:45:00Z",
    documents: [
      { id: "d9", type: "id_card", name: "International Passport", url: "/placeholder.svg?height=600&width=800" },
      { id: "d10", type: "profile_photo", name: "Profile Photo", url: "/placeholder.svg?height=400&width=400" },
      { id: "d11", type: "cac", name: "CAC Document", url: "/placeholder.svg?height=600&width=800" },
    ],
  },
  {
    id: "5",
    user_id: "105",
    user_name: "David Wilson",
    user_email: "david.wilson@example.com",
    user_type: "vendor",
    status: "approved",
    submitted_at: "2023-09-12T11:20:00Z",
    approved_at: "2023-09-13T14:10:00Z",
    documents: [
      { id: "d12", type: "id_card", name: "National ID Card", url: "/placeholder.svg?height=600&width=800" },
      { id: "d13", type: "profile_photo", name: "Profile Photo", url: "/placeholder.svg?height=400&width=400" },
      { id: "d14", type: "cac", name: "CAC Document", url: "/placeholder.svg?height=600&width=800" },
    ],
  },
]

function VerificationPageContent() {
  const {
    verificationData,
    isVerificationLoading,
    isVerificationError,
    verificationError,
    verificationPage,
    verificationLimit,
    verificationStatusFilter,
    verificationUserTypeFilter,
    verificationSearch,
    setVerificationPage,
    setVerificationLimit,
    setVerificationStatusFilter,
    setVerificationUserTypeFilter,
    setVerificationSearch,
    refetchVerification,
    handleUpdateUserVerification,
  } = useVerification()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [openRejectDialog, setOpenRejectDialog] = useState(false)
  const { toast } = useToast()

  const handleApproveVerification = async (userId: string) => {
    await handleUpdateUserVerification(userId, { status: "verified" })
    refetchVerification()
    toast({
      title: "Verification Approved",
      description: "User has been successfully verified",
    })
  }

  const handleRejectVerification = async (userId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      })
      return
    }
    await handleUpdateUserVerification(userId, { status: "rejected", adminNotes: rejectionReason })
    refetchVerification()
    setOpenRejectDialog(false)
    setRejectionReason("")
    toast({
      title: "Verification Rejected",
      description: "Verification request has been rejected",
      variant: "destructive",
    })
  }

  const filteredRequests = (verificationData?.data || []).filter((request) => {
    const matchesSearch =
      (request.first_name + " " + request.last_name).toLowerCase().includes(verificationSearch.toLowerCase()) ||
      request.email.toLowerCase().includes(verificationSearch.toLowerCase())

    const matchesStatus = verificationStatusFilter === "" || request.verification_status === verificationStatusFilter

    const matchesUserType = verificationUserTypeFilter === "" || request.user_type === verificationUserTypeFilter

    return matchesSearch && matchesStatus && matchesUserType
  })

  const pendingRequests = filteredRequests.filter((request) => request.verification_status === "pending")
  const approvedRequests = filteredRequests.filter((request) => request.verification_status === "verified")
  const rejectedRequests = filteredRequests.filter((request) => request.verification_status === "rejected")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Verification</h1>
        <p className="text-muted-foreground">Manage and process user verification requests</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>Review and process user document verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={verificationSearch}
                  onChange={(e) => { setVerificationSearch(e.target.value); setVerificationPage(1) }}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-[180px]">
                  <Select value={verificationUserTypeFilter} onValueChange={(v) => { setVerificationUserTypeFilter(v); setVerificationPage(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="artisan">Artisan</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[180px]">
                  <Select value={verificationStatusFilter} onValueChange={(v) => { setVerificationStatusFilter(v); setVerificationPage(1) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="icon" onClick={refetchVerification}>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending" className="flex gap-2">
                  <Clock className="h-4 w-4" />
                  Pending
                  <Badge variant="secondary" className="ml-1">
                    {pendingRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="verified" className="flex gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Verified
                  <Badge variant="secondary" className="ml-1">
                    {approvedRequests.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected
                  <Badge variant="secondary" className="ml-1">
                    {rejectedRequests.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {["pending", "verified", "rejected"].map((status) => (
                <TabsContent key={status} value={status} className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Submitted</TableHead>
                          {status === "verified" && <TableHead>Verified</TableHead>}
                          {status === "rejected" && (
                            <>
                              <TableHead>Rejected</TableHead>
                              <TableHead>Reason</TableHead>
                            </>
                          )}
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.filter((req) => req.verification_status === status).length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={status === "pending" ? 4 : status === "approved" ? 5 : 6}
                              className="h-24 text-center"
                            >
                              No {status} verification requests found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRequests
                            .filter((request) => request.verification_status === status)
                            .map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={request.first_name + ' ' + request.last_name} />
                                      <AvatarFallback>{request.first_name.charAt(0)}{request.last_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{request.first_name} {request.last_name}</div>
                                      <div className="text-sm text-muted-foreground">{request.email}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">{request.user_type.charAt(0).toUpperCase() + request.user_type.slice(1)}</Badge>
                                </TableCell>
                                {/* <TableCell>{formatDate(request.submitted_at)}</TableCell>
                                {status === "approved" && (
                                  <TableCell>{formatDate(request.approved_at || "")}</TableCell>
                                )} */}
                                {/* {status === "rejected" && (
                                  <>
                                    <TableCell>{formatDate(request.rejected_at || "")}</TableCell>
                                    <TableCell>
                                      <span className="line-clamp-1">{request.rejection_reason}</span>
                                    </TableCell>
                                  </>
                                )} */}
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          View
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-4xl">
                                        <DialogHeader>
                                          <DialogTitle>Verification Documents</DialogTitle>
                                          <DialogDescription>
                                            Review the submitted documents for {selectedRequest?.first_name} {selectedRequest?.last_name}
                                          </DialogDescription>
                                        </DialogHeader>
                                        {selectedRequest && (
                                          <div className="grid gap-6">
                                            <div className="flex items-center gap-4">
                                              <Avatar className="h-16 w-16">
                                                <AvatarImage src={`/placeholder.svg?height=64&width=64`} alt={selectedRequest.first_name + ' ' + selectedRequest.last_name} />
                                                <AvatarFallback className="text-lg">{selectedRequest.first_name.charAt(0)}{selectedRequest.last_name.charAt(0)}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <h3 className="text-lg font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</h3>
                                                <p className="text-muted-foreground">{selectedRequest.email}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                  <Badge variant="outline">{selectedRequest.user_type.charAt(0).toUpperCase() + selectedRequest.user_type.slice(1)}</Badge>
                                                  <Badge variant="outline">{selectedRequest.verification_status.charAt(0).toUpperCase() + selectedRequest.verification_status.slice(1)}</Badge>
                                                </div>
                                              </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                              {selectedRequest.verification.ninDocs.map((doc:any) => (
                                                <div key={doc.id} className="overflow-hidden rounded-lg border">
                                                  <div className="aspect-video w-full overflow-hidden bg-muted">
                                                    <img src={doc.src} alt={doc.name} className="h-full w-full object-cover" />
                                                  </div>
                                                  <div className="p-3">
                                                    <h4 className="font-medium">{doc.name}</h4>
                                                    <p className="text-sm text-muted-foreground">NIN Document</p>
                                                  </div>
                                                </div>
                                              ))}
                                              {selectedRequest.verification.cacDocs.map((doc:any) => (
                                                <div key={doc.id} className="overflow-hidden rounded-lg border">
                                                  <div className="aspect-video w-full overflow-hidden bg-muted">
                                                    <img src={doc.src} alt={doc.name} className="h-full w-full object-cover" />
                                                  </div>
                                                  <div className="p-3">
                                                    <h4 className="font-medium">{doc.name}</h4>
                                                    <p className="text-sm text-muted-foreground">CAC Document</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            {selectedRequest.verification_status === "rejected" && (
                                              <div className="rounded-md border p-4">
                                                <h4 className="font-medium">Admin Notes:</h4>
                                                <p className="mt-1 text-muted-foreground">{selectedRequest.verification.note}</p>
                                              </div>
                                            )}

                                            {selectedRequest.verification_status === "pending" && (
                                              <DialogFooter>
                                                <Button variant="outline" onClick={() => setOpenRejectDialog(true)}>
                                                  <XCircle className="mr-2 h-4 w-4" />
                                                  Reject
                                                </Button>
                                                <Button onClick={() => handleApproveVerification(selectedRequest.id)}>
                                                  <CheckCircle className="mr-2 h-4 w-4" />
                                                  Approve
                                                </Button>
                                              </DialogFooter>
                                            )}
                                          </div>
                                        )}
                                      </DialogContent>
                                    </Dialog>

                                    {status === "pending" && (
                                      <>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => handleApproveVerification(request.id)}
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Approve
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedRequest(request)
                                            setOpenRejectDialog(true)
                                          }}
                                        >
                                          <XCircle className="mr-2 h-4 w-4" />
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </div>
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

            {/* Pagination Controls */}
            {verificationData?.meta && verificationData.meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((verificationData.meta.page - 1) * verificationData.meta.limit) + 1} to {Math.min(verificationData.meta.page * verificationData.meta.limit, verificationData.meta.total)} of {verificationData.meta.total} requests
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVerificationPage(Math.max(1, verificationPage - 1))}
                    disabled={verificationPage === 1 || isVerificationLoading}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, verificationData.meta.totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={verificationPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setVerificationPage(page)}
                          disabled={isVerificationLoading}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    {verificationData.meta.totalPages > 5 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant={verificationPage === verificationData.meta.totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setVerificationPage(verificationData.meta.totalPages)}
                          disabled={isVerificationLoading}
                        >
                          {verificationData.meta.totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVerificationPage(Math.min(verificationData.meta.totalPages, verificationPage + 1))}
                    disabled={verificationPage === verificationData.meta.totalPages || isVerificationLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this verification request.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Rejection Reason
              </label>
              <Input
                id="reason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenRejectDialog(false)
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  handleRejectVerification(selectedRequest.id)
                }
              }}
            >
              Reject Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function VerificationPage() {
  return (
    <VerificationProvider>
      <VerificationPageContent />
    </VerificationProvider>
  )
}
