# macOS Install Notes

These are the setup commands used for this Expo React Native project on an Apple Silicon Mac.

## Prerequisites

- macOS on Apple Silicon
- Homebrew installed and updated
- Xcode installed from the App Store

## Install local tooling

```zsh
brew install fnm watchman cocoapods rg
```

## Configure Node with fnm

Add `fnm` to your `zsh` shell:

```zsh
echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
source ~/.zshrc
```

Install and use Node 22:

```zsh
fnm install 22
fnm use 22
node --version
npm --version
```

## Configure Xcode

```zsh
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
xcodebuild -version
xcrun simctl list devices available
```

## Install EAS CLI

```zsh
npm install --global eas-cli
eas --version
```

Warnings about deprecated transitive packages during the global `eas-cli` install are not blocking if `eas --version` works.

## Scaffold the Expo app

Scaffold into a temporary directory first so existing repository files can be reviewed before copying:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx create-expo-app@latest /private/tmp/videomobile-expo-scaffold-sdk54 --template default@sdk-54
```

Copy the generated project into this repository:

```zsh
rsync -av \
  --exclude .git \
  /private/tmp/videomobile-expo-scaffold-sdk54/ \
  /Users/diogoandrade/Repos/videomobile/
```

## Start the app

```zsh
cd /Users/diogoandrade/Repos/videomobile
npm install
npx expo start -c -g --lan
```

Use Expo Go for the first learning loop. Move to a development build when validating native behavior such as OTA updates, media picker behavior, and device-specific integration.
