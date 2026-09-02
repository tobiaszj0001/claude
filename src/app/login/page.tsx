import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">
            Tobiasz<span className="text-accent">CRM</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Zaloguj się, żeby kontynuować</p>
        </div>
        <Suspense fallback={<div className="h-40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
