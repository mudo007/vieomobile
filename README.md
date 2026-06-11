# videomobile

Throwaway React Native with Expo learning showcase.

The goal is to demonstrate a senior backend/devops learning path for mobile: keep business logic testable in pure TypeScript, compose React Native screens around use cases, use fake adapters before native integrations, and let CI evaluate readiness before demoing the app.

## Current Scope

The app has two local vertical slices:

- **Creator**: pick a real video with Expo ImagePicker, edit title/description, validate input, show fake upload progress, generate a local thumbnail with Expo Video, save metadata in memory, complete upload, and return Home.
- **Follower**: read the in-memory Creator uploads, render video cards with thumbnails, play a selected video inline with Expo Video, use native player controls/fullscreen, support empty/error states, pull-to-refresh, and stop playback on route exit.

The uploader is intentionally still fake-backed. This keeps progress/cancel testing easy while the picker, thumbnail generation, local feed, OTA setup, and inline playback use real Expo/device behavior.

The presentation pass is based on the supplied Figma references: light gray app background, white rounded cards, blue primary actions, muted secondary pills, image-first feed cards, and a form-card upload layout.

## Quick Run

Install dependencies:

```zsh
cd ~/Repos/videomobile
npm install
```

Run the full local quality gate:

```zsh
npm run ci
```

Run on a physical phone with Expo Go:

```zsh
npx expo start -c -g --lan
```

Then open Expo Go on the phone and scan the QR code. The phone and Mac should be on the same network.

Run on the iOS Simulator with Expo Go:

```zsh
open -a Simulator
npx expo start -c --ios
```

Run the installed iOS simulator preview build used for OTA demos:

```zsh
eas build --platform ios --profile preview-simulator
open -a Simulator
eas build:run --platform ios
```

Seed videos into the iOS Simulator Photos library when testing Creator:

```zsh
xcrun simctl addmedia booted /absolute/path/to/video1.mp4
xcrun simctl addmedia booted /absolute/path/to/video2.mov
```

See `docs/dependencies.md` for simulator setup if `simctl` has no devices.

## Architecture

`src/app/` contains Expo Router route files. This is framework glue: route composition, tab configuration, and wiring adapters into screens.

`src/domain/` contains pure TypeScript state machines and domain types. It must not import React, React Native, Expo, or adapter code.

`src/use-cases/` contains application use cases and ports. Use cases translate adapter results into domain events and keep platform details outside the domain.

`src/adapters/` contains fake, in-memory, or Expo implementations of ports. Current adapters include Expo video picking, Expo thumbnail generation, fake upload progress, and an in-memory local video repository/feed.

`src/presentation/` contains React Native screens and presentation hooks. Screens render state, dispatch user intents, and use hooks to run side effects such as loading a feed or uploading a video.

`src/presentation/shared/app-design.ts` contains shared color, radius, spacing, and shadow tokens used by the Figma-inspired UI pass.

Tests are colocated under each hierarchy's `__tests__` folder.

## Implemented Flows

### Creator

The Creator flow starts in `picking`, because choosing Creator from Home already means the user entered the upload flow.

State handling:

- `picking`: render `Create upload` and `Back home`.
- `editing`: render selected video, title/description input, validation, and cancel editing.
- `duplicateFound`: show a recoverable warning and allow picking again.
- `uploading`: render title, progress, and cancel upload.
- `uploaded`: render completion and return Home.
- `failed`: render the failure and return Home.
- `idle`: internal inactive state; presentation renders no user-facing idle screen and the route exits to Home.

Side effects:

- `pickCreatorVideo` uses a `VideoPickerPort`.
- `uploadCreatorVideo` uses a `VideoUploaderPort`, asks a `VideoThumbnailGeneratorPort` for a thumbnail, and saves metadata through an uploaded-video repository.
- `useCreatorUpload` starts the upload when state enters `uploading`, dispatches progress/success/failure events, and aborts when upload is cancelled or unmounted.

### Follower

The Follower flow loads feed cards through a port when the screen mounts. The route uses the in-memory repository shared with Creator uploads.

State handling:

