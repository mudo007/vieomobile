# videomobile

Throwaway React Native with Expo learning showcase.

The goal is to demonstrate a senior backend/devops learning path for mobile: keep business logic testable in pure TypeScript, compose React Native screens around use cases, use fake adapters first, and let CI evaluate readiness before native integration work.

## Current Scope

The app has two local vertical slices:

- **Creator**: pick a real video with Expo ImagePicker, edit a title, validate input, show fake upload progress, generate a local thumbnail with Expo Video, save metadata in memory, complete upload, and return Home.
- **Follower**: read the in-memory Creator uploads, render video cards with thumbnails when available, play a selected video inline with Expo Video, support empty/error states, pull-to-refresh, and return Home.

The uploader is still intentionally fake-backed. This keeps progress/cancel testing simple while the picker, thumbnail, local feed, and inline playback plumbing use Expo/device behavior.

The current presentation pass is based on the supplied Figma references: light gray app background, white rounded cards, blue primary actions, muted secondary pills, image-first feed cards, and a form-card upload layout.

## Commands

Install dependencies:

```zsh
npm install
```

Start the app for Expo Go:

```zsh
npx expo start -c -g --lan
```

Run the full local quality gate:

```zsh
npm run ci
```

Run individual checks:

```zsh
npm run lint
npm run typecheck
npm test
```

Enable media diagnostics only when debugging thumbnail/picker plumbing:

```zsh
printf 'EXPO_PUBLIC_MEDIA_DEBUG=true\n' > .env.local
npx expo start -c -g --lan
```

## Architecture

`src/app/` contains Expo Router route files. This is framework glue: route composition, tab configuration, and wiring fake adapters into screens.

`src/domain/` contains pure TypeScript state machines and domain types. It must not import React, React Native, Expo, or adapter code.

`src/use-cases/` contains application use cases and ports. Use cases translate adapter results into domain events and keep platform details outside the domain.

`src/adapters/` contains fake, in-memory, or Expo implementations of ports. Current adapters include Expo video picking, Expo thumbnail generation, fake upload progress, and an in-memory local video repository/feed.

`src/presentation/` contains React Native screens and presentation hooks. Screens render state, dispatch user intents, and use hooks to run side effects such as loading a feed or uploading a video.

`src/presentation/shared/app-design.ts` contains shared color, radius, spacing, and shadow tokens used by the current Figma-inspired UI pass.

Tests are colocated under each hierarchy's `__tests__` folder.

## Implemented Flows

### Creator

The Creator flow starts in `picking`, because choosing Creator from Home already means the user entered the Creator upload flow.

State handling:

- `picking`: render `Create upload` and `Back home`.
- `editing`: render selected video, title input, validation, and cancel editing.
- `uploading`: render title, progress, and cancel upload.
- `uploaded`: render completion and return Home.
- `failed`: render the failure and return Home.
- `idle`: internal inactive state; presentation renders no user-facing idle screen and the route exits to Home.

Side effects:

- `pickCreatorVideo` uses a `VideoPickerPort`.
- `uploadCreatorVideo` uses a `VideoUploaderPort`, optionally asks a `VideoThumbnailGeneratorPort` for a thumbnail, and saves metadata through an uploaded-video repository when one is provided.
- `useCreatorUpload` starts the upload when state enters `uploading`, dispatches progress/success/failure events, and aborts when the upload is cancelled or unmounted.

### Follower

The Follower flow loads feed cards through a port when the screen mounts. The current route uses the in-memory repository shared with Creator uploads.

State handling:

- `loading`: render loading text.
- `ready`: render feed cards.
- `refreshing`: keep feed cards visible while React Native pull-to-refresh shows an activity indicator.
- `playing`: keep the feed visible and render an inline `expo-video` player inside the selected card's media frame.
- `empty`: render empty state and refresh.
- `failed`: render error and refresh.

Side effects:

- `loadFollowerFeed` uses a `FollowerFeedPort`.
- `useFollowerFeed` starts feed loading when state is `loading` or `refreshing`, dispatches loaded/failed events, and aborts when unmounted.
- `InMemoryFollowerFeed` maps uploaded Creator metadata into feed cards and includes `sourceUri` plus generated thumbnail data when available.
- The inline player delegates playback controls to `expo-video`; the app state only tracks which card is currently playing.

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

Status: complete.

Acceptance criteria:

- Expo SDK 54 app runs in Expo Go.
- TypeScript, linting, Jest, and React Native Testing Library are configured.
- `npm run ci` runs lint, typecheck, and tests.
- At least one pure core test passes.
- At least one screen test passes.

### Milestone 2. Fake Creator Flow

Status: complete.

Acceptance criteria:

- Creator upload state is represented in `src/domain`.
- Tests cover selected video, missing title, picker cancellation, upload progress, upload success, upload failure, and upload cancellation.
- React Native screens render tested states without owning business rules.
- Media picker and upload behavior use fake adapters first.

### Milestone 3. Fake Follower Flow

Status: complete.

Acceptance criteria:

- Feed loading, empty, loaded, and error states are represented in domain logic.
- Tests cover load success, load failure, empty feed, refresh, delayed pull-to-refresh behavior, and player entry/exit.
- Follower route renders fake feed data through a port-backed adapter.

### Milestone 4. Presentation Polish

Status: initial pass complete.

Goal: make the app visually consistent and interview-demo friendly before adding native adapter complexity.

Completed:

- Introduce shared visual tokens for color, spacing, typography, and cards.
- Replace placeholder-looking screens with intentional Home, Creator, and Follower layouts.

Remaining candidate work:

- Create reusable button/card components only where duplication is clear.
- Keep existing tests focused on behavior rather than snapshots.

### Milestone 5. Native Integration Pass

Status: in progress.

Goal: replace fake adapters with Expo implementations where the app needs real device behavior.

Candidate work:

- Replace fake picker with Expo media picker. Creator-side picker plumbing is implemented.
- Generate local feed thumbnails with `expo-video`. Creator-side thumbnail plumbing is implemented.
- Keep Expo Go and simulator/preview builds on the same thumbnail-generation path.
- Validate media permission denied and picker cancel paths.
- Reject duplicate media selections after the system picker returns, using the `duplicateFound` Creator state.
- Replace fake Follower feed source with the local in-memory Creator upload repository. Follower-side feed plumbing is implemented.
- Replace the fake Follower player frame with native inline video playback. Initial inline playback is implemented.
- Document differences between fake adapters and real Expo behavior.

### Milestone 6. OTA Update Demonstration

Status: prepared.

Goal: show Expo OTA delivery with a compatible JS/assets update.

Acceptance criteria:

- `expo-updates` and EAS Update are configured.
- A preview or internal build receives a JS/assets update.
- The demo changes `APP_DEMO_VERSION` in `src/presentation/shared/app-version.ts`.
- The README explains that OTA cannot ship arbitrary native changes.

See `docs/ota-updates.md` for the Free-plan setup and demo commands.

## Docs

`docs/mac-install.md` records the Mac setup flow.

`docs/dependencies.md` records dependency installation notes.

`docs/testing.md` summarizes the current test strategy and where each kind of test belongs.

`docs/ota-updates.md` explains the EAS Update showcase flow, Free-plan caveats, build channels, and the visible demo-version bump.

`docs/data-layer.md` records the URI-pointer video strategy, duplicate detection rule, and planned in-memory repository shape.

`docs/expo-libraries.md` records which Expo native libraries are used now, which are deferred, and how they affect OTA boundaries.
