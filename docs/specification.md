# Specification

This project is a throwaway learning showcase for React Native with Expo.

Its purpose is not to prove production mobile mastery. Its purpose is to show a deliberate senior learning process: isolate business logic, use TDD where it gives fast feedback, validate native seams on a device/simulator, and demonstrate Expo OTA delivery without overbuilding the backend.

References:

- [React Native testing overview](https://reactnative.dev/docs/testing-overview)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [Expo EAS Update](https://docs.expo.dev/eas-update/introduction/)

## Goal

Build a minimal Expo app with two personas:

- **Creator** picks a real video from the device library, enters metadata, sees fake upload progress, and stores the upload in a local in-memory feed.
- **Follower** browses the local feed, sees generated thumbnails, and plays a selected video inline using the native Expo video player.

The app also demonstrates EAS Update with a harmless JavaScript-only version label change.

## Non-Goals

- No real authentication.
- No production media ingest pipeline.
- No remote backend.
- No durable persistence across app restarts.
- No custom media browser.
- No attempt to prove native correctness with only Node/Jest tests.
- No heavy DDD ceremony beyond useful boundaries.

## Final Product Scope

### Creator

Implemented behavior:

- Enter Creator from Home.
- Open the system media picker.
- Select a real video from the device library.
- Reject duplicate selections after the picker returns.
- Enter title and description.
- Validate required title.
- Confirm upload.
- Show fake upload progress so cancellation can be tested manually.
- Generate a thumbnail with `expo-video`.
- Save metadata, URI pointer, and thumbnail reference in an in-memory repository.
- Return Home after upload completion.

### Follower

Implemented behavior:

- Enter Follower from Home.
- Load videos from the shared in-memory repository.
- Render empty feed when no uploads exist.
- Render uploaded video cards with metadata and thumbnails.
- Pull down to refresh with a delayed fake refresh adapter.
- Tap a card to play video inline in the card media frame.
- Use native player controls, including fullscreen.
- Close playback on `Back home`, Home tab navigation, or Creator tab navigation.

### OTA

Implemented behavior:

- `expo-updates` installed and configured.
- `preview` and `preview-simulator` EAS channels configured.
- Demo change uses `APP_DEMO_VERSION` in `src/presentation/shared/app-version.ts`.
- Docs explain Free-plan caveats, no committed secrets, and native-change boundaries.

## Architecture

The final structure is intentionally small:

```text
src/
  app/            Expo Router routes and tab composition
  domain/         pure TypeScript state machines and domain types
  use-cases/      application ports and use cases
  adapters/       fake, in-memory, and Expo implementations
  presentation/   React Native screens, hooks, and visual tokens
```

Boundary rules:

- `src/domain` imports no React, React Native, Expo, or adapter modules.
- `src/use-cases` depends on ports and domain events, not concrete Expo APIs.
- `src/adapters` translates fake, in-memory, or Expo behavior into port contracts.
- `src/presentation` renders state, dispatches user intent, and owns React Native concerns.
- `src/app` wires routes to concrete adapters.

This gives the project clean seams without pretending it needs enterprise-scale layering.

## Testing Strategy

TDD was applied most heavily where it is strongest:

- Domain reducer tests for state transitions and invalid events.
- Use-case tests for adapter result mapping, validation, duplicate detection, upload, thumbnail handoff, and feed loading.
- Adapter tests for fake progress, delayed refresh, in-memory repository/feed mapping, and Expo thumbnail cleanup behavior.
- React Native Testing Library tests for screen states and user-visible interactions.
- Route tests for Home, Creator, Follower, and playback cleanup on route blur.

The local readiness gate is:

```zsh
npm run ci
```

That runs lint, TypeScript, and Jest.

Important testing boundary:

- Node/Jest tests prove business rules and render behavior.
- Device/simulator smoke tests prove system picker, media URIs, thumbnails, playback, fullscreen, and OTA behavior.

## Key Design Choices

### Core-first TypeScript

The app was modeled first with pure TypeScript reducers, events, and use cases. React Native screens sit on top of those rules rather than owning them.

This follows the React Native testing guideline of separating business logic/app state from view rendering.

### Reducers Instead Of Classes

Finite state machines are modeled as discriminated unions plus reducer functions. This keeps transitions explicit, type-checkable, and easy to test without mutable class state.

### Ports And Adapters

Use cases depend on ports such as:

- `VideoPickerPort`
- `VideoUploaderPort`
- `VideoThumbnailGeneratorPort`
- `UploadedVideoRepositoryPort`
- `FollowerFeedPort`

Concrete implementations can be fake, in-memory, or Expo-backed.

### URI Pointers Instead Of File Copies

The app stores URI pointers returned by the picker, not copied video bytes.

Tradeoff:

- Simple and enough for the demo.
- Avoids disk cleanup and file-system error handling.
- Can become invalid if the original media is deleted or permissions change.

That risk is acceptable because this is a throwaway showcase, not a production gallery.

### Duplicate Detection After Picking

The system picker cannot disable already-uploaded videos. The app detects duplicates after selection.

Duplicate key rule:

```text
if assetId exists:
  duplicate key = assetId
else:
  duplicate key = uri + fileName + sizeBytes + durationMs
```

This is pragmatic and avoids building a custom media browser.

### Fake Upload, Real Picker/Thumbnail/Playback

The upload adapter stays fake because real upload infrastructure is outside the learning goal.

The picker, thumbnail generation, feed rendering, and video playback use real Expo/device behavior because those are the mobile-specific seams worth validating.

### In-Memory Local Backend

Creator uploads and Follower feed share a single in-memory repository.

This behaves like a tiny local backend during one app session. It intentionally does not persist across app restarts.

### Native Playback Ownership

The app tracks only the selected playing card. Low-level player controls such as play, pause, seek, and fullscreen are delegated to `expo-video`.

App state still handles route-level intent: when the user leaves Follower, dispatch `closeVideo` so the player unmounts and audio stops.

### OTA Scope

OTA updates are used for compatible JavaScript/assets changes only.

Safe examples:

- Text and styling.
- Screen logic.
- Pure TypeScript rules.
- Adapter logic using native modules already present in the installed build.

Not safe as OTA-only changes:

- Adding native libraries.
- Changing permissions.
- Changing Expo SDK/runtime version.
- Changing native app version/build metadata.

## Milestone Outcome

1. Walking skeleton: closed.
2. Core-first Creator flow: closed.
3. Follower flow: closed.
4. Presentation polish: closed.
5. OTA update demonstration: closed.
6. Native integration pass: closed.

The milestone order intentionally put OTA before the final native adapter pass. This demonstrated continuous delivery early, then used native integration to show the boundary where OTA stops and a new build is required.

## Acceptance Criteria

The project is successful because:

- Core app logic runs in Node/Jest tests.
- React Native UI is a thin layer over tested states and use cases.
- Expo Go runs the two persona flows.
- iOS simulator/preview build validates media picker, thumbnails, playback, fullscreen, and OTA.
- The README and docs explain the tradeoffs and limitations instead of hiding them.

## Interview Narrative

The story to present:

- I intentionally separated mobile-independent logic from mobile adapters.
- I used TDD where it gives fast confidence.
- I did not confuse Node-based tests with native validation.
- I used Expo OTA to demonstrate operational delivery value.
- I kept scope small and documented the boundaries because this was a platform-learning showcase, not a production video product.
