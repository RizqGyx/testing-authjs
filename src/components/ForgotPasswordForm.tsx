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
import React from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("@")) {
        toast.success(
          `Password reset link sent to ${email}. Please check your inbox.`
        );
      } else {
        toast.error("Invalid email format.");
      }
    }, 1500);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <Card className="w-full max-w-sm mx-auto">
        <form className="p-6 md:p-8 w-full" onSubmit={handleSubmit}>
          <FieldGroup className="w-full">
            <div className="flex flex-col items-center gap-2 text-center w-full">
              <h1 className="text-2xl font-bold">Forgot Password?</h1>
              <p className="text-muted-foreground text-balance w-full">
                Enter your email address to receive a reset link.
              </p>
            </div>
            <Field className="w-full">
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </Field>
            <Field className="w-full">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending Link..." : "Send Reset Link"}
              </Button>
            </Field>
            <FieldDescription className="text-center w-full">
              Remember your password?{" "}
              <a href="/login" className="underline hover:no-underline">
                Login
              </a>
            </FieldDescription>
          </FieldGroup>
        </form>
      </Card>
    </div>
  );
}
