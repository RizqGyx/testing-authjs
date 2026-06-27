import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/admin-actions";
import { AdminUserTable } from "@/components/AdminUserTable";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ShieldCheck } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/dashboard");

  const users = await getAllUsers();

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Admin Panel</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage users, roles, and account statuses.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Admins</p>
            <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Banned</p>
            <p className="text-2xl font-bold text-red-600">
              {users.filter((u) => u.status === "BANNED").length}
            </p>
          </div>
        </div>

        <AdminUserTable users={users} currentUserId={session.user.id} />
      </div>
    </>
  );
}
