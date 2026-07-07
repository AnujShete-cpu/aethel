import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { searchUserSaves } from "@/services/search";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const collection = searchParams.get("collection");

  if (!query || query.trim() === "") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (query.length > 500) {
    return NextResponse.json(
      { error: "Query must be 500 characters or fewer" },
      { status: 400 }
    );
  }

  const result = await searchUserSaves(userId, {
    query,
    collectionId: collection && collection.trim() ? collection : null,
  });

  if (result.error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }

  return NextResponse.json({ results: result.data }, { status: 200 });
}
