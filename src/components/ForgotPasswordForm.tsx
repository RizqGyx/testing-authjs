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
import { forgotPassword } from "@/lib/actions";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast.success("Check your email for a reset link.");
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6 md:p-8">
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary/10 rounded-full p-3 mb-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">Forgot Password?</h1>
              <p className="text-muted-foreground text-balance text-sm">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {state?.success ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700 text-center space-y-2">
                <p className="font-medium">Reset link sent!</p>
                <p className="text-xs">
                  If an account with that email exists, you&apos;ll receive a
                  password reset link shortly.
                </p>
                {/* Show reset URL in demo mode (no email provider) */}
                {state.resetUrl && (
                  <div className="mt-3 p-2 bg-white border border-green-300 rounded text-xs font-mono text-left break-all">
                    <p className="text-muted-foreground mb-1">Demo — reset link:</p>
                    <Link
                      href={state.resetUrl}
                      className="text-primary hover:underline"
                    >
                      {state.resetUrl}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <form action={formAction} className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                  <FieldError>
                    {state?.error?.email && (
                      <p className="text-red-500 text-xs">{state.error.email[0]}</p>
                    )}
                  </FieldError>
                </Field>
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            )}

            <FieldDescription className="text-center text-sm">
              Remember your password?{" "}
              <Link href="/login" className="underline underline-offset-2">
                Sign in
              </Link>
            </FieldDescription>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
