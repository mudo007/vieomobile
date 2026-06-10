# Testing Strategy

The project uses TDD as a learning and architecture tool. Tests should make the separation between domain, use cases, adapters, and presentation visible.

## Test Layers

## Domain tests

Domain tests live near `src/domain/**/__tests__`.

Use these for pure TypeScript state transitions and rules. They should not import React, React Native, Expo, adapters, or route files.

Current examples:

- Creator upload reducer.
- Follower feed reducer.
- Persona destination mapping.

## Use-case tests

Use-case tests live near `src/use-cases/**/__tests__`.

Use these to verify that application logic calls ports only in valid states and translates adapter results into domain events.

Current examples:

- Picking a creator video.
- Uploading a creator video.
- Loading the follower feed.

## Adapter tests

Adapter tests live near `src/adapters/**/__tests__`.

Use these for fake adapter behavior and, later, thin tests around platform adapters where mocking is useful.

Current examples:

- Fake upload progress and abort behavior.
- Fake follower feed data, delayed refresh, and abort behavior.

## Presentation tests

Presentation tests live near `src/presentation/**/__tests__`.

Use these to verify user-visible behavior: rendered states, button presses, validation messages, progress display, pull-to-refresh indicators, fake player entry/exit, and route callbacks.

Avoid snapshot tests for now. Behavior-based tests are easier to discuss in an interview and less brittle while the UI is still evolving.

## Route tests

Route tests live near `src/app/**/__tests__`.

Use these to verify Expo Router composition, navigation callbacks, and route lifecycle behavior.

Current examples:

- Home routes Creator/Follower persona choices.
- Creator route creates a fresh session when the tab is focused again.
- Follower route returns Home from the feed.

## Current Quality Gate

Run:

```zsh
npm run ci
```

This runs:

```zsh
npm run lint
npm run typecheck
npm test
```

At the current milestone, the project has domain, use-case, adapter, presentation, and route tests covering both fake vertical slices.
