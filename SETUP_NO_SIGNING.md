# iOS Setup and Archive

This project is a Vite React app wrapped with Capacitor. The repository contains the web app and Capacitor config; the native `ios/` project is generated locally.

## What Product > Archive Requires

- Node.js and npm available in Terminal/Xcode's environment
- Xcode installed
- A generated Capacitor iOS project
- An Apple Developer Team selected under Signing & Capabilities
- A bundle identifier that exists in App Store Connect or your Apple Developer account

You can generate and sync the iOS project without signing, but Product > Archive for App Store/TestFlight requires valid Apple signing.

## One Command Setup

From the project root, run:

```sh
npm run setup:ios:archive
```

That command runs `scripts/setup-ios-archive.sh`, which:

- Installs npm dependencies
- Builds the Vite web app into `dist`
- Creates the Capacitor `ios/` project if it does not exist
- Syncs Capacitor plugins and web assets into iOS
- Copies `GoogleService-Info.plist` into the iOS app folder when the folder exists
- Opens `ios/App/App.xcworkspace`

## Archive Steps in Xcode

After the workspace opens:

1. Select the `App` project, then the `App` target.
2. Open `Signing & Capabilities`.
3. Choose your Apple Developer Team.
4. Confirm the Bundle Identifier is `com.sober.club`, or change it to the identifier registered in Apple Developer/App Store Connect.
5. Select `Any iOS Device` or a generic iOS device destination.
6. Choose `Product > Archive`.

If you do not have signing access, Xcode can still run the app in the iOS Simulator, but it cannot create an App Store/TestFlight archive.

## After App Changes

Whenever web code changes and you want the iOS project updated:

```sh
npm run cap:sync:ios
```

For both native platforms:

```sh
npm run cap:sync
```

## Android Debug Setup

Android debug setup does not require Apple signing:

```sh
npm run setup:native
npm run cap:open:android
```

A Play Store release still requires a release keystore and signed Android App Bundle.
