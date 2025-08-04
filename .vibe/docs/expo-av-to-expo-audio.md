Title: Migrate audio from expo-av to expo-audio

Summary
- Switches audio playback and recording from `expo-av` to the new `expo-audio` package introduced around SDK 53.
- Keeps a runtime fallback to `expo-av` for environments where `expo-audio` is unavailable.

Why
- `expo-av` is deprecated; audio and video were split into `expo-audio` and `expo-video`.
- `expo-audio` provides a modern API: `createAudioPlayer`, `AudioRecorder`, `setAudioModeAsync`, and React hooks.

What Changed
- Installed `expo-audio` and added its config plugin to `app.json` (plugins include `expo-audio`).
- `App.tsx`: implemented a small adapter that prefers `expo-audio` for:
  - Playback: `createAudioPlayer({ uri })`, `play()`, `pause()`, `seekTo(0)` for stop.
  - Recording: `new AudioModule.AudioRecorder({})`, `prepareToRecordAsync({})`, `record()`, `stop()`.
  - Audio mode: `setAudioModeAsync()` from `expo-audio` when present.
- Fallback: if `expo-audio` import fails, reuse the existing `expo-av` logic for Sound/Recording.

API Notes (expo-audio)
- Player:
  - `createAudioPlayer(source)` returns `AudioPlayer` with `.play()`, `.pause()`, `.seekTo(seconds)` and event `PLAYBACK_STATUS_UPDATE`.
  - Status hook: `useAudioPlayerStatus(player)` (not used to keep tests simple).
- Recorder:
  - `AudioModule.AudioRecorder` class supports `prepareToRecordAsync(options)`, `record()`, `stop()`, `uri`.
  - Permissions: `requestRecordingPermissionsAsync()`.
- Mode:
  - `setAudioModeAsync(Partial<AudioMode>)`; on iOS/Android mapping is handled internally.

Testing
- The app dynamically imports `expo-audio`, so Jest can run without native shims.
- Smoke tests still validate module resolution and basic render.

Next Steps
- Replace legacy `expo-av` code paths once we confirm all features on target platforms.
- Add a minimal waveform or level meter using `useAudioSampleListener`.

