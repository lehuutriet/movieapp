import type { Models } from "appwrite";
import { getDatabases } from "@/lib/appwrite";
import { Query } from "@/lib/appwrite";

const DEFAULT_PAGE_SIZE = 100;

/**
 * Fetches every document matching `baseQueries` using Appwrite cursor pagination.
 */
export async function listAllDocuments(
  databaseId: string,
  collectionId: string,
  baseQueries: string[],
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Models.Document[]> {
  const databases = getDatabases();
  const allDocs: Models.Document[] = [];
  let cursorAfter: string | null = null;

  while (true) {
    const pageQueries = [...baseQueries, Query.limit(pageSize)];
    if (cursorAfter) {
      pageQueries.push(Query.cursorAfter(cursorAfter));
    }

    const response = await databases.listDocuments(
      databaseId,
      collectionId,
      pageQueries,
    );
    allDocs.push(...response.documents);

    if (response.documents.length < pageSize) {
      break;
    }

    cursorAfter =
      response.documents[response.documents.length - 1]?.$id ?? null;
    if (!cursorAfter) {
      break;
    }
  }

  return allDocs;
}
