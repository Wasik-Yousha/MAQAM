/**
 * Verses API — Fetch verses by chapter with translations
 */

import { apiGet } from './client';

export interface ApiTranslation {
  resource_id: number;
  text: string;
}

export interface ApiVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_imlaei?: string;
  juz_number: number;
  hizb_number: number;
  page_number: number;
  translations?: ApiTranslation[];
  audio?: {
    url: string;
  };
}

interface VersesResponse {
  verses: ApiVerse[];
  pagination: {
    per_page: number;
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
  };
}

/**
 * Default translation ID:
 * 131 = Dr. Mustafa Khattab, The Clear Quran
 */
const DEFAULT_TRANSLATION_ID = 131;

/**
 * Fetch verses for a chapter with Arabic text and translation
 */
export async function fetchVersesByChapter(
  chapterNumber: number,
  page: number = 1,
  perPage: number = 50,
  translationId: number = DEFAULT_TRANSLATION_ID
): Promise<VersesResponse> {
  return apiGet<VersesResponse>(`/verses/by_chapter/${chapterNumber}`, {
    params: {
      language: 'en',
      translations: String(translationId),
      fields: 'text_uthmani',
      audio: 1,
      per_page: perPage,
      page,
    },
  });
}

/**
 * Fetch ALL verses for a chapter (handles pagination automatically)
 */
export async function fetchAllVersesForChapter(
  chapterNumber: number,
  translationId: number = DEFAULT_TRANSLATION_ID
): Promise<ApiVerse[]> {
  const allVerses: ApiVerse[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchVersesByChapter(chapterNumber, page, 50, translationId);
    allVerses.push(...response.verses);
    hasMore = response.pagination.next_page !== null;
    page++;
  }

  return allVerses;
}
