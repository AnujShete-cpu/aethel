import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { moveSaveToCollection } from "@/services/collections";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: saveId } = await params;

  if (!saveId || typeof saveId !== "string") {
    return NextResponse.json({ error: "Invalid save ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { collectionId } = body as Record<string, unknown>;

  // collectionId must be a string (move into a collection) or explicit null
  // (move to Unsorted). Any other type is invalid.
  if (collectionId !== null && typeof collectionId !== "string") {
    return NextResponse.json(
      { error: "collectionId must be a string or null" },
      { status: 400 }
    );
  }

  const result = await moveSaveToCollection(userId, saveId, collectionId);

  if (result.error) {
    return NextResponse.json({ error: "Failed to move save" }, { status: 500 });
  }

  return NextResponse.json({ data: { saveId, collectionId } }, { status: 200 });
}
