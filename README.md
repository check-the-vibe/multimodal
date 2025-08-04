MultiModal (Expo)

- Minimal Expo app showcasing audio/video input and output, image picking, and TTS stubs.
- SDK: `expo@~53`, RN `0.79`, React `19`.

Getting Started

- Install deps: `npm install`
- Start dev server: `npm start`
- Open platforms: `npm run android` / `npm run ios` / `npm run web`

Installed Modules

- expo-av: Audio/video playback and recording
- expo-video: Modern video component for playback
- expo-camera: Photo/video capture, scanning
- expo-image-picker: Pick media from device library
- expo-media-library: Access/save to photo library
- expo-file-system: File I/O utilities
- expo-speech: Text-to-speech

App Usage

- **3-Second Loading Screen**: App displays a centered logo and "Loading..." text for exactly 3 seconds on startup
- **Home Screen** (Chat-First Interface):
  - **Stacked Swipeable UI**: Two main sections with smooth animations and visual depth
    - **Input Section** (Top/Left): Swipe between text, audio, photo, and video inputs
    - **Output Section** (Bottom/Right): Swipe between chat, TTS, and image outputs
  - **Enhanced Visual Effects**: Cards scale and fade with smooth animations during swipe
  - **Smart Send Functionality**: Routes any input type to any output type with appropriate formatting
  - **Debug Actions**: Compact buttons for Probe Modules, Test TTS, and Pick Media
  
- **Input Modalities**:
  - **Text**: Standard text input with keyboard
  - **Audio**: Tap to start/stop recording (uses device microphone)
  - **Photo**: Capture photo with camera or pick from gallery
  - **Video**: Record video with camera
  
- **Output Modalities**:
  - **Chat**: Displays messages with emoji indicators for media types
  - **TTS**: Speaks text or announces received media type
  - **Image**: Shows last captured/picked photo
  
- **Visual Enhancements**:
  - Stacked card effect with depth perception
  - Smooth opacity and scale transitions
  - Rounded corners and subtle shadows
  - Responsive layout for portrait/landscape

Media Sources

- Audio: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`
- Video: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`

Notes

- iOS silent switch: Audio playback is configured to play in silent mode (best-effort via `Audio.setAudioModeAsync`), but device volume and Focus modes still apply.
- Web: Playback depends on browser autoplay policies; click interaction may be required.

Testing

- Jest preset: `jest-expo`
- Run tests: `npm test`
- Smoke tests live in `__tests__/smoke.test.ts` and validate basic render + module imports.

iOS Permissions (add as needed)

- Add the following to `app.json > expo > ios > infoPlist` when enabling features:
  - NSCameraUsageDescription
  - NSMicrophoneUsageDescription
  - NSPhotoLibraryUsageDescription (and possibly NSPhotoLibraryAddUsageDescription)

Troubleshooting

- Stuck splash screen: Ensure `SplashScreen.hideAsync()` runs after layout; see `App.tsx`.
- Image picker errors on iOS: Verify photo library permissions in `app.json` and approve at runtime.
- Module import failures: Confirm modules are installed via `npx expo install <pkg>`; run `npm install` after branch switches.
- No audio heard: Ensure output volume is up; on iOS, disable silent mode or trust the app’s `playsInSilentModeIOS` setting; try headphones. Some emulators/simulators default to muted audio.

Team Tmux Helpers

- Bootstrap windows: `bash scripts/team_tmux.sh init`
- Kickoff role prompts: `bash scripts/team_tmux.sh kickoff`
- Send a message: `bash scripts/team_tmux.sh send integrator "Run expo install ..."`
  - Tail output: `bash scripts/team_tmux.sh capture integrator`

Docs

- Migration: `.vibe/docs/expo-av-to-expo-video.md`
- Core interface: `.vibe/docs/core-interface.md`
