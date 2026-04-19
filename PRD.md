

**مقام**

**M A Q A M**

*The Quran Habit Companion*

 

**Product Requirements Document**

Version 1.0  •  April 2026

Quran Foundation Hackathon 2026  •  Provision Launch

**Prize Target: $3,000 (1st Place)  •  Deadline: April 20, 2026**

| ��� Mission | Keep your Ramadan spirit alive — year round. Maqam uses AI-powered emotional check-ins, community accountability (Halaka), and data-driven insights to bridge the gap between Ramadan momentum and lasting habit. |
| :---- | :---- |

 

 

 

# **1\. Product Overview**

## **1.1 Problem Statement**

Millions of Muslims reconnect deeply with the Quran during Ramadan. But once the month ends, communal energy disappears, routines change, and the connection fades. This is not a willingness problem — it is a structural one.

 

| ��� Data | From a 35,000-user study (Greentech Apps Foundation, 2025): \~50% of reading plans are never started. Only 31.5% avg completion. Median completion is just 1%. Plans drop to 17.9% completion after 6 months. |
| :---- | :---- |

 

The root causes are:

Loss of communal Ramadan atmosphere and group accountability

No mechanism to understand WHY users stop — silent drop-off

Generic habit apps with no Quran-native emotional intelligence

Overwhelming long-term plans with no adaptive support

## **1.2 Solution**

Maqam is a React Native mobile app that combines three pillars:

AI Companion — a floating chatbot that detects relapse reasons and responds with Quran verses matched to the user's emotional state

Halaka — async group circles that recreate the communal energy of Ramadan year-round

Spiritual GPS — a personal dashboard showing your journey from Ramadan peak to today

## **1.3 Target User**

Primary: Post-Ramadan Muslims (18–40) who read consistently in Ramadan but lapsed

Secondary: Muslims wanting structured, community-supported reading habits

Geography: Global — English first, Arabic/Bengali/Urdu planned

Device: Mobile-first (iOS \+ Android via React Native)

## **1.4 Success Metrics**

| Metric | Baseline | Target (30 days post-launch) |
| :---- | :---- | :---- |
| Day-7 retention | Industry avg \~25% | ≥ 40% |
| Reading plan completion | 31.5% (research) | ≥ 45% |
| Plans never started | \~50% (research) | ≤ 25% |
| Halaka participation rate | N/A | ≥ 60% of users |
| Chatbot resolution rate | N/A | ≥ 50% read after chatbot |

 

# **2\. Technology Stack**

## **2.1 Core Stack**

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Framework | React Native 0.74 (Expo SDK 51\) | Cross-platform iOS \+ Android, fast iteration |
| Language | TypeScript 5.x | Type safety across entire codebase |
| Navigation | Expo Router (file-based) | Native stack \+ tab navigation |
| State Management | Zustand \+ React Query | Zustand for global UI, React Query for API cache |
| Styling | NativeWind (Tailwind for RN) | Utility-first, consistent design tokens |
| Backend / DB | Supabase (Postgres \+ Auth \+ Realtime) | Auth, database, real-time Halaka updates |
| AI / LLM | Anthropic Claude API (claude-sonnet-4-20250514) | Barrier detection, verse matching, summaries |
| Quran APIs | Quran Foundation API \+ Quran MCP | All verse, audio, tafsir, user data |
| Push Notifications | Expo Notifications \+ FCM/APNs | Daily nudge \+ no-open follow-up |
| Audio | Expo AV | Verse recitation playback |
| Offline | MMKV \+ Expo SQLite | Cache last surah for offline reading |
| Analytics | PostHog (self-hosted) | Track habit loops, funnel analysis |
| Deployment | EAS Build (Expo) | OTA updates, TestFlight \+ Play Store |

## **2.2 Project Structure**

app/                          ← Expo Router screens

  (auth)/login.tsx            ← Auth screens

  (tabs)/                     ← Bottom tab navigator

    index.tsx                 ← Home / Spiritual GPS

    read/\[surah\].tsx          ← Surah reader

    halaka/\[id\].tsx           ← Halaka group screen

    barakah.tsx               ← Barakah Board

    profile.tsx               ← Profile \+ settings

