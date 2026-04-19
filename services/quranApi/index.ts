/**
 * Quran.Foundation API — Barrel Export
 */

export { getQfConfig } from './config';
export { getAccessToken, clearTokenCache } from './auth';
export { apiGet } from './client';
export { fetchChapters, fetchChapter } from './chapters';
export type { ApiChapter } from './chapters';
export { fetchVersesByChapter, fetchAllVersesForChapter } from './verses';
export type { ApiVerse, ApiTranslation } from './verses';
export { fetchRandomVerse } from './random';
export type { ApiRandomVerse } from './random';
export { fetchBookmarks, addBookmark } from './bookmarks';
export type { ApiBookmark } from './bookmarks';
export { fetchStreaks, updateStreak } from './streaks';
export type { ApiStreak } from './streaks';
