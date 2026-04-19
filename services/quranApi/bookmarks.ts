import { apiGet, apiPost } from './client';

export interface ApiBookmark {
  id: number;
  verse_key: string;
  note?: string;
  created_at: string;
}

interface BookmarksResponse {
  bookmarks: ApiBookmark[];
}

export async function fetchBookmarks(): Promise<ApiBookmark[]> {
  const data = await apiGet<BookmarksResponse>('/bookmarks');
  return data.bookmarks;
}

export async function addBookmark(verseKey: string, note?: string): Promise<ApiBookmark> {
  const data = await apiPost<{ bookmark: ApiBookmark }>('/bookmarks', {
    verse_key: verseKey,
    note,
  });
  return data.bookmark;
}