components/                   ← Reusable components

  FloatingCompanion/          ← AI chatbot FAB

  Reader/                     ← Verse, audio, tafsir

  Halaka/                     ← Group components

  Dashboard/                  ← GPS, charts

services/                     ← API layer

  quran.ts / claude.ts / supabase.ts

hooks/                        ← useStreak, useHalaka, useCompanion

 
## **2.3 Color Palette (Tokens)**

**Light mode:**
- **background**: `#f8f5ee` (Parchment — main screen background)
- **foreground**: `#1a1a2e` (Primary text)
- **card**: `#ffffff` (Cards and elevated surfaces)
- **primary**: `#2d6a4f` (Forest green — buttons, active states, FAB)
- **primaryForeground**: `#ffffff` (Text on primary green)
- **secondary**: `#f0ebe0` (Subtle backgrounds)
- **muted**: `#e8e0d0` (Dividers, disabled states)
- **mutedForeground**: `#636e72` (Secondary text, placeholders)
- **accent**: `#b7950b` (Accent highlights)
- **border**: `#ddd5c0` (Input and card borders)
- **gold**: `#c9a84c` (Streak badges, Barakah meter, verse tags)
- **goldLight**: `#f5e6c8` (Gold tint backgrounds)
- **deepGreen**: `#1b4332` (Headers: surah reader, Barakah board)
- **sage**: `#52796f` (Mid-tone green accents)
- **parchment**: `#faf7f0` (Cream background variant)
- **destructive**: `#c0392b` (Delete / error states)

**Dark mode** uses the same token names but shifts to a deep forest night palette:
- **background**: `#0d1b12`
- **primary**: `#52b788` (primary green)
- **card**: `#1a2e1f`
- **foreground**: `#e8dcc8` (text)
- **gold**: `#c9a84c` (carries through both modes)

The three anchoring colors are the deep forest green, the warm parchment, and the Islamic gold — chosen to evoke the feel of traditional Islamic manuscripts and architecture.
 

# **3\. Feature Specifications**

## **3.1 Onboarding Flow**

The onboarding is the first impression and must feel spiritual, not like a productivity app. It establishes the user's Ramadan baseline which powers the entire Spiritual GPS.

 

### **Screens**

Welcome — 'Your Ramadan connection doesn't have to end'

Ramadan Baseline — slider: how many verses/day in Ramadan? (sets the comparison anchor)

Goal Selection — Khatam / Stay Consistent / Understand Deeper

Daily Time — pick notification time (shown as 'Your reading moment')

Circle Invite — enter phone numbers or share link to form Halaka group

Plan Generated — shows 8–30 day plan, 20–40 verses/day (research-optimal)

 

### **Data Flow**

Saves user.ramadan\_baseline\_verses, user.goal, user.notification\_time to Supabase

Creates reading plan via Activity & Goals API

Creates Halaka Collection (Collections API) if circle invited

Registers push token via Expo Notifications

 

| ��� Research | 8–30 day plans \= 34.8% completion (highest). 20–40 verses/day \= optimal daily target. These are hardcoded as defaults based on white paper findings. |
| :---- | :---- |

 

## **3.2 Floating AI Companion (FAB)**

The centrepiece of the app. A floating action button (FAB) present on every screen. Tapping it opens a bottom-sheet chat interface powered by Claude. It is the app's emotional core — not a utility, but a companion.

 

### **Visual Design**

Floating button: circular, deep green, gold crescent moon icon, subtle pulse animation when a check-in is pending

Bottom sheet: slides up to 75% screen height, blurred background, Arabic geometric pattern header

Messages: user bubbles right-aligned (gold), companion bubbles left-aligned (green) with a small crescent avatar

Verse responses: rendered in a special card with Arabic text, transliteration, translation, and inline audio play button

 

### **Trigger Modes**

Manual: user taps FAB anytime — companion greets based on time of day and last activity

Auto-triggered: notification sent → no app open in 30 mins → deep link opens companion with check-in mode

Post-reading: after session ends, companion asks for a one-line reflection

Weekly: every Sunday, companion opens with Halaka summary \+ group encouragement

 

