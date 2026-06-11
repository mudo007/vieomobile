# Data Layer Choices

The native integration pass will keep the data layer intentionally small. The goal is to demonstrate clean adapter boundaries, not to build a production video backend.

See `docs/expo-libraries.md` for the Expo modules that support this strategy.

## Video Storage Strategy

Use URI pointers first.

When the Creator flow picks a video from the device library, the app stores metadata such as:

```ts
{
  id: string;
  title: string;
  description: string;
  sourceUri: string;
  assetId?: string;
  fileName?: string;
  mimeType?: string;
  durationMs?: number;
  sizeBytes?: number;
}
```

The app does not copy video bytes into JavaScript memory. It records a native URI pointer returned by the picker and later gives that URI to the player.

Tradeoff:

- URI pointers are fast, simple, and good enough for this showcase.
- They can become invalid if the user deletes the source media or revokes permissions.
- Copying into app-owned storage would be more durable but adds disk usage, cleanup rules, and file-system error paths.

## Duplicate Detection

The system media picker cannot be told to gray out or hide videos that the app already uploaded. The app will allow selection, then reject the duplicate after the picker returns.

Duplicate key rule:

```text
if assetId exists:
  duplicate key = assetId
else:
  duplicate key = uri + fileName + sizeBytes + durationMs
```

This is not perfect, but it is pragmatic for a learning showcase. It catches the common case without requiring a custom media browser.

The Creator state machine will model this as `duplicateFound` instead of a generic failure. That lets the presentation show a recoverable warning such as "This video is already in your feed" and offer a clear "Pick another video" action.

## Local Backend Shape

Use an in-memory repository first.

```text
Creator picker adapter
  -> returns SelectedVideo from Expo ImagePicker

Creator upload use case
  -> checks duplicate key
  -> stores UploadedVideo metadata in LocalUploadedVideoRepository

Follower feed adapter
  -> reads LocalUploadedVideoRepository
  -> renders feed cards

Follower player
  -> plays sourceUri from stored metadata
```

This repository behaves like a tiny local backend shared by Creator and Follower flows. It will not persist across app restarts. Persistence can be added later with AsyncStorage or SQLite if the demo needs it.

## Current Implementation Status

Creator-side plumbing is implemented:

- `ExpoVideoPicker` opens the system media picker and maps native results into `SelectedVideo`.
- `pickCreatorVideo` checks the repository after selection and emits `duplicateVideoPicked` when needed.
- `uploadCreatorVideo` still uses the fake uploader for progress/cancel testing, then saves uploaded metadata into the in-memory repository.
- `CreatorUploadScreen` renders `duplicateFound` as a recoverable warning with a "Pick another video" action.

Follower-side read plumbing is still pending:

- Replace the fake feed source with a feed adapter that reads the in-memory repository.
- Preserve fake/static seed videos only if the repository is empty.
- Later, replace the fake fullscreen player with `expo-video`.
