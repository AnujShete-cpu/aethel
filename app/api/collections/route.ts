import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createCollection, getUserCollections } from "@/services/collections";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUserCollections(userId);

  if (result.error) {
    return NextResponse.json({ error: "Failed to load collections" }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 200 });
}

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

  const { name, description, color, emoji } = body as Record<string, unknown>;

  // Validate name — required, trimmed, 1-160 chars
  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 160) {
    return NextResponse.json(
      { error: "Name must be 160 characters or fewer" },
      { status: 400 }
    );
  }

  // Validate optional description
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      return NextResponse.json({ error: "Description must be a string" }, { status: 400 });
    }
    if (description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or fewer" },
        { status: 400 }
      );
    }
  }

  // Validate optional color — must be #RRGGBB
  if (color !== undefined && color !== null) {
    if (typeof color !== "string" || !HEX_COLOR_PATTERN.test(color)) {
      return NextResponse.json(
        { error: "Color must be a valid hex code, e.g. #6366F1" },
        { status: 400 }
      );
    }
  }

  // Validate optional emoji — short string only
  if (emoji !== undefined && emoji !== null) {
    if (typeof emoji !== "string") {
      return NextResponse.json({ error: "Emoji must be a string" }, { status: 400 });
    }
    if (emoji.length > 8) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
  }

  const result = await createCollection(userId, {
    name: trimmedName,
    description: typeof description === "string" && description.trim() ? description.trim() : null,
    color: typeof color === "string" ? color : null,
    emoji: typeof emoji === "string" && emoji.trim() ? emoji.trim() : null,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