### **Conversation Flow — Barrier Detection**

| Turn | Companion Message | User Action |
| :---- | :---- | :---- |
| 1 | 'Assalamu Alaikum. You missed your reading today — that's okay. Did something come up?' | Free text response |
| 2 (if busy) | 'Life gets full sometimes. Is it harder without the Ramadan atmosphere around you?' | Yes / No / Free text |
| 3 | 'I understand. Here's something that might help right now.' → verse card shown | Read verse / Open full reader |
| Resolution | If user opens reader → log resolved=true in barrier\_logs | Reading session starts |

 

### **Claude System Prompt — Barrier Detection**

You are Maqam's compassionate AI companion. The user has missed their Quran reading. Have a gentle 3-message conversation to find the real barrier. Ask progressively deeper questions. At message 3, identify the barrier as one of: busy | lonely | lost\_meaning | overwhelmed | spiritually\_distant. Then use Quran MCP semantic search to find the single most relevant verse. Return a JSON block: { barrier\_type, verse\_query, surah, ayah, comfort\_message }. Tone: warm, non-judgmental, Islamic. Never guilt-trip. Always end with hope and a practical micro-step.

 

### **Data Flow**

User message → Claude API (services/claude.ts) → barrier classification

verse\_query → Quran MCP semantic search → surah \+ ayah returned

Verse fetched: Translation API \+ Audio API

Full conversation \+ barrier\_type saved to barrier\_logs (Supabase)

resolved flag updated when user opens reader after chatbot

 

## **3.3 Reading Session**

A distraction-free, feature-rich Quran reader built for depth, not speed.

 

### **Core UI**

Full-screen reader with swipe-to-next-verse navigation

Arabic text in large Uthmani script font (QCF\_BSML)

