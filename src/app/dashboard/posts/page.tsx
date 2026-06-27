import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PostManager } from "@/components/PostManager";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function PostsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const publishedCount = posts.filter((p) => p.published).length;

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
              <BreadcrumbPage>My Posts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Posts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total &mdash;{" "}
            {publishedCount} published, {posts.length - publishedCount} draft
            {posts.length - publishedCount !== 1 ? "s" : ""}
          </p>
        </div>
        <PostManager initialPosts={posts} />
      </div>
    </>
  );
}
