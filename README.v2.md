# videomobile v2

This project is a throwaway learning showcase for React Native with Expo.

Its purpose is not to prove that I am already a mobile specialist. Its purpose is to show that I can learn the platform deliberately, apply senior engineering discipline to an unfamiliar stack, and build a small but coherent mobile delivery flow around Expo, OTA updates, testing, and CI/CD.

The guiding idea is:

- keep the core application logic independent from React Native as much as possible
- use TDD for domain logic, state transitions, and application use cases
- keep React Native and Expo as delivery adapters around that core
- validate true mobile concerns with targeted integration and E2E tests instead of pretending pure Node.js tests are enough

This direction aligns with the React Native testing guidance that recommends separating rendering from business logic and app state so that logic can be tested independently from React components. It also acknowledges the limit of that approach: component tests still run in Node.js and cannot prove native behavior on iOS or Android by themselves.

References:

- [React Native testing overview](https://reactnative.dev/docs/testing-overview)
- [Expo unit testing with Jest](https://docs.expo.dev/develop/unit-testing/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo EAS Update](https://docs.expo.dev/eas-update/introduction/)

## Goal

Build a minimal React Native Expo app with two personas:

- **Creator** uploads a video from the phone library into a gallery
- **Follower** browses uploaded videos in a feed and opens one in a player

Additionally, the app must demonstrate Expo OTA updates with a harmless cosmetic change such as a theme background color.

The app is intentionally small. The point is to demonstrate:

- basic mobile product flow from prototype to running app
- clear boundaries between domain logic and UI/platform code
- pragmatic TDD
- a lightweight CI/CD path for a mobile app
- realistic understanding of what can and cannot be validated outside a device

## Non-Goals

- no heavy backend architecture
- no real authentication
- no production-grade media pipeline
- no attempt to prove full native correctness with only unit tests
- no over-engineered DDD ceremony

## Product Scope

### Personas

- **Creator**
  - enters the creator mode
  - picks a video from the device library
  - adds a title
  - confirms the upload
  - sees upload progress
  - lands back on gallery with the new item at the top

- **Follower**
  - enters the follower mode
  - sees a feed of uploaded videos
  - taps a card
  - opens a full-screen player
  - goes back to the feed

### OTA demonstration

- the app includes `expo-updates`
- an OTA update changes a harmless cosmetic token such as background color
- the demo should show that the app can fetch and apply a JS-only update without an app store release
- the README and demo script should be explicit that OTA applies to compatible JS/assets changes, not arbitrary native changes

## Strategy

### 1. Node-first core

The core logic should be written as plain TypeScript modules that do not depend on React, React Native, or Expo.

This core may include:

- entities and value objects
- use cases
- application services
- reducers or state machines
- repository interfaces
- error models
- test fixtures

This allows fast TDD in Node.js before any screen exists.

Examples:

- `selectPersona(creator)` leads to route intent `gallery`
- `prepareUpload(video, title)` validates required fields
- `startUpload()` transitions from `ready` to `uploading`
- `uploadSucceeded(video)` moves the new video to the top of the gallery
- `refreshFeed()` transitions feed state from `idle` to `loading` to `loaded`

### 2. Thin React Native shell

React Native components should focus on:

- rendering state
- dispatching intents
- wiring navigation
- calling Expo and native APIs
- translating adapter outputs into core inputs

This keeps screens simpler and makes tests more honest:

- domain tests verify rules
- component tests verify rendering and interaction
- E2E tests verify native integration

### 3. Explicit platform boundaries

Anything that touches device or Expo APIs should be treated as an adapter, not hidden inside business logic.

Key adapters:

- media picker adapter
- video playback adapter
- haptics adapter
- OTA update adapter
- persistence adapter
- clock or timer adapter

Each adapter should have:

- an interface used by the core
- a fake implementation for tests
- a real Expo or React Native implementation for the app

## Architecture

The app does not need full enterprise layering. It does need clear seams.

Suggested structure:

```text
src/
  core/
    domain/
    application/
    state/
    ports/
    test/
  features/
    home/
    creator/
    follower/
    ota/
  adapters/
    expo/
    storage/
    navigation/
  app/
    routes/
```

### Core responsibilities

- no imports from `react`
- no imports from `react-native`
- no imports from Expo packages
- deterministic tests
- business-first naming

### Adapter responsibilities

- convert platform APIs into domain-friendly models
- isolate permission handling
- isolate file/media metadata extraction
- isolate OTA check/fetch/reload behavior

## Testing Strategy

TDD still stands, but it should be applied where it is strongest.

### A. Static analysis

Always-on baseline:

- TypeScript
- ESLint
- formatting

This is part of the quality gate, not an afterthought.

### B. Core unit tests in Node.js

This is the main TDD layer.

What to test first:

- state transitions
- validation rules
- sorting and mapping logic
- upload and feed use cases
- error handling rules
- update eligibility logic if modeled in app code

Examples:

- creator cannot confirm upload without a selected video
- creator cannot confirm upload without title
- upload cancellation returns to picker state
- successful upload prepends item to gallery
- failed upload returns a recoverable error state
- follower refresh preserves old items until new result arrives

These tests should run without any React Native runtime.

### C. Component tests

Use:

- `jest-expo`
- `@testing-library/react-native`

Purpose:

- verify screens render expected states
- verify button presses dispatch the right intents
- verify visible user-facing behavior

Avoid:

- testing component internals
- overusing snapshots
- pretending these tests prove native integration

Good candidates:

- home screen shows both persona cards
- gallery screen renders empty, uploading, success, and error states
- feed screen renders loading, empty, and loaded states
- tapping visible actions triggers expected callbacks

### D. E2E or smoke tests on a real app build

This is mandatory for the native seams.

Candidate flows:

- creator selects a video from library and confirms upload
- follower opens a video and playback starts
- OTA update is fetched and applied in a controlled demo flow

Why this matters:

- component tests run in Node.js
- they do not prove native media picker behavior
- they do not prove playback behavior
- they do not prove OTA behavior on an installed app

For this project, a very small E2E suite is enough. One or two critical paths are more useful than a broad flaky suite.

## Edge Cases To Model Intentionally

TDD helps only if the scenarios are explicitly named. Edge cases do not appear automatically just because tests are written first.

Minimum set to include:

- media library permission denied
- user cancels media selection
- unsupported or invalid file metadata
- upload failure
- upload cancellation
- empty feed
- feed refresh failure
- player loading or buffering failure
- OTA check failure
- OTA downloaded but not applied until reload or next app start

This is enough to show senior-level risk awareness without blowing up the scope.

## Delivery Plan

### Milestone 1. Walking skeleton

- scaffold Expo app with TypeScript and Expo Router
- set up linting, typecheck, Jest, and React Native Testing Library
- create the first CI job
- create home screen navigation skeleton

Success criteria:

- app boots
- CI runs lint, typecheck, and tests
- at least one core test and one screen test pass

### Milestone 2. Core-first creator flow

- model upload state machine or reducer in pure TypeScript
- write tests first for upload flow
- add fake media and fake upload adapters
- render gallery and picker flow with those adapters

Success criteria:

- most creator logic covered in Node-based tests
- UI is only a thin shell over tested state

### Milestone 3. Follower flow

- model feed loading and player entry
- reuse shared video models and card component where appropriate
- keep player-specific native behavior behind adapter boundaries

Success criteria:

- follower flow works with fake repository
- shared core logic is reused without UI coupling

### Milestone 4. Native integration pass

- replace fake adapters with Expo implementations where needed
- validate media picker permissions
- validate playback
- optionally validate haptics

Success criteria:

- one device or simulator smoke run passes
- known differences between fake and real adapters are documented

### Milestone 5. OTA demonstration

- add `expo-updates`
- configure EAS Update
- publish a cosmetic update
- document the exact demo steps and limitations

Success criteria:

- installed build receives a JS-only update
- demo script clearly explains what changed and why OTA was valid

## Data Strategy

Start with the smallest thing that proves the mobile flow.

Recommended order:

1. In-memory fake repository for rapid TDD
2. Optional local persistence if needed for demo continuity
3. Only then consider a tiny backend

This project should not become a backend system with a mobile client attached to it.

## CI/CD Strategy

The pipeline should communicate "disciplined mobile delivery" rather than "fake production maturity."

Recommended pipeline stages:

1. Install dependencies
2. Lint
3. Typecheck
4. Run core and component tests
5. Optionally run one smoke E2E flow
6. Create preview build or OTA preview update

Possible outputs:

- PR quality gate
- internal preview build
- OTA preview channel for cosmetic JS changes

## Demo Narrative

The interview story matters as much as the code.

The narrative should be:

- I intentionally separated mobile-independent logic from mobile adapters
- I used TDD where it provides high confidence and fast feedback
- I did not confuse Node-based tests with native validation
- I used Expo OTA to demonstrate operational delivery value, not just UI coding
- I kept scope small because the goal was platform learning and sound engineering judgment

## Practical Constraints

- Docker is not the center of the workflow here
- iOS device and simulator behavior still matter
- Expo Go is useful early, but development builds are the right path once native parity matters
- OTA updates only cover compatible JS and asset changes, not arbitrary native changes

## Acceptance Criteria

The project is successful if:

- the core app logic can be exercised in Node.js tests
- the React Native UI is a thin layer over tested state and use cases
- the app runs in Expo with the two persona flows working
- at least one true native smoke path is validated on a build
- OTA updates are demonstrated with a compatible cosmetic change
- the code and README show deliberate engineering tradeoffs, not accidental complexity

## Summary

Yes, the strategy stands.

It is a good idea to build a large portion of the app core as plain TypeScript before the app "knows" it is React Native.

The key correction is this:

- do not assume TDD alone will discover mobile edge cases
- explicitly list the risky scenarios
- keep native concerns at adapter boundaries
- validate those boundaries with a small number of real app tests

That is a strong senior approach for a throwaway Expo learning project.
