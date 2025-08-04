# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multimodal Expo application showcasing audio/video input and output capabilities. It's built with:
- Expo SDK ~53
- React Native 0.79
- React 19
- TypeScript with strict mode enabled

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm start` - Start development server
- `npm run android` - Open on Android
- `npm run ios` - Open on iOS
- `npm run web` - Open in web browser

### Development Servers with Specific Options
- `npm run dev:tunnel` - Start with tunnel (port 8081)
- `npm run dev:web` - Start web server (port 8081)
- `npm run dev:tunnel:clean` - Clear cache and start with tunnel
- `npm run dev:web:clean` - Clear cache and start web server

### Code Quality
- `npm test` - Run Jest tests (using jest-expo preset)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Architecture

### Core Components Structure
The app implements a modular input/output system with the following architecture:

- **Main App (`App.tsx`)**: Orchestrates the UI with three tabs (Home, Inputs, Outputs) and manages global state for modality selections
- **Input Modalities** (`components/modality/input/`): Text, Audio, Photo, and Video input cards
- **Output Modalities** (`components/modality/output/`): Chat panel, TTS panel, and Image display panel
- **UI Components** (`components/ui/`): Reusable UI elements including StackPager for swipeable cards and PaginationDots
- **Navigation** (`components/nav/`): TabsBar component for screen navigation

### Key Expo Modules
The app dynamically imports and uses these Expo modules:
- `expo-av` / `expo-audio`: Audio recording and playback (migrating to expo-audio)
- `expo-video`: Modern video playback component
- `expo-camera`: Camera access for photos/videos
- `expo-image-picker`: Media selection from device library
- `expo-speech`: Text-to-speech functionality
- `expo-media-library`: Access to device photo library
- `expo-file-system`: File I/O operations

### State Management
- Uses React hooks for local state management
- Input/Output modalities can be enabled/disabled and connected/disconnected
- Selected input/output tracked via indices for the swipeable interface

## Important Configuration

### Code Style
- Prettier configuration: single quotes, trailing commas, 100 char line width
- ESLint with TypeScript and Expo configurations
- TypeScript strict mode is enabled

### iOS Permissions
When enabling features, add to `app.json > expo > ios > infoPlist`:
- NSCameraUsageDescription
- NSMicrophoneUsageDescription
- NSPhotoLibraryUsageDescription

### Testing
Tests use Jest with jest-expo preset. Smoke tests validate basic rendering and module imports.

## Key Implementation Notes

- Splash screen handling is managed in `App.tsx` with proper async hide after layout
- Audio playback configured to work in silent mode on iOS (best-effort)
- Dynamic module imports used to avoid test environment issues
- Video playback uses the new `expo-video` API (not the deprecated expo-av Video component)
- All file paths in commands must use absolute paths, not relative