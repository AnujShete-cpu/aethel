import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <SignIn />
    </main>
  );
}
