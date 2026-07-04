import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import type { Route } from "next";

import { getCollectionWithSaves } from "@/services/collections";
import { CollectionDetail } from "@/components/collections/collection-detail";

type CollectionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CollectionDetailPageProps): Promise<Metadata> {
  const { userId } = await auth();
  if (!userId) return { title: "Collection" };

  const { id } = await params;
  const result = await getCollectionWithSaves(userId, id);

  return { title: result.data?.collection.name ?? "Collection" };
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login" as Route);
  }

  const { id } = await params;
  const result = await getCollectionWithSaves(userId, id);

  if (result.error === "Collection not found.") {
    notFound();
  }

  if (!result.data) {
    // Other error types render an inline error via the client component
    // by passing an empty shell; getCollectionWithSaves logs the cause.
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <CollectionDetail collectionId={id} initialData={result.data} />
    </div>
  );
}
