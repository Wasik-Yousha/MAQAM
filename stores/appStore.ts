import { create } from 'zustand';

interface UserProfile {
  id: string;
  friendCode: string;
  name: string;
  email: string;
  ramadanBaselineVerses: number;
  readingGoal: 'khatam' | 'consistent' | 'understand';
  notificationTime: string;
  groqApiKey: string;
}

interface ReadingStats {
  currentStreak: number;
  longestStreak: number;
  versesThisWeek: number;
  daysRead: number;
  totalVerses: number;
  totalSessions: number;
  barakahScore: number;
}

interface HalakaGroup {
  id: string;
  name: string;
  memberCount: number;
  currentSurah: string;
  currentSurahNumber: number;
  groupStreak: number;
}

interface Reflection {
  id: string;
  userId: string;
  userName: string;
  userInitial: string;
  date: string;
  content: string;
  score: number;
}

interface BarakahRanking {
  rank: number;
  name: string;
  initial: string;
  streak: number;
  badge: string;
  score: number;
}

interface CompanionMessage {
  id: string;
  role: 'companion' | 'user';
  content: string;
}

interface AppState {
  // User
  user: UserProfile;
  stats: ReadingStats;
  lastRead: { surah: number; ayah: number; name: string } | null;
  lastAttendanceDate: string | null;
  
  // Halaka
  halakaGroups: HalakaGroup[];
  currentHalakaReflections: Reflection[];
  
  // Barakah
  barakahRankings: BarakahRanking[];
  
  // Companion
  companionOpen: boolean;
  companionMessages: CompanionMessage[];
  personalAssistantMessages: CompanionMessage[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setCompanionOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  addCompanionMessage: (message: CompanionMessage) => void;
  addPersonalAssistantMessage: (message: CompanionMessage) => void;
  setLastRead: (surah: number, ayah: number, name: string) => void;
  addHalakaGroup: (name: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setGroqApiKey: (key: string) => void;
  markHardCopyAttendance: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: '',
    friendCode: '',
    name: 'Seeker',
    email: '',
    ramadanBaselineVerses: 10,
    readingGoal: 'consistent',
    notificationTime: '08:00',
    groqApiKey: '',
  },
  
  stats: {
    currentStreak: 0,
    longestStreak: 0,
    versesThisWeek: 0,
    daysRead: 0,
    totalVerses: 0,
    totalSessions: 0,
    barakahScore: 10,
  },
  
  lastAttendanceDate: null,
  
  halakaGroups: [
    {
      id: '1',
      name: 'my halaka',
      memberCount: 1,
      currentSurah: 'Ar-Rahman',
      currentSurahNumber: 55,
      groupStreak: 1,
    },
  ],
  
  currentHalakaReflections: [
    {
      id: '1',
      userId: 'ahmad',
      userName: 'Ahmad',
      userInitial: 'A',
      date: '4/15/2026',
      content: 'This surah reminded me of the importance of gratitude. Even in hardship, Allah\'s mercy surrounds us.',
      score: 82,
    },
    {
      id: '2',
      userId: 'fatima',
      userName: 'Fatima',
      userInitial: 'F',
      date: '4/16/2026',
      content: 'The repetition of \'Which of the favours of your Lord will you deny?\' struck me deeply this week.',
      score: 91,
    },
  ],
  
  barakahRankings: [
    { rank: 1, name: 'Ahmad Al-Rashid', initial: 'A', streak: 28, badge: 'Diamond', score: 97 },
    { rank: 2, name: 'Fatima Hassan', initial: 'F', streak: 21, badge: 'Gold', score: 89 },
    { rank: 3, name: 'Ibrahim Yusuf', initial: 'I', streak: 14, badge: 'Gold', score: 83 },
    { rank: 4, name: 'Aisha Rahman', initial: 'A', streak: 10, badge: 'Silver', score: 61 },
    { rank: 5, name: 'Omar Khalid', initial: 'O', streak: 7, badge: 'Silver', score: 55 },
  ],
  
  companionOpen: false,
  sidebarOpen: false,
  theme: 'dark',
  companionMessages: [
    {
      id: '1',
      role: 'companion',
      content: "As-salamu alaykum. I'm here for you. Missed a session or just need a moment? Share what's on your heart.",
    },
  ],
  personalAssistantMessages: [
    {
      id: '1',
      role: 'companion',
      content: "As-salamu alaykum. I am your personal Quran assistant. How can I help you with your reading, understanding, or reflections today?",
    },
  ],
  
  lastRead: { surah: 18, ayah: 10, name: 'Al-Kahf' },
  
  setCompanionOpen: (open) => set({ companionOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  addCompanionMessage: (message) =>
    set((state) => ({
      companionMessages: [...state.companionMessages, message],
    })),
  addPersonalAssistantMessage: (message) =>
    set((state) => ({
      personalAssistantMessages: [...state.personalAssistantMessages, message],
    })),
  setLastRead: (surah, ayah, name) => set({ lastRead: { surah, ayah, name } }),
  addHalakaGroup: (name) => set((state) => ({
    halakaGroups: [
      ...state.halakaGroups,
      {
        id: Date.now().toString(),
        name,
        memberCount: 1,
        currentSurah: 'Al-Fatiha',
        currentSurahNumber: 1,
        groupStreak: 0,
      }
    ]
  })),
  setTheme: (theme) => set({ theme }),
  setGroqApiKey: (key) => set((state) => ({ user: { ...state.user, groqApiKey: key } })),
  markHardCopyAttendance: () => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    if (state.lastAttendanceDate === today) return state;
    
    const currentStreak = state.stats.currentStreak + 1;
    return {
      lastAttendanceDate: today,
      stats: {
        ...state.stats,
        currentStreak,
        longestStreak: Math.max(state.stats.longestStreak, currentStreak),
        daysRead: state.stats.daysRead + 1,
        totalSessions: state.stats.totalSessions + 1,
        barakahScore: state.stats.barakahScore + 5,
      }
    };
  }),
}));
