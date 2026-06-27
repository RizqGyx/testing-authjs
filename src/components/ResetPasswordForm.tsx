"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useActionState, useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/actions";
import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction, isPending] = useActionState(resetPassword, null);

  useEffect(() => {
    if (!token) redirect("/login");
  }, [token]);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    }
  }, [state, router]);

  if (!token) return null;

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6 md:p-8">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 rounded-full p-3 mb-2">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Set New Password</h1>
              <p className="text-muted-foreground text-balance text-sm">
                Choose a strong password for your account.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />

              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <FieldError>
                  {state?.error?.newPassword && (
                    <p className="text-red-500 text-xs">{state.error.newPassword[0]}</p>
                  )}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <FieldError>
                  {state?.error?.confirmPassword && (
                    <p className="text-red-500 text-xs">{state.error.confirmPassword[0]}</p>
                  )}
                </FieldError>
              </Field>

              {state?.error?.token && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {state.error.token[0]}
                </div>
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <FieldDescription className="text-center text-sm">
              <Link href="/login" className="underline underline-offset-2">
                Return to Sign In
              </Link>
            </FieldDescription>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
