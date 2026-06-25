import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { deleteSave } from "@/services/saves";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid save ID" }, { status: 400 });
  }

  const result = await deleteSave(userId, id);

  if (result.error) {
    return NextResponse.json({ error: "Failed to delete save" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
