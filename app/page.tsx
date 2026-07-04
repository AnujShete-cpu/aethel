import { redirect } from "next/navigation";
import type { Route } from "next";

export default function RootPage() {
  redirect("/inbox" as Route);
}
