import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizationUsers,
  useSuspendUser,
  useTerminateUser,
  useReactivateUser,
  useUpdateUserRole
} from "@/hooks/use-org-admin-data";
import { OrgAdminNav } from "@/components/org-admin/OrgAdminNav";
import {
  Users,
  Search,
  MoreHorizontal,
  UserX,
  UserCheck,
  Ban,
  ArrowLeft,
  Mail,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function OrgAdminUsers() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [terminateReason, setTerminateReason] = useState("");

  // Fetch users with filters
  const { data: usersData, isLoading } = useOrganizationUsers({
    role: roleFilter !== "all" ? roleFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: search || undefined
  });

  const users = usersData?.users || [];

  // Mutations
  const suspendMutation = useSuspendUser();
  const terminateMutation = useTerminateUser();
  const reactivateMutation = useReactivateUser();
  const updateRoleMutation = useUpdateUserRole();

  // Redirect if not org admin
  if (user?.role !== 'org_admin' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access user management.
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for suspension.",
        variant: "destructive"
      });
      return;
    }

    try {
      await suspendMutation.mutateAsync({
        userId: selectedUser.id,
        reason: suspendReason
      });

      toast({
        title: "User Suspended",
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been suspended.`
      });

      setSuspendDialogOpen(false);
      setSuspendReason("");
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Suspension Failed",
        description: error.message || "Failed to suspend user.",
        variant: "destructive"
      });
    }
  };

  const handleTerminate = async () => {
    if (!selectedUser || !terminateReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for termination.",
        variant: "destructive"
      });
      return;
    }

    try {
      await terminateMutation.mutateAsync({
        userId: selectedUser.id,
        reason: terminateReason
      });

      toast({
        title: "User Terminated",
        description: `${selectedUser.firstName} ${selectedUser.lastName}'s account has been terminated.`
      });

      setTerminateDialogOpen(false);
      setTerminateReason("");
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Termination Failed",
        description: error.message || "Failed to terminate user.",
        variant: "destructive"
      });
    }
  };

  const handleReactivate = async () => {
    if (!selectedUser) return;

    try {
      await reactivateMutation.mutateAsync({
        userId: selectedUser.id
      });

      toast({
        title: "User Reactivated",
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been reactivated.`
      });

      setReactivateDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Reactivation Failed",
        description: error.message || "Failed to reactivate user.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-600">Suspended</Badge>;
      case "terminated":
        return <Badge className="bg-red-600">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "student":
        return <Badge variant="outline">Student</Badge>;
      case "supervisor":
        return <Badge variant="outline" className="border-blue-600 text-blue-600">Supervisor</Badge>;
      case "org_admin":
        return <Badge variant="outline" className="border-purple-600 text-purple-600">Org Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">P³ Pharmacy Academy</h1>
              <span className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                Organization Admin
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.firstName || 'Admin'} {user?.lastName || ''}
              </span>
              <button
                onClick={async () => {
                  const { logout } = await import('@/lib/auth-logout');
                  await logout();
                }}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-navigation */}
      <OrgAdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">
            Manage users in your organization
          </p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Users ({users.length})</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u: any) => (
                    <TableRow key={u.id} className="cursor-pointer" onClick={() => {
                      setSelectedUser(u);
                      setUserDetailsOpen(true);
                    }}>
                      <TableCell className="font-medium">
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(u.role)}</TableCell>
                      <TableCell>{getStatusBadge(u.accountStatus)}</TableCell>
                      <TableCell>
                        {u.lastLoginAt ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(u.lastLoginAt), { addSuffix: true })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Never</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(u);
                              setUserDetailsOpen(true);
                            }}>
                              View Details
                            </DropdownMenuItem>
                            {u.accountStatus === "active" && (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(u);
                                  setSuspendDialogOpen(true);
                                }}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(u);
                                  setTerminateDialogOpen(true);
                                }} className="text-red-600">
                                  <UserX className="h-4 w-4 mr-2" />
                                  Terminate
                                </DropdownMenuItem>
                              </>
                            )}
                            {(u.accountStatus === "suspended" || u.accountStatus === "terminated") && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedUser(u);
                                setReactivateDialogOpen(true);
                              }} className="text-green-600">
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.firstName} {selectedUser?.lastName}
              </DialogTitle>
              <DialogDescription>
                User details and activity
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="mt-1">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Role</Label>
                      <p className="mt-1">{getRoleBadge(selectedUser.role)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <p className="mt-1">{getStatusBadge(selectedUser.accountStatus)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Last Login</Label>
                      <p className="mt-1">
                        {selectedUser.lastLoginAt ? (
                          formatDistanceToNow(new Date(selectedUser.lastLoginAt), { addSuffix: true })
                        ) : (
                          "Never"
                        )}
                      </p>
                    </div>
                    {selectedUser.institution && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Institution</Label>
                        <p className="mt-1">{selectedUser.institution}</p>
                      </div>
                    )}
                    {selectedUser.suspendedAt && (
                      <>
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-gray-500">Suspension Reason</Label>
                          <p className="mt-1 text-yellow-600">{selectedUser.suspensionReason}</p>
                        </div>
                      </>
                    )}
                    {selectedUser.terminatedAt && (
                      <>
                        <div className="col-span-2">
                          <Label className="text-sm font-medium text-gray-500">Termination Reason</Label>
                          <p className="mt-1 text-red-600">{selectedUser.terminationReason}</p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity">
                  <div className="text-center py-8 text-gray-500">
                    Activity history not yet implemented
                  </div>
                </TabsContent>

                <TabsContent value="actions" className="space-y-4">
                  {selectedUser.accountStatus === "active" && (
                    <>
                      <Button
                        onClick={() => {
                          setUserDetailsOpen(false);
                          setSuspendDialogOpen(true);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend User
                      </Button>
                      <Button
                        onClick={() => {
                          setUserDetailsOpen(false);
                          setTerminateDialogOpen(true);
                        }}
                        variant="destructive"
                        className="w-full"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Terminate User
                      </Button>
                    </>
                  )}
                  {(selectedUser.accountStatus === "suspended" || selectedUser.accountStatus === "terminated") && (
                    <Button
                      onClick={() => {
                        setUserDetailsOpen(false);
                        setReactivateDialogOpen(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reactivate User
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Suspend User Dialog */}
        <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend User</AlertDialogTitle>
              <AlertDialogDescription>
                This will immediately suspend {selectedUser?.firstName} {selectedUser?.lastName}'s account
                and log them out. They will not be able to login until reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="suspend-reason">Reason for suspension (required)</Label>
              <Textarea
                id="suspend-reason"
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setSuspendReason("");
                setSelectedUser(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSuspend}
                disabled={!suspendReason.trim() || suspendMutation.isPending}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {suspendMutation.isPending ? "Suspending..." : "Suspend User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Terminate User Dialog */}
        <AlertDialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Terminate User</AlertDialogTitle>
              <AlertDialogDescription>
                This will terminate {selectedUser?.firstName} {selectedUser?.lastName}'s account.
                They will not be able to login. Account data will be preserved for reactivation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="terminate-reason">Reason for termination (required)</Label>
              <Textarea
                id="terminate-reason"
                placeholder="Enter reason for termination..."
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setTerminateReason("");
                setSelectedUser(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleTerminate}
                disabled={!terminateReason.trim() || terminateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {terminateMutation.isPending ? "Terminating..." : "Terminate User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reactivate User Dialog */}
        <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reactivate User</AlertDialogTitle>
              <AlertDialogDescription>
                This will reactivate {selectedUser?.firstName} {selectedUser?.lastName}'s account.
                They will be able to login again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReactivate}
                disabled={reactivateMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {reactivateMutation.isPending ? "Reactivating..." : "Reactivate User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
