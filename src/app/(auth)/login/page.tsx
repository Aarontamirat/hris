import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="space-y-4">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-muted-foreground">
          Need an account? <Link href="/register" className="underline">Register</Link>
        </p>
      </div>
    </main>
  );
}
