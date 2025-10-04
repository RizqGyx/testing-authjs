"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  useEffect(() => {
    if (!token) {
      redirect("/login");
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        "Your password has been reset successfully! You can now log in."
      );
      router.push("/login");
    }, 1500);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full max-w-sm mx-auto">
        <form className="p-6 md:p-8 w-full" onSubmit={handleSubmit}>
          <FieldGroup className="w-full">
            <div className="flex flex-col items-center gap-2 text-center w-full">
              <h1 className="text-2xl font-bold">Set New Password</h1>
              <p className="text-muted-foreground text-balance w-full">
                Enter your new password below.
              </p>
            </div>
            <Field className="w-full">
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full"
              />
            </Field>
            <Field className="w-full">
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
            </Field>
            <Field className="w-full">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </Field>
            <FieldDescription className="text-center w-full">
              <a href="/login" className="underline hover:no-underline">
                Return to Login
              </a>
            </FieldDescription>
          </FieldGroup>
        </form>
      </Card>
    </div>
  );
}
