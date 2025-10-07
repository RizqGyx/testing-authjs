"use client";

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
import {  useRouter } from "next/navigation";
import React, { useEffect, useState  } from "react";
import { signInCredentials } from "@/lib/actions";
import { useActionState } from "react";
import { ProviderButton } from "@/components/SocialButton"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(signInCredentials, null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignInProvider = (provider: string) => {
    try {
      throw new Error("Sign in failed");
      toast.success(`Signed in with ${provider}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      return;
    }
  };

  useEffect(() => {
    if (!state) return;
  
    if (state?.success) {
      setIsLoading(true);
    setTimeout(() => {
      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }, 1500);
    } else {
      toast.error(state?.message || "Failed to login");
    }
  }, [state, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" action={formAction}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                <FieldError>
                  {state?.error?.email && (
                    <p className="text-red-500">{state?.error?.email[0]}</p>
                  )}
                </FieldError>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  required
                />
                <FieldError>
                  {state?.error?.password && (
                    <p className="text-red-500">{state?.error?.password[0]}</p>
                  )}
                </FieldError>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Sign In"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field className="grid grid-cols-2 gap-4">
                <ProviderButton provider="google"/>
                <ProviderButton provider="github"/>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <Link href="/register">Sign up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="https://img.freepik.com/premium-vector/two-factor-authentication-concept-illustration_114360-5280.jpg"
              alt="Authentication Sign In Image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
