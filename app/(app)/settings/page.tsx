import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Manage your account and preferences.
      </p>
      <p className="mt-6 text-sm font-medium text-muted-foreground">Coming Soon</p>
    </div>
  );
}
