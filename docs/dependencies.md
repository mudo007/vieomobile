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

## Future native dependencies

Do not install other native Expo modules until the fake vertical slices, presentation design, and OTA update showcase are validated.

Likely future candidates:

- Expo media picker for the Creator picker adapter.
- Expo AV or the currently recommended Expo video package for Follower playback.

Install those with `npx expo install ...` when the project reaches the native integration pass.
