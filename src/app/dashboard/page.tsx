import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Globe, Lock, FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [posts, totalUsers] = await Promise.all([
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    session.user.role === "admin" ? prisma.user.count() : Promise.resolve(null),
  ]);

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.length - publishedCount;

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-col gap-6 p-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {session.user.name?.split(" ")[0] ?? "User"}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s an overview of your activity.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Recent 5 posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Globe className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Visible to everyone</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <Lock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Only visible to you</p>
            </CardContent>
          </Card>

          {totalUsers !== null && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered users</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Posts</CardTitle>
            <Link href="/dashboard/posts" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No posts yet.</p>
                <Link
                  href="/dashboard/posts"
                  className="text-sm text-primary hover:underline mt-1 block"
                >
                  Write your first post
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-3 py-2 border-b last:border-0"
                  >
                    {post.published ? (
                      <Globe className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{post.title}</p>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                        post.published
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Email</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Role</p>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
                {session.user.role}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  session.user.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : session.user.status === "BANNED"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {session.user.status}
              </span>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">User ID</p>
              <p className="font-mono text-xs text-muted-foreground truncate">{session.user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
