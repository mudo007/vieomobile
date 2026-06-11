# Dependencies

Project dependencies should be installed through Expo where possible so versions resolve against the active Expo SDK.

The current local Creator and Follower vertical slices use a small number of Expo runtime modules plus the test stack.

## Test dependencies

Install Jest, the Expo Jest preset, Jest TypeScript types, and React Native Testing Library:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install jest-expo jest @types/jest @testing-library/react-native --dev
```

Verify the dependencies landed in `package.json`:

```zsh
rg 'jest-expo|@testing-library/react-native|"jest"|"@types/jest"' package.json
```

Expected packages:

```json
"@testing-library/react-native"
"@types/jest"
"jest"
"jest-expo"
```

## OTA dependency

Install `expo-updates` when starting the OTA showcase:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-updates
```

Then configure EAS Update:

```zsh
eas update:configure
```

See `docs/ota-updates.md` for the full flow.

## iOS Simulator tooling

If `open -a Simulator` does not open a usable simulator, or `xcrun simctl list devices available` returns no devices, finish Xcode's local setup and install the iOS simulator platform:

```zsh
sudo xcodebuild -license accept
sudo xcodebuild -runFirstLaunch
xcodebuild -downloadPlatform iOS
```

Verify that runtimes, device types, and devices are available:

```zsh
xcrun simctl list runtimes available
xcrun simctl list devicetypes available
xcrun simctl list devices available
```

If devices are still empty, create one from Xcode:

```zsh
open -a Xcode
```

Then use:

```text
Xcode > Settings > Platforms
Xcode > Window > Devices and Simulators > Simulators > +
```

After a simulator exists, run the downloaded EAS simulator build:

```zsh
open -a Simulator
eas build:run --platform ios
```

### Seed simulator videos

The iOS Simulator starts with an empty Photos library. Add videos before testing the Creator picker.

Option 1: download videos from Safari inside the Simulator:

```zsh
open -a Simulator
xcrun simctl openurl booted "https://samplelib.com/sample-mp4.html"
```

In the Simulator, open a sample `.mp4`, long-press the video, choose `Save Video`, and repeat for a second sample.

Verify Photos has videos:

```zsh
xcrun simctl launch booted com.apple.mobileslideshow
```

Option 2: add local videos from your Mac:

```zsh
xcrun simctl addmedia booted /absolute/path/to/video1.mp4
xcrun simctl addmedia booted /absolute/path/to/video2.mov
```

Example:

```zsh
xcrun simctl addmedia booted ~/Downloads/sample-5s.mp4
```

## Expo native libraries

See `docs/expo-libraries.md` for the library decision record.

Current native modules for media plumbing:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-image-picker
npx expo install expo-video
```

Verify:

```zsh
rg 'expo-image-picker|expo-video|expo-image' package.json package-lock.json
```

Notes:

- `expo-image-picker` opens the system media library for Creator video selection.
- `expo-video` generates local video thumbnails and will later be used for playback.
- `expo-image` renders thumbnail sources, including native image references returned by `expo-video`.
- Adding or removing native modules requires a new native build before OTA updates can rely on those modules.

## Future native dependencies

Do not install other native Expo modules until the fake vertical slices, presentation design, OTA update showcase, and Creator picker plumbing are validated.

Likely future candidates:

- `expo-media-library` only if a custom duplicate-filtering media browser becomes necessary.
- `expo-file-system` only if URI pointers are too fragile and app-owned video copies are required.

Install those with `npx expo install ...` when the project reaches the native integration pass.
