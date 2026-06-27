import { signOutAccount } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <ShieldX className="h-16 w-16 text-red-500" />
      <div>
        <h1 className="text-2xl font-bold text-red-600">Account Suspended</h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          Your account has been suspended. Please contact support if you believe
          this is a mistake.
        </p>
      </div>
      <form action={signOutAccount}>
        <Button variant="outline" type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
