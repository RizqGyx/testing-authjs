import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Globe, Lock, Pencil } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!post) notFound();

  // Draft posts are only visible to the author
  const isOwner = session?.user?.id === post.authorId;
  if (!post.published && !isOwner) notFound();

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-3">
            {!post.published && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                <Lock className="h-3 w-3" /> Draft
              </span>
            )}
            {isOwner && (
              <Link
                href="/dashboard/posts"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit in Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Article */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Status */}
        {post.published ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium mb-4">
            <Globe className="h-3 w-3" /> Published
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-700 px-2 py-0.5 text-xs font-medium mb-4">
            <Lock className="h-3 w-3" /> Draft — only visible to you
          </span>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold leading-tight mb-4">{post.title}</h1>

        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b">
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.author.image ?? undefined} />
            <AvatarFallback className="text-sm">
              {post.author.name?.[0]?.toUpperCase() ??
                post.author.email?.[0]?.toUpperCase() ??
                "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {post.author.name ?? post.author.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {post.updatedAt > post.createdAt && (
                <span>
                  {" "}
                  · Updated{" "}
                  {new Date(post.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Content */}
        {post.content ? (
          <div className="prose prose-sm max-w-none text-foreground">
            {post.content.split("\n").map((line, i) =>
              line.trim() === "" ? (
                <br key={i} />
              ) : (
                <p key={i} className="mb-4 leading-relaxed">
                  {line}
                </p>
              )
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic">No content yet.</p>
        )}
      </main>
    </div>
  );
}
