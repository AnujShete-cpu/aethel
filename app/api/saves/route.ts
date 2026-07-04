import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createSave, getUserSaves } from "@/services/saves";

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { url, title, description, collectionId } = body as Record<string, unknown>;

  // Validate URL — required, must be a string, must be a valid URL
  if (!url || typeof url !== "string" || url.trim() === "") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (url.length > 4096) {
    return NextResponse.json(
      { error: "URL must be 4096 characters or fewer" },
      { status: 400 }
    );
  }

  try {
    new URL(url.trim());
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid URL including https://" },
      { status: 400 }
    );
  }

  // Validate optional title
  if (title !== undefined && title !== null) {
    if (typeof title !== "string") {
      return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
    }
    if (title.length > 500) {
      return NextResponse.json(
        { error: "Title must be 500 characters or fewer" },
        { status: 400 }
      );
    }
  }

  // Validate optional description/notes
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      return NextResponse.json({ error: "Notes must be a string" }, { status: 400 });
    }
    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Notes must be 2000 characters or fewer" },
        { status: 400 }
      );
    }
  }

  // Validate optional collectionId
  if (collectionId !== undefined && collectionId !== null && typeof collectionId !== "string") {
    return NextResponse.json(
      { error: "collectionId must be a string or null" },
      { status: 400 }
    );
  }

  const result = await createSave(userId, {
    url: url.trim(),
    title: typeof title === "string" && title.trim() ? title.trim() : null,
    description:
      typeof description === "string" && description.trim()
        ? description.trim()
        : null,
    collectionId: typeof collectionId === "string" ? collectionId : null,
  });

  if (result.error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUserSaves(userId);

  if (result.error) {
    return NextResponse.json({ error: "Failed to load saves" }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 200 });
}
