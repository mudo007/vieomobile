# Dependencies

Project dependencies should be installed through Expo where possible so versions resolve against the active Expo SDK.

The current fake Creator and Follower vertical slices do not require additional runtime dependencies beyond the Expo scaffold. The testing stack is the important added dependency group for this phase.

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

## Expo native libraries

See `docs/expo-libraries.md` for the library decision record.

Current native module for the Creator plumbing:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-image-picker
```

Verify:

```zsh
rg 'expo-image-picker' package.json package-lock.json
```

## Future native dependencies

Do not install other native Expo modules until the fake vertical slices, presentation design, OTA update showcase, and Creator picker plumbing are validated.

Likely future candidates:

- `expo-video` for Follower playback.
- `expo-media-library` only if a custom duplicate-filtering media browser becomes necessary.
- `expo-file-system` only if URI pointers are too fragile and app-owned video copies are required.

Install those with `npx expo install ...` when the project reaches the native integration pass.
