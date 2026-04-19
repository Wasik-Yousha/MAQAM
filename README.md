# Maqam (مقام)

Maqam is a React Native mobile application built for the **Quran Foundation Hackathon 2026**. It serves as an intelligent, habit-building spiritual companion designed to help Muslims maintain their Quran reading routine with the help of a personalized AI assistant.

## Features

This repository includes the following fully implemented features:

### 1. AI Spiritual Companion (Powered by Groq)
- **Floating Barrier Detection**: A floating AI FAB that initiates a gentle 3-message conversation to understand the real reasons behind missed reading sessions and suggests immediate actions.
- **Full-Screen Chatbot**: A dedicated "Companion" tab utilizing `llama-3.3-70b-versatile` through Groq to act as a deeply empathetic Quranic assistant. It parses XML-style responses (e.g., `<suggested_actions>`) to trigger dynamic in-app navigation routes based on your conversation.

### 2. Advanced Quran Reader
- **Quran Foundation API Integration**: Fetches authentic, scholarly-verified chapters, verses, and translations directly from the Quran.Foundation backend.
- **Audio Playback**: Uses `expo-av` to render smooth audio recitation playback mapped dynamically to the Quran Foundation's CDN.
- **Dynamic Content**: Renders beautiful Uthmani script and real-time translation texts.

### 3. Spiritual Dashboard & Barakah Tracking
- **Barakah Points & Streaks**: Gamifies the habit by tracking daily reading streaks, total sessions, and calculating a "Barakah Score".
- **Physical Copy Check-in**: An offline-first toggle in the Profile and Home screen allowing users to log attendance even if they read from a physical hard-copy Quran.

### 4. Halaka (Study Circles)
- **Peer-to-Peer Motivation**: Create and manage "Halaka" study circles with your friends.
- **Shared Reflections**: Group view displaying weekly assigned Surahs. Users can post reflections and track group-level reading streaks.
- **Friend Code System**: Deeply integrated with Supabase to generate unique invite links/codes to securely join Barakah leaderboards.

### 5. Highly Polished UI/UX
- **Responsive Navigation**: A hybrid navigation system featuring a modern Expo Router bottom-tab layout and a sleek sliding side-menu drawer that slides out optimally covering 60% of mobile viewports.
- **Full Theme Support**: Dynamic Dark/Light mode engine fully manageable from the sidebar or the dedicated settings page.
- **Dedicated Application Stacks**: Includes settings, privacy policies, terms of conditions, and an extensible notification pipeline.

## Tech Stack

- **Framework:** React Native + Expo (Expo Router)
- **Language:** TypeScript
- **AI Engine:** Groq API (`llama-3.3-70b-versatile`)
- **Backend & DB:** Supabase (Auth & Halaka Data)
- **API integrations:** Quran.Foundation API
- **Styling:** Custom standard React Native stylesheets driven by a global unified `Colors` theme engine.
- **Animation:** `react-native-reanimated`

## Setup & Installation

### Prerequisites
1. Node.js (v18+)
2. Expo CLI 

### Initialization
```bash
# Clone the repository
git clone https://github.com/Wasik-Yousha/MAQAM.git
cd MAQAM

# Install dependencies (legacy peer deps required for groq-sdk)
npm install --legacy-peer-deps
```

### Environment Note (Intentional for this Project)
For this project only, `.env` is intentionally committed so everyone can run the app quickly without extra setup.

This was done specifically for hackathon/demo convenience and is not a recommended pattern for production projects.

If you want to use your own keys, update `.env` with your values.

### Running the App
```bash
npm run start
```
Use the Expo Go app on your physical device, or press `i` / `a` in the terminal to launch the iOS simulator / Android Emulator.

## License
Created for the Quran Foundation Hackathon. Proprietary logic belongs to the development team, and Quranic texts belong to the Quran Foundation APIs.
