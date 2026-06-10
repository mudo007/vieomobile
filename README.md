# videomobile

Throwaway React Native with Expo learning showcase.

The goal is to demonstrate a senior backend/devops learning path for mobile: keep business logic testable in pure TypeScript, compose React Native screens around use cases, use fake adapters first, and let CI evaluate readiness before native integration work.

## Current Scope

The app has two fake vertical slices:

- **Creator**: pick a fake video, edit a title, validate input, show fake upload progress, complete upload, and return Home.
- **Follower**: load a fake feed, render video cards, open a fake fullscreen player, support empty/error states, pull-to-refresh with a delayed fake adapter, and return Home.

Both flows are intentionally fake-backed. This lets the presentation, state modeling, and testing strategy be validated before adding Expo media picker, playback, storage, or backend integrations.

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

## Architecture

`src/app/` contains Expo Router route files. This is framework glue: route composition, tab configuration, and wiring fake adapters into screens.

`src/domain/` contains pure TypeScript state machines and domain types. It must not import React, React Native, Expo, or adapter code.

`src/use-cases/` contains application use cases and ports. Use cases translate adapter results into domain events and keep platform details outside the domain.

`src/adapters/` contains fake or platform implementations of ports. Current adapters are fake implementations for video picking, video uploading, and follower feed loading/refreshing.

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
- `uploadCreatorVideo` uses a `VideoUploaderPort`.
- `useCreatorUpload` starts the upload when state enters `uploading`, dispatches progress/success/failure events, and aborts when the upload is cancelled or unmounted.

### Follower

The Follower flow loads a fake feed when the screen mounts.

State handling:

- `loading`: render loading text.
- `ready`: render feed cards.
- `refreshing`: keep feed cards visible while React Native pull-to-refresh shows an activity indicator.
- `playing`: render a fake fullscreen player frame for the selected feed video.
- `empty`: render empty state and refresh.
- `failed`: render error and refresh.

Side effects:

- `loadFollowerFeed` uses a `FollowerFeedPort`.
- `useFollowerFeed` starts feed loading when state is `loading` or `refreshing`, dispatches loaded/failed events, and aborts when unmounted.
- `FakeFollowerFeed` returns initial feed data immediately and delays refresh loads for 3 seconds so the presentation can show a realistic pull-to-refresh spinner.

## Testing Strategy

The core rule is to separate business logic from rendering and platform APIs.

Coverage currently includes:

- Domain reducer tests for Creator and Follower state machines.
- Use-case tests for picker, upload, and feed loading.
- Fake adapter tests for upload progress, follower feed data, and delayed follower refresh behavior.
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
- Tests cover load success, load failure, empty feed, refresh, delayed pull-to-refresh behavior, and fake player entry/exit.
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

Status: not started.

Goal: replace fake adapters with Expo implementations where the app needs real device behavior.

Candidate work:

- Replace fake picker with Expo media picker.
- Validate media permission denied and picker cancel paths.
- Replace the fake Follower player frame with native video playback when needed.
- Document differences between fake adapters and real Expo behavior.

### Milestone 6. OTA Update Demonstration

Status: not started.

Goal: show Expo OTA delivery with a compatible JS/assets update.

Acceptance criteria:

- `expo-updates` and EAS Update are configured.
- A preview or internal build receives a JS/assets update.
- The demo changes a harmless visual token such as background color or copy.
- The README explains that OTA cannot ship arbitrary native changes.

## Docs

`docs/mac-install.md` records the Mac setup flow.

`docs/dependencies.md` records dependency installation notes.

`docs/testing.md` summarizes the current test strategy and where each kind of test belongs.
