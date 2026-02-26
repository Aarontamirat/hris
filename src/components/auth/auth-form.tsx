"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data?.error?.message ?? "Authentication failed.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Sign in" : "Create account"}</h1>
      <form
        action={(formData) => {
          void onSubmit(formData);
        }}
        className="space-y-4"
      >
        {mode === "register" ? (
          <>
            <Input name="firstName" placeholder="First name" required />
            <Input name="lastName" placeholder="Last name" required />
          </>
        ) : null}
        <Input name="email" type="email" placeholder="Work email" required />
        <Input name="password" type="password" placeholder="Password" required />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </Card>
  );
}
