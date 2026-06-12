import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/login" as Route);
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <section className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Authenticated
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
          Aethel
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          Authentication is ready. Product features will be added later.
        </p>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </section>
    </main>
  );
}