Below each verse: translation (user's language preference)

Word-by-word mode: tap any word → tooltip with meaning \+ root (Quran API word data)

Audio button per verse — plays recitation (Audio API, default: Mishary Rashid)

Tafsir drawer — swipe up from bottom to read commentary (Tafsir API)

Bookmark button — saves verse to Bookmarks API with optional personal note

 

### **Progress Tracking**

Session progress bar at top

Auto-saves position on app background

On session complete: streak updated (Streak Tracking API), activity logged (Activity API)

Triggers post-session companion prompt for reflection

 

### **Offline Mode**

Last opened surah cached to Expo SQLite

Audio files cached via Expo FileSystem for offline playback

 

## **3.4 Halaka — Ramadan Circle Year-Round**

Halaka recreates the communal energy of Ramadan. Small groups (5–10) engage weekly with the same surah through async reflections — no scheduling needed.

 

### **Group Creation**

Created at onboarding or from Halaka tab

Invite via phone / link / QR code

Group stored as Collection (Collections API) with member user IDs

Each group has a name, avatar colour, and a running group streak counter

 

### **Weekly Cycle**

Every Monday: AI suggests this week's surah based on group's average reading progress

Members read the surah during the week (tracked via Activity API)

Members post an async text reflection (Post API — Lessons & Reflections)

Sunday night: Claude generates a 150-word Halaka Summary from all reflections

Summary posted as a Lesson post visible to all group members

Group streak increments if ≥70% of members posted a reflection

 

### **Halaka Summary — Claude Prompt**

You are summarising a weekly Halaka group discussion. Reflections from {n} members on Surah {name}: {reflections}. Write a 150-word summary highlighting: common themes noticed, one standout insight, and an encouraging closing line. Tone: like a warm, knowledgeable Islamic scholar. Address the group as 'your circle'.

 

### **Real-time Updates**

Supabase Realtime subscription on halaka\_reflections table

New reflection posts show live without refresh

Group streak animation when milestone hit

 

## **3.5 Barakah Board**

A private leaderboard within each Halaka circle. Ranked not by verses read, but by consistency, reflection quality, and community contribution — keeping it spiritual.

 

### **Score Formula**

**weekly\_score \= (streak\_consistency × 0.40) \+ (reflection\_score × 0.30) \+ (halaka\_contribution × 0.30)**

 

streak\_consistency: % of days read this week (0.0–1.0)

reflection\_score: AI-scored 0.0–1.0 for depth \+ verse reference \+ intention (Claude API)

halaka\_contribution: 1.0 if posted reflection this week, 0.5 if commented, 0.0 if absent

 

### **Display**

Top 3 shown with gold / silver / bronze Barakah badges

'Since Ramadan' stats: each member's streak vs their Ramadan baseline

Weekly winner highlighted with animated badge on profile

No public visibility — strictly within Halaka circle only

 

## **3.6 Spiritual GPS — Personal Dashboard**

The home screen. A living picture of the user's journey from Ramadan peak to present — making progress visible and meaningful.

 

### **Components**

Ramadan Comparison: line chart — Ramadan baseline vs current daily verses (Recharts via react-native-svg)

Streak Card: current streak, longest streak, 'X% of your Ramadan pace'

Barrier History: 'You've felt lonely without community 4 times — Halaka helped 3 of them'

Pattern Insights: AI-generated weekly insight — 'You read best on Saturday mornings at 7am'

Verse of Your Mood: home card showing a verse matched to latest reflection sentiment

Today's Plan: mini reading card — tap to open reader

 

### **Weekly AI Insight — Claude Prompt**

Given this user's reading activity for the past 7 days: {activity\_data}. Their barrier logs: {barrier\_logs}. Their Ramadan baseline: {baseline} verses/day. Generate a 2-sentence personal insight identifying their best reading pattern and one actionable suggestion. Be warm and specific, not generic.

 

## **3.7 Smart Notification System**

### **Notification Types**

| Type | Trigger | Message Style | Deep Link |
| :---- | :---- | :---- | :---- |
| Daily Nudge | User's chosen time | 'Remember Ramadan? Your circle is reading right now. 5 mins is all it takes.' | → Reader |
| No-Open Follow-up | 30 min after nudge, no open | 'It's okay to have off days. Your companion wants to check in.' | → Companion |
| Halaka Reminder | Sunday 8pm if no reflection | 'Your Halaka circle posted their reflections. Share yours before the summary.' | → Halaka |
| Streak Milestone | 7, 30, 100 day streaks | 'MashaAllah\! 30 days consistent. Your circle has been notified.' | → Barakah |
| Group Streak | Group hits 70% threshold | 'Your Halaka circle kept the streak alive this week\! ���' | → Halaka |

 

### **Implementation**

Expo Notifications for scheduling \+ FCM (Android) / APNs (iOS)

Notification response tracking: open / dismiss / ignore logged to analytics

Smart suppression: no nudge if user already read today

 

# **4\. Quran Foundation API Coverage**

All 10 required APIs are used meaningfully — not token integrations.

 

| API | Category | Used In | Endpoint |
| :---- | :---- | :---- | :---- |
| Quran API | **Content** | Reader (verse text, word-by-word) | GET /verses/by\_chapter/{id} |
| Audio API | **Content** | Reader playback, Companion verse cards, Notifications | GET /verses/by\_chapter/{id}?audio=1 |
| Tafsir API | **Content** | Reader tafsir drawer, Halaka context | GET /tafsirs/{id}/by\_ayah/{key} |
| Translation API | **Content** | Reader, Companion verse response, Widget | GET /verses/by\_chapter/{id}?translations={id} |
| Post API (Lessons) | **Content** | Halaka weekly AI summary published as lesson | GET /posts (lessons type) |
| Bookmarks API | **User** | Reader bookmark button, saved verses | POST/GET /bookmarks |
| Collections API | **User** | Halaka group storage, curated verse lists | POST/GET /collections |
| Streak Tracking API | **User** | Barakah Board, Spiritual GPS, notifications | GET/POST /streaks |
| Post API (Reflections) | **User** | Self-log after reading, Halaka reflections | POST /posts (reflection type) |
| Activity & Goals API | **User** | Onboarding plan, Spiritual GPS, progress tracking | GET/POST /goals, /activity |

 

# **5\. Data Models (Supabase)**

## **5.1 users**

| Field | Type | Description |
| :---- | :---- | :---- |
| **id** | uuid PK | Supabase auth user ID |
| **email** | text | User email |
| **name** | text | Display name |
| **ramadan\_baseline\_verses** | integer | Self-reported Ramadan daily average — Spiritual GPS anchor |
| **reading\_goal** | enum | khatam | consistent | understand |
| **notification\_time** | time | Daily nudge time |
| **push\_token** | text | Expo push token for notifications |
| **quran\_api\_token** | text | OAuth token for Quran Foundation User APIs |
| **created\_at** | timestamptz | Account creation timestamp |

 

## **5.2 barrier\_logs**

| Field | Type | Description |
| :---- | :---- | :---- |
| **id** | uuid PK | Log entry ID |
| **user\_id** | uuid FK | References users.id |
| **barrier\_type** | enum | busy | lonely | lost\_meaning | overwhelmed | spiritually\_distant |
| **chatbot\_session** | jsonb | Full conversation array \[{role, content}\] |
| **verse\_shown** | text | Ayah key of verse surfaced (e.g. '2:286') |
| **resolved** | boolean | True if user opened reader within 30 mins of chatbot |
| **created\_at** | timestamptz | Timestamp of barrier event |

 

## **5.3 halaka\_groups**

| Field | Type | Description |
| :---- | :---- | :---- |
| **id** | uuid PK | Group ID |
| **name** | text | Group display name |
| **created\_by** | uuid FK | Owner user ID |
| **member\_ids** | uuid\[\] | Array of member user IDs |
| **current\_week\_surah** | integer | Surah number for this week |
| **group\_streak** | integer | Consecutive weeks with ≥70% participation |
| **collection\_id** | text | Quran Foundation Collections API ID |
| **created\_at** | timestamptz | Group creation timestamp |

 

## **5.4 halaka\_reflections**

| Field | Type | Description |
| :---- | :---- | :---- |
| **id** | uuid PK | Reflection ID |
| **group\_id** | uuid FK | References halaka\_groups.id |
| **user\_id** | uuid FK | References users.id |
| **week\_number** | integer | ISO week number |
| **content** | text | Reflection text content |
| **reflection\_score** | float | AI-scored 0.0–1.0 (depth \+ reference \+ intention) |
| **post\_api\_id** | text | Quran Foundation Post API ID for the reflection |
| **created\_at** | timestamptz | Submission timestamp |

 

## **5.5 barakah\_scores**

| Field | Type | Description |
| :---- | :---- | :---- |
| **id** | uuid PK | Score record ID |
| **user\_id** | uuid FK | References users.id |
| **group\_id** | uuid FK | References halaka\_groups.id |
| **week\_number** | integer | ISO week number |
| **streak\_score** | float | Streak consistency component (weight 0.4) |
| **reflection\_score** | float | Reflection quality component (weight 0.3) |
| **contribution\_score** | float | Halaka participation component (weight 0.3) |
| **total\_score** | float | Weighted total for leaderboard ranking |
| **badge** | text | gold | silver | bronze | null |
| **created\_at** | timestamptz | Score calculation timestamp |

 

# **6\. Prioritised Feature List**

| Feature | Description | Priority | Sprint |
| :---- | :---- | ----- | ----- |
| **Onboarding Flow** | 6-screen flow: baseline, goal, time, plan, circle invite | **P0** | Day 1–2 |
| **Quran Reader** | Verse display, Arabic \+ translation, swipe navigation, progress save | **P0** | Day 1–2 |
| **Audio Playback** | Per-verse recitation via Expo AV \+ Audio API | **P0** | Day 2 |
| **Floating Companion FAB** | Always-visible floating button, bottom-sheet chat UI | **P0** | Day 3 |
| **Barrier Detection AI** | Claude API chat, classifies barrier, returns verse | **P0** | Day 3 |
| **Smart Notifications** | Daily nudge \+ 30-min no-open follow-up via Expo Notifications | **P0** | Day 2 |
| **Streak Tracking** | Daily streak via Streak API \+ local display | **P0** | Day 2 |
| **Halaka Groups** | Create group, invite members, view reflections feed | **P1** | Day 4 |
| **Async Reflections** | Post reflection via Post API, real-time feed via Supabase | **P1** | Day 4 |
| **Weekly AI Summary** | Claude summarises group reflections each Sunday | **P1** | Day 4 |
| **Barakah Board** | Score formula, leaderboard within group, badges | **P1** | Day 5 |
| **Spiritual GPS** | Home dashboard: Ramadan comparison chart, streak, insights | **P1** | Day 5 |
| **Word-by-Word Mode** | Tap word → meaning tooltip via Quran API word data | **P1** | Day 2 |
| **Tafsir Drawer** | Swipe-up drawer per verse, Tafsir API | **P1** | Day 2 |
| **Bookmarks** | Save verse \+ note, Bookmarks API, My Verses screen | **P2** | Day 5 |
| **Verse of Your Mood** | Home card: sentiment-matched verse from last reflection | **P2** | Day 6 |
| **Pattern Insights** | Weekly AI insight on reading patterns from activity data | **P2** | Day 6 |
| **Offline Reading** | Last surah cached to SQLite, audio files cached | **P2** | Day 6 |
| **Barrier History** | Visual log of past barriers \+ resolution rate on GPS | **P2** | Day 6 |
| **Halaka QR Invite** | QR code for easy circle joining | **P3** | Post-hackathon |
| **Voice Reflections** | Audio note reflections in Halaka | **P3** | Post-hackathon |
| **Multi-language** | Arabic, Bengali, Urdu UI \+ translations | **P3** | Post-hackathon |

 

# **7\. Master Prompt (AI Coding Assistant)**

Paste this at the start of every Cursor / Claude Code session to provide full project context without re-explaining:

 

**────────────────────────── MASTER PROMPT START ──────────────────────────**

 

You are a senior full-stack React Native engineer. Help me build Maqam — a React Native (Expo SDK 51\) app for the Quran Foundation Hackathon 2026\.

 

**\=== PRODUCT CONTEXT \===**

Maqam helps post-Ramadan Muslims maintain Quran reading habits year-round. Core insight: \~50% of plans never start, biggest drop-off after Ramadan. Three pillars: (1) Floating AI Companion — detects why user stopped, returns matched Quran verse. (2) Halaka — async group circles recreating Ramadan community. (3) Spiritual GPS — Ramadan baseline vs now comparison dashboard.

 

**\=== TECH STACK \===**

React Native 0.74 \+ Expo SDK 51 \+ TypeScript. Expo Router (file-based nav). NativeWind for styling. Zustand \+ React Query for state. Supabase (Postgres \+ Auth \+ Realtime). Anthropic Claude API (claude-sonnet-4-20250514). Quran Foundation API (api.qurancdn.com/api/qdc). Quran MCP (mcp.quran.ai). Expo Notifications \+ FCM/APNs. Expo AV for audio. MMKV \+ Expo SQLite for offline. EAS Build for deployment.

 

**\=== QURAN FOUNDATION APIs \===**

Base: https://api.qurancdn.com/api/qdc

GET /verses/by\_chapter/{id} — verses

GET /verses/by\_chapter/{id}?audio=1 — with audio URLs

GET /tafsirs/{tafsir\_id}/by\_ayah/{ayah\_key} — tafsir

GET /verses/by\_chapter/{id}?translations={id} — translated

POST /bookmarks | GET /bookmarks — bookmark management

POST /collections | GET /collections — Halaka groups

GET /streaks | POST /streaks/update — streak data

POST /posts | GET /posts — reflections \+ lessons

GET /goals | POST /goals — reading plan goals

 

**\=== SUPABASE TABLES \===**

users: id, email, name, ramadan\_baseline\_verses, reading\_goal, notification\_time, push\_token, quran\_api\_token

barrier\_logs: id, user\_id, barrier\_type (enum: busy|lonely|lost\_meaning|overwhelmed|spiritually\_distant), chatbot\_session (jsonb), verse\_shown, resolved (bool)

halaka\_groups: id, name, created\_by, member\_ids (uuid\[\]), current\_week\_surah, group\_streak, collection\_id

halaka\_reflections: id, group\_id, user\_id, week\_number, content, reflection\_score (float), post\_api\_id

barakah\_scores: id, user\_id, group\_id, week\_number, streak\_score, reflection\_score, contribution\_score, total\_score, badge

 

**\=== CLAUDE API PROMPTS \===**

BARRIER DETECTION system prompt: 'You are Maqam's compassionate companion. The user missed their Quran reading. Have a gentle 3-message conversation. Identify barrier as: busy|lonely|lost\_meaning|overwhelmed|spiritually\_distant. At message 3 return JSON: { barrier\_type, verse\_query, surah, ayah, comfort\_message }. Tone: warm, Islamic, never guilt-trip.'

VERSE MOOD system prompt: 'Given reflection: {text}. Return JSON { surah, ayah, reason } for the single most emotionally relevant verse.'

HALAKA SUMMARY: 'Summarise {n} member reflections on Surah {name} in 150 words. Highlight common themes, one standout insight, encouraging close. Tone: warm Islamic scholar.'

REFLECTION SCORER: 'Score 0.0-1.0: depth (0-0.4) \+ verse reference (0-0.3) \+ actionable intention (0-0.3). Return JSON { score, reason }.'

 

**\=== BARAKAH SCORE \===**

score \= (streak\_consistency \* 0.40) \+ (reflection\_score \* 0.30) \+ (halaka\_contribution \* 0.30)

 

**\=== FLOATING COMPANION \===**

Fixed-position FAB (bottom-right, z-index top) on every screen. Tapping opens bottom-sheet (75% height) with ChatInterface component. Modes: manual | auto-checkin | post-reading | weekly-halaka. Pulsing animation when check-in pending.

 

**\=== UX RULES \===**

1\. Islamic aesthetic: deep greens (\#1B4332), golds (\#B7882C), off-whites. Geometric pattern backgrounds. Arabic calligraphy accents. 2\. Mobile-first, bottom tab nav: Home | Read | Halaka | Barakah | Profile. 3\. Companion FAB on ALL screens. 4\. Every empty state shows a verse. 5\. Reader works offline. 6\. Notification flow is critical — implement service worker Day 1\.

 

**\=== BUILD PRIORITY (7 DAYS) \===**

Day 1: Setup \+ auth \+ Supabase schema \+ Quran API integration

Day 2: Onboarding \+ reader (verses, audio, tafsir, word-by-word) \+ notifications

Day 3: Floating Companion FAB \+ barrier detection chatbot (Claude API)

Day 4: Halaka (groups, reflections, weekly summary)

Day 5: Barakah Board \+ Spiritual GPS dashboard

Day 6: Verse of Mood \+ pattern insights \+ offline cache \+ UI polish

Day 7: EAS build \+ Vercel API routes \+ demo video \+ submission

 

**\=== CODING RULES \===**

Always show full file path. Write complete TypeScript — no placeholders. Include error handling and loading states. Use NativeWind for all styling. Ask before architectural decisions affecting multiple files. Every screen must handle empty, loading, and error states.

 

**────────────────────────── MASTER PROMPT END ──────────────────────────**

 

# **8\. Judging Alignment**

| Criteria | Points | How Maqam Wins |
| :---- | :---- | :---- |
| Impact on Quran Engagement | 30 | Directly solves the 50% never-start \+ post-Ramadan drop-off. Halaka \+ Companion are proven habit mechanisms. |
| Product Quality & UX | 20 | Islamic-native design, floating companion, smooth reader, offline support — feels built for this purpose. |
| Technical Execution | 20 | Claude API \+ Quran MCP \+ Supabase Realtime \+ Expo Notifications — complex, working stack. |
| Innovation & Creativity | 15 | Floating AI Companion \+ barrier detection \+ verse emotional matching is genuinely new in FaithTech. |
| Effective Use of APIs | 15 | All 10 Quran Foundation APIs used with clear purpose, not token integrations. |

 

| ��� Pitch Line | Maqam keeps your Ramadan community and reading habit alive year-round — using AI to understand why you stopped, and your circle to bring you back. |
| :---- | :---- |

 

Maqam  •  PRD v1.0  •  April 2026

*Built for the Quran Foundation Hackathon by Provision Launch*  
