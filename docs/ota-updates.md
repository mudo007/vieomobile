# OTA Update Showcase

This app uses a harmless visible label, `APP_DEMO_VERSION`, as the OTA proof point. The demo should show that a JavaScript-only change can reach an installed build without reinstalling the native binary.

Do not confuse this with `expo.version` in `app.json`. The `APP_DEMO_VERSION` value is presentation copy. The native app version/build number still requires a binary release.

## Command Sequence

Run these commands yourself from the project root:

```zsh
cd ~/Repos/videomobile

eas login
eas whoami

npx expo install expo-updates
eas update:configure

npm run ci
```

Inspect the expected configuration changes:

```zsh
rg 'expo-updates|runtimeVersion|updates|projectId|channel' package.json app.json eas.json
```

Create an installable preview build. Android is the simplest Free-plan path because it produces an installable APK:

```zsh
eas build --platform android --profile preview
```

For an iOS simulator build on your Mac:

```zsh
eas build --platform ios --profile preview-simulator
```

Install and run a finished iOS simulator build:

```zsh
open -a Simulator
eas build:run --platform ios
```

If EAS asks which build to run, select the latest `preview-simulator` build.

For a physical iPhone, you need Apple ad hoc provisioning, which requires a paid Apple Developer account:

```zsh
eas device:create
eas build --platform ios --profile preview
```

After the preview build is installed and opened once, make the OTA demo change:

```zsh
cd ~/Repos/videomobile
```

Edit this file:

```text
src/presentation/shared/app-version.ts
```

Change:

```ts
export const APP_DEMO_VERSION = '1.0.0';
```

To:

```ts
export const APP_DEMO_VERSION = '1.0.1';
```

Then publish the OTA update to the preview channel:

```zsh
npm run ci
eas update --channel preview --message "Bump demo version to 1.0.1"
```

Force close and reopen the installed preview app. On the iOS Simulator, use:

```zsh
xcrun simctl terminate booted com.mudo007.videomobileexposcaffoldsdk54
xcrun simctl launch booted com.mudo007.videomobileexposcaffoldsdk54
```

Or restart it in one command:

```zsh
xcrun simctl launch --terminate-running-process booted com.mudo007.videomobileexposcaffoldsdk54
```

If the label does not change on the first reopen, close and reopen once more. This is expected: the default update behavior can download the update on one launch and apply it on the next launch.

To confirm the installed app bundle identifier:

```zsh
xcrun simctl listapps booted | rg CFBundleIdentifier
```

## What The Commands Do

`npx expo install expo-updates` installs the Expo Updates runtime dependency in a version compatible with the active Expo SDK.

`eas update:configure` links the local project to an EAS project. It adds update metadata to `app.json`, normally including `updates.url`, `runtimeVersion`, and `extra.eas.projectId`.

`eas.json` defines the build channels used by installed binaries:

- `preview`: internal distribution build that receives updates published to the `preview` channel.
- `preview-simulator`: iOS simulator build that also receives `preview` updates.
- `production`: production channel reserved for future app-store style builds.

`eas update --channel preview` uploads the JavaScript bundle and assets for the latest code and makes them available to compatible builds on the `preview` channel.

## Compatibility Rules

An update is only delivered when all of these match:

- The installed build points to the same channel.
- The update targets the same platform.
- The update has the same `runtimeVersion` as the installed build.

If native code, native dependencies, permissions, plugins, Expo SDK version, app icon, splash configuration, or native app versioning changes, create a new build instead of relying on OTA.

## Free Plan Notes

The Free plan is enough for this showcase. Current Expo pricing includes a limited number of builds and EAS Update usage for small projects.

Free-plan caveats:

- OTA code signing is not available on Free. Treat this as a learning/demo setup, not a production security baseline.
- Protect the Expo account with 2FA.
- Do not commit EAS access tokens.
- If publishing from CI later, store `EAS_TOKEN` only as a CI secret.
- Internal build URLs are shareable links; avoid posting them publicly.

## Secrets And GitHub Safety

The Free-plan OTA setup should not add secrets to source code.

Expected repo changes from `eas update:configure`:

- `app.json`: EAS project id, update URL, and runtime version metadata. These are identifiers/configuration, not credentials.
- `package.json` and `package-lock.json`: `expo-updates` dependency.
- `eas.json`: build profiles and channels. This is not secret.

Expected local-only credentials:

- `eas login` stores authentication outside the project working tree.
- `EAS_TOKEN`, if used later for CI, must live only in CI secrets or a local ignored env file.
- Android keystores, iOS provisioning profiles, App Store Connect keys, and code-signing private keys must stay out of Git.

This repo ignores `.env`, `.env.*`, `credentials.json`, `keys/`, `secrets/`, and common native signing file extensions. If you need a local token while testing, use:

```zsh
cat > .env.local <<'EOF'
EAS_TOKEN=replace-with-local-token-only-if-needed
EOF
```

Do not commit `.env.local`.

## Interview Talking Points

This demo shows continuous delivery for the JavaScript/assets layer, not arbitrary native delivery.

The production-grade flow would be:

- Pull request runs lint, typecheck, and tests.
- Merge to a preview branch publishes to a preview EAS Update channel.
- QA validates the installed preview build without reinstalling.
- Promotion to production happens by publishing to `production` or by changing a channel-to-branch pointer.
- Native changes still go through EAS Build and app-store review.
