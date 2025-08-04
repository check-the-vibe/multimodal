Title: Core Interface POC (Inputs/Outputs)

Overview
- Adds a simple 3-tab interface: Home, Inputs, Outputs.
- Home shows two swipeable sections to select an Input and an Output, with a “Send” action to pass input → output.
- Inputs and Outputs screens let users enable/disable and connect/disconnect each modality.

Inputs
- text: Simple TextInput.
- audio: Start/Stop recording using `expo-av` (stores last recording URI).
- photo: Take a photo via `expo-image-picker.launchCameraAsync()`.
- video: Record a short video via `expo-image-picker.launchCameraAsync()`.

Outputs
- chat: Appends a message to a basic chat list (mirrors the incoming input description or text).
- tts: Speaks the text (or a short description) via `expo-speech`.
- image: Displays the last captured/picked photo (if available).

Notes
- Video playback uses `expo-video` (`VideoView` + `useVideoPlayer`), documented in `expo-av-to-expo-video.md`.
- Audio playback demo remains on Home using `expo-av` Sound; consider migrating to `expo-audio` later.

Controls
- Tabs (top): Home, Inputs, Outputs.
- Home: Swipe horizontally to switch modalities for Inputs or Outputs.
- Send: Executes a minimal pass-through from selected Input → selected Output.

Known Limitations
- No persistent state across reloads; all settings are in-memory.
- “Image output” only shows the last photo (no image generation).
- Recording UX is a stub; no waveform/UI, just a toggle.

Dev Server
- Run `npm run dev:tunnel` (or `npm start`) to test; press `w` to open Web.

