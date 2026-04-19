/**
 * Chapters API — List and get chapter info
 */

import { apiGet } from './client';

export interface ApiChapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: {
    language_name: string;
    name: string;
  };
}

interface ChaptersResponse {
  chapters: ApiChapter[];
}

interface ChapterResponse {
  chapter: ApiChapter;
}

/**
 * Fetch all 114 chapters
 */
export async function fetchChapters(language: string = 'en'): Promise<ApiChapter[]> {
  const data = await apiGet<ChaptersResponse>('/chapters', {
    params: { language },
  });
  return data.chapters;
}

/**
 * Fetch a single chapter by number
 */
export async function fetchChapter(chapterNumber: number, language: string = 'en'): Promise<ApiChapter> {
  const data = await apiGet<ChapterResponse>(`/chapters/${chapterNumber}`, {
    params: { language },
  });
  return data.chapter;
}
