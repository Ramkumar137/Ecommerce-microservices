import { useEffect, useMemo, useState } from "react";
import { Search, Users as UsersIcon, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/common/SkeletonLoaders";
import { EmptyState } from "@/components/common/EmptyState";
import { userService } from "@/services/user.service";
import type { User } from "@/types/auth";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsersAdmin();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("[Admin Users Fetch Error]", err);
      const status = err?.response?.status;
      if (status === 403) {
        setError("Admin authorization required to view users.");
      } else {
        setError(err?.response?.data?.message || err?.message || "Failed to load system users.");
      }
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const role = String(u.role || "").toUpperCase();
      if (roleFilter !== "ALL" && role !== roleFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const username = String(u.username || "").toLowerCase();
      const userId = String(u.user_id || "").toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        username.includes(q) ||
        userId.includes(q)
      );
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all registered system customer and administrator accounts.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Role:</span>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
          <ShieldAlert className="mx-auto h-8 w-8 text-destructive mb-2" />
          <p className="font-semibold text-base mb-1">{error}</p>
          <p className="text-sm opacity-90 mb-4">Ensure your account has Administrator permissions.</p>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <TableSkeleton rows={6} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users found"
          description={searchQuery ? "No user accounts match your search filters." : "No registered users in the database yet."}
          action={
            searchQuery ? (
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setRoleFilter("ALL"); }}>
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const isUserAdmin = String(user.role || "").toUpperCase() === "ADMIN" || String(user.role || "").toUpperCase() === "ADMINISTRATOR";
                return (
                  <TableRow
                    key={user.user_id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {user.user_id}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={isUserAdmin ? "default" : "secondary"}>
                        {isUserAdmin ? "ADMIN" : "CUSTOMER"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* User Details Slide-over Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="sm:max-w-md">
          {selectedUser && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="text-xl">User Profile</SheetTitle>
                <SheetDescription>Detailed information for account {selectedUser.user_id}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/40 border">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg">
                    {(selectedUser.first_name?.[0] || "U").toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-base">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">User ID</p>
                    <p className="font-mono text-xs mt-0.5">{selectedUser.user_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Role</p>
                    <Badge variant={String(selectedUser.role).toUpperCase().includes("ADMIN") ? "default" : "secondary"} className="mt-0.5">
                      {String(selectedUser.role).toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium font-medium">Username</p>
                    <p className="mt-0.5">{selectedUser.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Phone</p>
                    <p className="mt-0.5">{selectedUser.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Status</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-emerald-6-0 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Account
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Joined Date</p>
                    <p className="mt-0.5">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
