# Expo Libraries

This project should add native Expo libraries only when a milestone needs real device behavior. Every native dependency can affect build compatibility, Expo Go support, permissions, and OTA boundaries.

Install Expo modules with `npx expo install ...` so versions match the active Expo SDK.

## Current Native Modules

### `expo-image-picker`

Purpose: Creator video selection from the system media library.

Install:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-image-picker
```

Usage boundary:

- Keep direct `expo-image-picker` imports inside an adapter.
- Map picker results into `SelectedVideo`.
- Return domain/application results such as `videoSelected`, `permissionDenied`, `cancelled`, or `unsupportedVideo`.
- The active adapter is `src/adapters/expo/expo-video-picker.ts`.

Important behavior:

- The system picker cannot hide or disable videos that were already uploaded by this app.
- Duplicate detection happens after selection, in application/repository plumbing.
- The app stores URI pointers and metadata, not video bytes in JavaScript memory.
- iOS video access may require media-library permission before or immediately after picking, depending on picker options.

### `expo-video`

Purpose: local video thumbnail generation and Follower inline playback.

Install:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-video
```

Usage boundary:

- Keep direct `expo-video` imports inside adapters or player presentation code.
- `ExpoVideoThumbnailGenerator` creates a `VideoPlayer` from the picked video URI, calls `generateThumbnailsAsync`, and releases the player.
- The thumbnail returned by `expo-video` is a native image reference, not a persistent file URI.
- Render native thumbnail references with `expo-image`.
- Keep player component details in presentation or a presentation adapter.
- `FollowerFeedScreen` renders `VideoView` inline inside the selected card's media frame.
- Keep play/pause/seek internals owned by `expo-video`, unless the app needs business rules around playback.
- Feed/domain state should model app-level intent, such as `playing` or `closeVideo`, not low-level player controls.

Important behavior:

- Creating a `VideoPlayer` directly means we must call `release()`; the adapter test covers that cleanup.
- Pass thumbnail times as an array, even though the TypeScript API accepts a scalar. The SDK 54 iOS bridge path can crash while casting a scalar number into the native array argument.
- Create the player empty, call `replaceAsync`, then generate thumbnails. Calling thumbnail generation immediately after constructing a sourced player can return an empty array because the native `AVPlayerItem` is not attached yet.
- Thumbnail generation is optional decoration. If it fails in the use case, the upload still succeeds and the feed card falls back to the placeholder frame.
- Expo Go and simulator/preview builds use the same thumbnail adapter now that the SDK 54 scalar-argument crash is avoided.
- Since `expo-video` is a native module, this change requires a new preview build before OTA updates can depend on it.

Debugging:

- The thumbnail path can log compact diagnostics with the `[VideoShare media]` prefix.
- Logging is disabled by default. Enable it through a local, gitignored env file:

```zsh
printf 'EXPO_PUBLIC_MEDIA_DEBUG=true\n' > .env.local
npx expo start -c -g --lan
```

- Disable it by deleting `.env.local` or setting `EXPO_PUBLIC_MEDIA_DEBUG=false`.
- Expo Go shows those logs in the Metro terminal.
- For simulator builds, stream only these app diagnostics:

```zsh
xcrun simctl spawn booted log stream --style compact --level info \
  --predicate 'eventMessage CONTAINS[c] "[VideoShare media]"'
```

### `expo-image`

Purpose: render feed card thumbnails.

Install:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install expo-image
```

Usage boundary:

- Keep image rendering in presentation.
- It accepts URI image sources and native image references from `expo-video`.

## Planned Native Modules

### `expo-media-library`

Purpose: optional custom media browser or richer asset metadata.

Do not install yet.

Use this only if the system picker becomes insufficient. Examples:

- We need to list the user's videos inside our own screen.
- We need to filter duplicates before the user can tap them.
- We need more control over albums, pagination, or asset metadata.

Tradeoff: this gives more control but creates more UI work, permission handling, pagination, and edge cases.

### `expo-file-system`

Purpose: optional app-owned video copies.

Do not install yet.

Use this only if URI pointers become too fragile. Examples:

- Picked gallery URI stops working after app restart.
- User deletes the original media and the demo needs uploaded videos to survive.
- We decide to simulate a real ingest pipeline by copying files into app storage.

Tradeoff: this duplicates large video files and requires cleanup, disk-space handling, and more failure paths.

### Local persistence

The first local backend should be an in-memory repository.

Do not install persistence yet.

Later options:

- `@react-native-async-storage/async-storage` for simple metadata persistence.
- `expo-sqlite` for relational local state or richer queries.

For this showcase, persistence is optional. In-memory storage keeps the adapter boundary clear and avoids hiding native-media problems behind storage complexity.

## OTA Boundary

Adding a new native Expo library requires a new binary build. It cannot be delivered only through EAS Update.

Safe OTA changes:

- TypeScript business logic.
- React Native screens.
- Styling and copy.
- Adapter logic that uses native modules already present in the installed binary.

Not safe as OTA-only changes:

- Adding `expo-image-picker`, `expo-video`, `expo-media-library`, or `expo-file-system`.
- Changing native permissions.
- Changing config plugins.
- Changing Expo SDK version.

After adding a native library, create a fresh preview build before testing OTA updates that depend on that library.
