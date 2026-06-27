"use client";

import { useState, useTransition } from "react";
import { updateUserRole, updateUserStatus } from "@/lib/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ShieldCheck, ShieldX, CheckCircle, Ban, Loader2 } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  status: string;
  createdAt: Date;
  _count: { posts: number };
};

export function AdminUserTable({
  users: initialUsers,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleToggle = (user: User) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setLoadingId(user.id);
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole as "user" | "admin");
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        toast.success(`${user.name ?? user.email} is now ${newRole}`);
      } else {
        toast.error(result.error ?? "Failed to update role");
      }
      setLoadingId(null);
    });
  };

  const handleStatusToggle = (user: User) => {
    const newStatus = user.status === "BANNED" ? "ACTIVE" : "BANNED";
    setLoadingId(user.id);
    startTransition(async () => {
      const result = await updateUserStatus(user.id, newStatus as "ACTIVE" | "BANNED");
      if (result.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
        toast.success(
          newStatus === "BANNED"
            ? `${user.name ?? user.email} has been banned`
            : `${user.name ?? user.email} has been unbanned`
        );
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
      setLoadingId(null);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">All Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Posts</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isLoading = loadingId === user.id && isPending;
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium leading-tight">
                            {user.name ?? "—"}
                            {isSelf && (
                              <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {user.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : user.status === "BANNED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user._count.posts}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf || isLoading}
                          onClick={() => handleRoleToggle(user)}
                          className="h-7 text-xs gap-1"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : user.role === "admin" ? (
                            <ShieldX className="h-3 w-3" />
                          ) : (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </Button>
                        <Button
                          variant={user.status === "BANNED" ? "outline" : "destructive"}
                          size="sm"
                          disabled={isSelf || isLoading}
                          onClick={() => handleStatusToggle(user)}
                          className="h-7 text-xs gap-1"
                        >
                          {isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : user.status === "BANNED" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Ban className="h-3 w-3" />
                          )}
                          {user.status === "BANNED" ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
