"use client";

import { useActionState, useEffect } from "react";
import { updateProfile, changePassword } from "@/lib/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  status?: string;
};

export function ProfileForm({ user }: { user: User }) {
  const [profileState, profileAction] = useActionState(updateProfile, null);
  const [passwordState, passwordAction] = useActionState(changePassword, null);

  useEffect(() => {
    if (!profileState) return;
    if ("success" in profileState && profileState.success) {
      toast.success((profileState as { success: true; message: string }).message || "Profile updated!");
    }
  }, [profileState]);

  useEffect(() => {
    if (!passwordState) return;
    if ("success" in passwordState && passwordState.success) {
      toast.success((passwordState as { success: true; message: string }).message || "Password changed!");
    } else if ("error" in passwordState && typeof passwordState.error === "string") {
      toast.error(passwordState.error);
    }
  }, [passwordState]);

  const isOAuthUser = !user.id; // simplified check; real check would be account type

  return (
    <div className="space-y-6">
      {/* Avatar & Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border">
            <Image
              src={user.image || "https://placehold.co/600x400"}
              alt={user.name || "User"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{user.name || "No name set"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex gap-2 mt-1">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium capitalize">
                {user.role}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                user.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {user.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Name</CardTitle>
          <CardDescription>Update how your name appears across the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-3">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                placeholder="Enter your name"
                className="mt-1"
                required
              />
              {profileState?.error && typeof profileState.error === "object" && "name" in profileState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {(profileState.error as { name?: string[] }).name?.[0]}
                </p>
              )}
            </div>
            <Button type="submit" size="sm">
              Save Name
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
          <CardDescription>
            {user.image?.startsWith("https://")
              ? "Update your password. OAuth users cannot change passwords here."
              : "Update your account password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-3">
            <div>
              <label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                required
              />
              {passwordState?.error && typeof passwordState.error === "object" && "currentPassword" in passwordState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {(passwordState.error as { currentPassword?: string[] }).currentPassword?.[0]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                required
              />
              {passwordState?.error && typeof passwordState.error === "object" && "newPassword" in passwordState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {(passwordState.error as { newPassword?: string[] }).newPassword?.[0]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mt-1"
                required
              />
              {passwordState?.error && typeof passwordState.error === "object" && "confirmPassword" in passwordState.error && (
                <p className="text-xs text-red-500 mt-1">
                  {(passwordState.error as { confirmPassword?: string[] }).confirmPassword?.[0]}
                </p>
              )}
            </div>
            <Button type="submit" size="sm">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
