# videomobile

This is a throwaway learning showcase for React Native with Expo. The goal is to learn the Expo development flow while keeping business logic independent from React Native where it makes sense.

The app starts with two personas:

- **Creator**: eventually uploads videos into a gallery.
- **Follower**: eventually browses creator videos in a feed.

The current milestone is the walking skeleton: the app boots on Expo SDK 54, renders a persona choice screen, has one pure TypeScript core test, has one React Native screen test, and runs a local/CI quality gate.

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

## Walking Skeleton

`app/` contains the Expo Router entry points and route layout. It should stay focused on navigation and screen composition.

`components/` contains React Native UI components. The current app-specific component is `PersonaChoiceScreen`, which renders the Creator/Follower choices and delegates business decisions to the core.

`src/core/` contains pure TypeScript application logic. It must not import React, React Native, or Expo APIs; this is the main TDD surface.

`__tests__/core/` contains fast Node/Jest tests for pure TypeScript behavior. These tests should cover state transitions and business rules before mobile adapters exist.

`__tests__/screens/` contains React Native Testing Library tests for screen-facing behavior. These tests verify rendered output and user interactions, not native device integration.

`docs/` contains project setup notes. `docs/mac-install.md` records the Mac setup flow, and `docs/dependencies.md` records dependency installation commands.

`.github/workflows/ci.yml` runs the quality gate on GitHub Actions. It installs dependencies with `npm ci`, then runs lint, typecheck, and tests.

## Configuration

`package.json` defines Expo scripts plus `lint`, `typecheck`, `test`, and `ci`. It also configures Jest with `jest-expo` and disables Watchman for stable local and CI runs.

`tsconfig.json` extends Expo's base TypeScript config, enables strict mode, and exposes Jest types for test files.

`jest.setup.ts` loads React Native Testing Library matchers. Keep native mocks here when a screen test needs a platform boundary isolated.

`eslint.config.js` uses Expo's flat ESLint config. The current lint step is intentionally lightweight for the walking skeleton.

`app.json` stores Expo app configuration. Typed routes are disabled for now so the early skeleton can stay simple; they can be re-enabled once the route map stabilizes.

## Testing Strategy

The core rule is to separate business logic from rendering and platform APIs.

Pure logic belongs in `src/core` and should be developed test-first. React Native screens should call that logic rather than hiding business decisions inside components.

The first core test proves persona selection maps to an application destination. The first screen test proves both persona choices render and that selecting Creator emits the expected destination.

Native behavior such as media picker permissions, video playback, haptics, and OTA updates will need targeted device or E2E validation later. Unit and screen tests do not prove those platform paths.

## Milestone Goals

### Milestone 1. Walking Skeleton

Goal: prove the app can boot, render one owned screen, and run the same quality gate locally and in CI.

Acceptance criteria:

- Expo SDK 54 app runs in Expo Go.
- TypeScript, linting, Jest, and React Native Testing Library are configured.
- `npm run ci` runs lint, typecheck, and tests.
- At least one pure core test passes.
- At least one screen test passes.

### Milestone 2. Core-First Creator Flow

Goal: model the Creator upload flow in pure TypeScript before adding real Expo media APIs.

Acceptance criteria:

- Upload state is represented in `src/core`.
- Tests cover selected video, missing title, picker cancellation, upload progress, upload success, upload failure, and upload cancellation.
- React Native screens render the tested states without owning the business rules.
- Media picker and upload behavior use fake adapters first.

### Milestone 3. Follower Flow

Goal: model the Follower feed and player entry flow while reusing shared video concepts from the Creator side.

Acceptance criteria:

- Feed loading, empty, loaded, and error states are represented in core logic.
- Tests cover refresh success, refresh failure, empty feed, and card selection.
- A reusable video card component is introduced only when both Creator and Follower screens need it.
- Player entry is modeled as an intent before native playback is integrated.

### Milestone 4. Native Integration Pass

Goal: replace fake adapters with Expo implementations where the app needs real device behavior.

Acceptance criteria:

- Media library permission denied and picker cancel are handled.
- Video playback is validated on a real device or simulator.
- Optional haptics are isolated behind an adapter.
- Known differences between fake adapters and real Expo behavior are documented.

### Milestone 5. OTA Update Demonstration

Goal: show Expo OTA delivery with a compatible JS-only cosmetic update.

Acceptance criteria:

- `expo-updates` and EAS Update are configured.
- A preview or internal build receives a JS/assets update.
- The demo changes a harmless visual token such as background color.
- The README explains that OTA cannot ship arbitrary native changes.

## Milestone 1 Status

- Expo SDK 54 app boots in Expo Go.
- CI workflow exists.
- `npm run ci` passes locally.
- One core test passes.
- One screen test passes.
