"use client";

import React, { useActionState, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import { signUpCredentials } from "@/lib/actions";
import { ProviderButton } from "@/components/SocialButton";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(signUpCredentials, null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    if (state?.success) {
      setIsLoading(true);
      toast.success("Account created! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    }
  }, [state, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8 order-last" action={formAction}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-muted-foreground text-balance text-sm">
                  Get started for free today
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
                <FieldError>
                  {state?.error?.name && (
                    <p className="text-red-500 text-xs">{state.error.name[0]}</p>
                  )}
                </FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
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

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <FieldError>
                  {state?.error?.password && (
                    <p className="text-red-500 text-xs">{state.error.password[0]}</p>
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

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or sign up with
              </FieldSeparator>

              <Field className="grid grid-cols-2 gap-4">
                <ProviderButton provider="google" />
                <ProviderButton provider="github" />
              </Field>

              <FieldDescription className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline underline-offset-2">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="bg-white relative hidden md:block">
            <Image
              src="https://img.freepik.com/premium-vector/tablet-login-concept-illustration_114360-7893.jpg"
              alt="Registration illustration"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
