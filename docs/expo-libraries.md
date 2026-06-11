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

## Planned Native Modules

### `expo-video`

Purpose: Follower playback for URI-based videos.

Install later, when replacing the fake fullscreen player:

```zsh
npx expo install expo-video
```

Usage boundary:

- Keep player component details in presentation or a presentation adapter.
- Keep play/pause/seek internals owned by `expo-video`, unless the app needs business rules around playback.
- Feed/domain state should model app-level intent, such as `playing` or `closeVideo`, not low-level player controls.

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