- `loading`: render loading text.
- `ready`: render feed cards.
- `refreshing`: keep feed cards visible while pull-to-refresh shows an activity indicator.
- `playing`: keep the feed visible and render an inline `expo-video` player inside the selected card.
- `empty`: render empty state and refresh.
- `failed`: render error and refresh.

Side effects:

- `loadFollowerFeed` uses a `FollowerFeedPort`.
- `useFollowerFeed` starts feed loading when state is `loading` or `refreshing`, dispatches loaded/failed events, and aborts when unmounted.
- `InMemoryFollowerFeed` maps uploaded Creator metadata into feed cards and includes `sourceUri` plus generated thumbnail data when available.
- The inline player delegates play/pause/seek/fullscreen controls to `expo-video`; app state only tracks which card is currently playing.
- Route exits and tab changes dispatch `closeVideo` before navigation so audio does not continue in the background.

## Testing Strategy

The core rule is to separate business logic from rendering and platform APIs.

Coverage currently includes:

- Domain reducer tests for Creator and Follower state machines.
- Use-case tests for picker, upload, thumbnail handoff, and feed loading.
- Adapter tests for upload progress, Expo thumbnail generation, in-memory feed data, and delayed fake refresh behavior.
- React Native screen tests for Creator, Follower, and persona choice presentation.
- Route tests for Home, Creator, and Follower navigation behavior.

Run `npm run ci` before treating a change as ready. The CI script runs lint, typecheck, and Jest.

## Milestones

### Milestone 1. Walking Skeleton

Status: closed.

Completed:

- Expo SDK 54 app runs in Expo Go.
- TypeScript, linting, Jest, and React Native Testing Library are configured.
- `npm run ci` runs lint, typecheck, and tests.
- Initial pure TypeScript and screen tests pass.

### Milestone 2. Core-First Creator Flow

Status: closed.

Completed:

- Creator upload state is represented in `src/domain`.
- Tests cover selected video, missing title, picker cancellation, duplicate detection, upload progress, upload success, upload failure, and upload cancellation.
- React Native screens render tested states without owning business rules.
- Media picker and upload behavior started with fake adapters.

### Milestone 3. Follower Flow

Status: closed.

Completed:

- Feed loading, empty, loaded, refreshing, error, and playing states are represented in domain logic.
- Tests cover load success, load failure, empty feed, refresh, delayed pull-to-refresh behavior, and player entry/exit.
- Follower route renders feed data through a port-backed adapter.

### Milestone 4. Presentation Polish

Status: closed.

Completed:

- Shared visual tokens for color, spacing, typography, cards, and shadows.
- Figma-inspired Home, Creator, and Follower layouts.
- White cards, blue primary actions, safe-area-aware headers, readable text, and consistent feed/upload surfaces.

### Milestone 5. OTA Update Demonstration

Status: closed.

Completed:

- `expo-updates` and EAS Update are configured.
- Preview and preview-simulator channels are configured in `eas.json`.
- The OTA proof point is `APP_DEMO_VERSION` in `src/presentation/shared/app-version.ts`.
- Docs explain that OTA can ship compatible JS/assets changes, not native dependency or permission changes.

See `docs/ota-updates.md` for the Free-plan setup and demo commands.

### Milestone 6. Native Integration Pass

Status: closed.

Completed:

- Expo ImagePicker selects real videos from the device library.
- Duplicate detection happens after the system picker returns.
- Expo Video generates local feed thumbnails.
- Expo Image renders thumbnail sources, including native image references.
- Follower feed reads from the in-memory Creator upload repository.
- Follower inline playback uses Expo Video native controls, including fullscreen.
- Playback closes when leaving the Follower route.

## Docs

`docs/specification.md` records the final learning strategy, scope, architecture, tradeoffs, and acceptance criteria.

`docs/mac-install.md` records the Mac setup flow.

`docs/dependencies.md` records dependency and simulator setup notes.

`docs/testing.md` summarizes the test strategy and where each kind of test belongs.

`docs/ota-updates.md` explains the EAS Update showcase flow, Free-plan caveats, build channels, and the visible demo-version bump.

`docs/data-layer.md` records the URI-pointer video strategy, duplicate detection rule, and in-memory repository shape.

`docs/expo-libraries.md` records the Expo native libraries used by this app and their OTA boundary impact.
