import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = Readonly<{
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}>;

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <section className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link className="text-2xl font-semibold tracking-normal text-foreground" href="/">
            Aethel
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-normal text-foreground">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">{children}</div>
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      </section>
    </main>
  );
}
