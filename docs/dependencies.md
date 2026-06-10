# Dependencies

Project dependencies should be installed through Expo where possible so versions resolve against the active Expo SDK.

## Test dependencies

Install Jest, the Expo Jest preset, Jest TypeScript types, and React Native Testing Library:

```zsh
cd /Users/diogoandrade/Repos/videomobile

npx expo install jest-expo jest @types/jest @testing-library/react-native --dev
```

Verify the dependencies landed in `package.json`:

```zsh
rg 'jest-expo|@testing-library/react-native|"jest"|"@types/jest"' package.json
```

Expected packages:

```json
"@testing-library/react-native"
"@types/jest"
"jest"
"jest-expo"
```
