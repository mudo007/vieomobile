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

## Milestone 1 Status

- Expo SDK 54 app boots in Expo Go.
- CI workflow exists.
- `npm run ci` passes locally.
- One core test passes.
- One screen test passes.
