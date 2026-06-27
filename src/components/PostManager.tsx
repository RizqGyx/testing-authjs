"use client";

import { useState, useTransition, useActionState, useRef } from "react";
import { createPost, updatePost, deletePost, togglePublish } from "@/lib/post-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Globe,
  Lock,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  FileText,
  Eye,
} from "lucide-react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Filter = "all" | "published" | "draft";

export function PostManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [filter, setFilter] = useState<Filter>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isPending, startTransition] = useTransition();
  const createFormRef = useRef<HTMLFormElement>(null);

  /* ---- Create ---- */
  const [, createAction] = useActionState(
    async (_prev: unknown, data: FormData) => {
      const result = await createPost(_prev, data);
      if (result.success) {
        const title = data.get("title") as string;
        const content = data.get("content") as string;
        setPosts((prev) => [
          {
            id: crypto.randomUUID(),
            title,
            content: content || null,
            published: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          ...prev,
        ]);
        createFormRef.current?.reset();
        setShowCreateForm(false);
        toast.success("Post created as draft!");
      } else {
        toast.error("Failed to create post");
      }
      return result;
    },
    null
  );

  /* ---- Update ---- */
  const [, updateAction] = useActionState(
    async (_prev: unknown, data: FormData) => {
      if (!editingPost) return;
      const result = await updatePost(editingPost.id, _prev, data);
      if (result.success) {
        const title = data.get("title") as string;
        const content = data.get("content") as string;
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPost.id
              ? { ...p, title, content: content || null, updatedAt: new Date() }
              : p
          )
        );
        setEditingPost(null);
        toast.success("Post updated!");
      } else {
        toast.error("Failed to update post");
      }
      return result;
    },
    null
  );

  /* ---- Delete ---- */
  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      const result = await deletePost(id);
      if (!result.success) {
        setPosts(initialPosts);
        toast.error("Failed to delete post");
      } else {
        toast.success("Post deleted");
      }
    });
  };

  /* ---- Toggle Publish ---- */
  const handleTogglePublish = (post: Post) => {
    startTransition(async () => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: !p.published } : p
        )
      );
      const result = await togglePublish(post.id);
      if (!result.success) {
        setPosts(initialPosts);
        toast.error("Failed to update post");
      } else {
        toast.success(result.published ? "Post published!" : "Post moved to drafts");
      }
    });
  };

  const filtered = posts.filter((p) => {
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    return true;
  });

  const publishedCount = posts.filter((p) => p.published).length;

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {(["all", "published", "draft"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
              {f === "published" && publishedCount > 0 && (
                <span className="ml-1.5 text-xs bg-green-100 text-green-700 rounded-full px-1.5 py-0.5">
                  {publishedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          onClick={() => {
            setShowCreateForm((v) => !v);
            setEditingPost(null);
          }}
          variant={showCreateForm ? "outline" : "default"}
        >
          {showCreateForm ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> New Post
            </>
          )}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={createFormRef} action={createAction} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  placeholder="Your post title..."
                  required
                  maxLength={255}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Content{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  name="content"
                  placeholder="Write your post content here..."
                  maxLength={10000}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingPost && (
        <Card className="border-orange-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  defaultValue={editingPost.title}
                  required
                  maxLength={255}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  defaultValue={editingPost.content ?? ""}
                  maxLength={10000}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPost(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Post List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border rounded-xl">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {filter === "all"
              ? "No posts yet. Create your first post!"
              : `No ${filter} posts.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <Card
              key={post.id}
              className={`transition-opacity ${editingPost?.id === post.id ? "ring-2 ring-orange-300" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Status Badge */}
                  <div className="mt-0.5 shrink-0">
                    {post.published ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                        <Globe className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
                        <Lock className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug">{post.title}</p>
                    {post.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(post.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {post.published && (
                      <Link href={`/blog/${post.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View post">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      disabled={isPending}
                      onClick={() => handleTogglePublish(post)}
                      title={post.published ? "Unpublish" : "Publish"}
                    >
                      {post.published ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditingPost(post);
                        setShowCreateForm(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      title="Edit post"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:text-red-500"
                      disabled={isPending}
                      onClick={() => handleDelete(post.id, post.title)}
                      title="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {publishedCount} published · {posts.length - publishedCount} draft
        </p>
      )}
    </div>
  );
}
