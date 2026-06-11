# Expo Libraries

This project uses Expo native libraries only where the demo needs real device behavior. Native dependencies are important because they define the binary boundary: JavaScript and styling can move through OTA, but new native modules require a new build.

Install Expo modules with `npx expo install ...` so versions match the active Expo SDK.

## Used Modules

### `expo-image-picker`

Purpose: open the system media picker for Creator video selection.

Install:

```zsh
cd ~/Repos/videomobile
npx expo install expo-image-picker
```

Implementation:

- Adapter: `src/adapters/expo/expo-video-picker.ts`.
- Maps native picker results into `SelectedVideo`.
- Returns app-level results such as `videoSelected`, `permissionDenied`, `cancelled`, or `unsupportedVideo`.

Important behavior:

- The system picker cannot hide videos that were already uploaded by this app.
- Duplicate detection happens after selection, in application/repository plumbing.
- The app stores URI pointers and metadata, not video bytes in JavaScript memory.

### `expo-video`

Purpose: generate local thumbnails and play videos inline in the Follower feed.

Install:

```zsh
cd ~/Repos/videomobile
npx expo install expo-video
```

Implementation:

- Thumbnail adapter: `src/adapters/expo/expo-video-thumbnail-generator.ts`.
- Player presentation: `src/presentation/follower/follower-feed-screen.tsx`.
- `FollowerFeedScreen` renders `VideoView` inline inside the selected card's media frame.
- `VideoView` keeps native controls enabled and passes `fullscreenOptions={{ enable: true, orientation: 'default' }}`.
- Route exits and tab blur events dispatch `closeVideo`, unmounting `VideoView` so audio stops.

Important behavior:

- Creating a `VideoPlayer` directly means the adapter must call `release()`.
- Pass thumbnail times as an array. The SDK 54 iOS bridge path can crash when a scalar number is cast into the native array argument.
- Create the player empty, call `replaceAsync`, then generate thumbnails. Generating immediately after constructing a sourced player can return an empty array because the native item is not attached yet.
- Thumbnail generation is optional decoration. If it fails, upload still succeeds and the feed card falls back to the placeholder frame.
- Expo Go and simulator/preview builds use the same thumbnail adapter.

### `expo-image`

Purpose: render feed card thumbnails.

Install:

```zsh
cd ~/Repos/videomobile
npx expo install expo-image
```

Implementation:

- Presentation uses `expo-image` for feed thumbnails.
- It accepts URI image sources and native image references returned by `expo-video`.

### `expo-updates`

Purpose: demonstrate EAS Update for compatible JavaScript/assets changes.

Install and configure:

```zsh
cd ~/Repos/videomobile
npx expo install expo-updates
eas update:configure
```

Implementation:

- `app.json` contains `runtimeVersion` and `updates.url`.
- `eas.json` defines `preview`, `preview-simulator`, and `production` channels.
- The demo-visible OTA change is `APP_DEMO_VERSION` in `src/presentation/shared/app-version.ts`.

See `docs/ota-updates.md` for the complete build/update flow.

## Debugging

Thumbnail diagnostics are disabled by default. Enable them only when debugging media plumbing:

```zsh
printf 'EXPO_PUBLIC_MEDIA_DEBUG=true\n' > .env.local
npx expo start -c -g --lan
```

Disable them by deleting `.env.local` or setting `EXPO_PUBLIC_MEDIA_DEBUG=false`.

Expo Go shows those logs in the Metro terminal. For simulator builds, stream only app media diagnostics:

```zsh
xcrun simctl spawn booted log stream --style compact --level info \
  --predicate 'eventMessage CONTAINS[c] "[VideoShare media]"'
```

## OTA Boundary

Safe OTA changes:

- TypeScript business logic.
- React Native screens.
- Styling and copy.
- Adapter logic that uses native modules already present in the installed binary.

Not safe as OTA-only changes:

- Adding or removing native Expo modules.
- Changing native permissions.
- Changing config plugins.
- Changing Expo SDK version.
- Changing native app version/build metadata.

After changing native dependencies or native configuration, create a fresh preview build before testing OTA updates that depend on those changes.
