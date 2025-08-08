Title: Migrate video from expo-av to expo-video

Summary
- Replaced deprecated `expo-av` <Video/> usage with `expo-video`’s `useVideoPlayer` + `VideoView`.
- Keeps `expo-av` for audio playback for now; plan future migration to `expo-audio`.

Why
- Metro logs warned: "[expo-av]: Video component from `expo-av` is deprecated in favor of `expo-video`."
- SDK 53 deprecates video in `expo-av`; SDK 54 removes it. `expo-video` offers better API + PiP.

What Changed
- App.tsx: `LazyVideo` now uses `useVideoPlayer({ uri })` and renders `<VideoView />` with `nativeControls`, `contentFit="contain"`, and PiP/fullscreen enabled.
- Removed dynamic import of `expo-av` for video; this avoids the deprecation warning at runtime.

Code Notes
- New imports: `import { VideoView, useVideoPlayer } from 'expo-video'`.
- Player setup:
  - Looping: `player.loop = true`.
  - Autoplay: `player.play()` inside the `useVideoPlayer` setup callback.
- View props used:
  - `nativeControls`: show platform controls
  - `contentFit`: `'contain' | 'cover' | 'fill'`
  - `allowsFullscreen`, `allowsPictureInPicture`
  - Optional callbacks: `onFirstFrameRender`, `onFullscreenEnter/Exit`, `onPictureInPictureStart/Stop`

What Stayed
- Audio playback still uses `expo-av`’s `Audio.Sound` for a streaming MP3 demo. This is fine short‑term.

Next (Optional)
- Consider migrating audio to `expo-audio` when ready:
  - Playback and recording split out of `expo-av`.
  - Validate availability for current SDK (53) and update code incrementally.

Testing
- Dev server: `npm run dev:tunnel` (already running in tmux `expo-server:server`).
- Verify Metro logs no longer show the `expo-av Video` deprecation warning after hot reload.
- Web: Press `w` in the server terminal or run `npm run dev:web` for a quick check.

Troubleshooting
- If Metro caches stale modules: `npm run dev:tunnel:clean`.
- If PiP/fullscreen controls are missing, ensure `plugins: ["expo-video"]` is present in `app.json` (it is) and app is a dev build for full native behavior.

