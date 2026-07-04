import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  getCollectionWithSaves,
  updateCollection,
  deleteCollection,
} from "@/services/collections";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
  }

  const result = await getCollectionWithSaves(userId, id);

  if (result.error) {
    const status = result.error === "Collection not found." ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ data: result.data }, { status: 200 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
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
  const update: { name?: string; description?: string | null; color?: string | null; emoji?: string | null } = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    if (name.trim().length > 160) {
      return NextResponse.json(
        { error: "Name must be 160 characters or fewer" },
        { status: 400 }
      );
    }
    update.name = name.trim();
  }

  if (description !== undefined) {
    if (description !== null && typeof description !== "string") {
      return NextResponse.json({ error: "Description must be a string" }, { status: 400 });
    }
    if (typeof description === "string" && description.length > 1000) {
      return NextResponse.json(
        { error: "Description must be 1000 characters or fewer" },
        { status: 400 }
      );
    }
    update.description = typeof description === "string" ? (description.trim() || null) : null;
  }

  if (color !== undefined) {
    if (color !== null && (typeof color !== "string" || !HEX_COLOR_PATTERN.test(color))) {
      return NextResponse.json(
        { error: "Color must be a valid hex code, e.g. #6366F1" },
        { status: 400 }
      );
    }
    update.color = color;
  }

  if (emoji !== undefined) {
    if (emoji !== null && typeof emoji !== "string") {
      return NextResponse.json({ error: "Emoji must be a string" }, { status: 400 });
    }
    if (typeof emoji === "string" && emoji.length > 8) {
      return NextResponse.json({ error: "Invalid emoji" }, { status: 400 });
    }
    update.emoji = typeof emoji === "string" ? (emoji.trim() || null) : null;
  }

  const result = await updateCollection(userId, id, update);

  if (result.error) {
    const status = result.error === "Collection not found." ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ data: result.data }, { status: 200 });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Invalid collection ID" }, { status: 400 });
  }

  const result = await deleteCollection(userId, id);

  if (result.error) {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
