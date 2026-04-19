/**
 * Random Verse API — For "Verse of the Day" feature
 */

import { apiGet } from './client';
import type { ApiTranslation } from './verses';

export interface ApiRandomVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  chapter_id: number;
  text_uthmani: string;
  translations?: ApiTranslation[];
}

interface RandomVerseResponse {
  verse: ApiRandomVerse;
}

const DEFAULT_TRANSLATION_ID = 131;

/**
 * Fetch a random verse with Arabic text and translation
 */
export async function fetchRandomVerse(
  translationId: number = DEFAULT_TRANSLATION_ID
): Promise<ApiRandomVerse> {
  const data = await apiGet<RandomVerseResponse>('/verses/random', {
    params: {
      language: 'en',
      translations: String(translationId),
      fields: 'text_uthmani',
    },
  });
  return data.verse;
}
