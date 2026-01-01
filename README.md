# CrowdTuner

AI-powered TV calibration assistant that helps you get the perfect picture on any TV.

## Features

- **AI-First Calibration**: Works with any TV from day one, even if we've never seen that model before
- **Conversational Guidance**: AI explains what it sees and why it recommends changes
- **Checkpoint System**: Every settings change is saved; you can always go back
- **Subjective Feedback**: AI asks how it *looks* to you, not just if the pattern is correct
- **Crowd Learning**: Successful calibrations improve recommendations for future users

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Google Gemini 1.5 Pro Vision
- **Camera**: react-native-vision-camera

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crowdtuner.git
cd crowdtuner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the schema from `supabase/migrations/001_initial_schema.sql`
   - Add your project URL and anon key to `.env`

5. Start the development server:
```bash
npm start
```

6. Run on Android:
```bash
npm run android
```

## Project Structure

```
crowdtuner/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/           # Screen components
│   │   ├── home/          # Home screen
│   │   ├── calibration/   # Calibration flow screens
│   │   └── onboarding/    # Onboarding screens
│   ├── navigation/        # Navigation configuration
│   ├── store/             # Zustand state management
│   ├── lib/               # External service clients
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── prompts/           # AI prompt templates
├── supabase/
│   ├── migrations/        # Database schema
│   └── functions/         # Edge functions
├── assets/                # Static assets
└── App.tsx                # App entry point
```

## Calibration Flow

1. **Identify TV**: Scan label or enter model number
2. **Environment**: Describe room lighting, windows, viewing distance
3. **Baseline**: Enter current picture settings
4. **Pattern Loop**:
   - Display test pattern on TV
   - Capture with phone camera
   - AI analyzes and recommends changes
   - User adjusts and provides feedback
   - Repeat until satisfied
5. **Complete**: Save successful calibration to help future users

## Key Screens

- `HomeScreen`: Mode selection (Quick Fix vs Full Calibration)
- `TVIdentifyScreen`: TV model identification
- `EnvironmentScreen`: Room setup questionnaire
- `SettingsEntryScreen`: Current TV settings input
- `PatternDisplayScreen`: Test pattern delivery
- `CaptureScreen`: Camera capture interface
- `ResultsScreen`: AI analysis and recommendations
- `CheckpointHistoryScreen`: Settings rollback interface
- `SessionCompleteScreen`: Summary and feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
