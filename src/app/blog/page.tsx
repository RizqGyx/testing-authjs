import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Lock } from "lucide-react";

export default async function BlogPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Blog</h1>
            <p className="text-xs text-muted-foreground">{posts.length} published post{posts.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard/posts"
                  className="text-sm text-primary hover:underline"
                >
                  My Posts
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
              >
                Sign In to Write
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Post Feed */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">Be the first to publish something!</p>
            {!session?.user && (
              <Link
                href="/register"
                className="inline-block mt-4 text-sm text-primary hover:underline"
              >
                Create an account to start writing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {post.content && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {post.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {post.author.name?.[0]?.toUpperCase() ??
                            post.author.email?.[0]?.toUpperCase() ??
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {post.author.name ?? post.author.email}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer note for logged-in users with drafts */}
      {session?.user && (
        <div className="max-w-3xl mx-auto px-4 pb-8 text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            Your draft posts are only visible to you in{" "}
            <Link href="/dashboard/posts" className="underline">
              My Posts
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
