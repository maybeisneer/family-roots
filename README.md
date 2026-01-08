# Family Roots

Capture and preserve your family's stories through AI-guided video interviews. A gift for generations to come.

## Features

- **AI-Guided Questions** - Gemini AI generates thoughtful follow-up questions based on responses
- **Multi-Language Support** - 24 languages with native name display
- **Free Transcription** - Uses Web Speech API (browser-based, no cost)
- **Video Recording** - Blurred self-view so interviewees focus on the story, not themselves
- **Family Playback** - Beautiful video player with synced transcripts

## Tech Stack

- **Next.js 14** - App Router, React Server Components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Firebase** - Database (Firestore) & Storage
- **Google Gemini** - AI question generation
- **Web Speech API** - Free browser-based transcription

## Getting Started

### 1. Clone and Install

```bash
git clone <repo>
cd family-roots
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database** (start in test mode for development)
4. Enable **Storage** (start in test mode)
5. Go to Project Settings > General > Your apps > Add web app
6. Copy your config values

### 3. Environment Variables

Create a `.env.local` file:

```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Transcription

This app uses the **Web Speech API** for transcription, which:

- ✅ Works in Chrome, Edge, and Safari
- ✅ Completely free (no API costs)
- ✅ Supports multiple languages
- ✅ Real-time transcription while recording
- ⚠️ Requires internet connection (audio processed by browser vendor)
- ⚠️ Not supported in Firefox

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── setup/                # 5-step setup wizard
│   ├── interview/[code]/     # Recording interface
│   ├── watch/[code]/         # Playback interface
│   └── api/                  # API routes
├── components/
│   ├── setup/                # Setup wizard components
│   ├── recording/            # Recording UI components
│   └── playback/             # Video player components
├── lib/
│   ├── firebase.ts           # Firebase client
│   ├── gemini.ts             # AI question generation
│   ├── speech.ts             # Web Speech API wrapper
│   ├── questions.ts          # Question bank
│   └── storage.ts            # Local storage helpers
└── types/
    └── index.ts              # TypeScript types
```

## License

MIT
