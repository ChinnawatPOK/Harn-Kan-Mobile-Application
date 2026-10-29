# Harn-Kan Mobile Application

React Native app powered by Expo SDK 57 and Expo Router.

## Getting started

Use Node.js LTS (version 22.13 or newer), then run:

```bash
npm install
npm start
```

Open the QR code with Expo Go, or press `i` for the iOS simulator, `a` for an Android emulator, or `w` for the web app. Start editing screens in `src/app/`.

## Registration API

The Sign Up screen sends registration requests through Harn-Kan-Gateway.
The Login screen uses the same Gateway base URL for phone-number login.
Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_BASE_URL` to the Gateway
address reachable from your app:

- Android emulator: `http://10.0.2.2:8080`
- iOS simulator or web: `http://localhost:8080`
- Physical device: `http://<development-computer-LAN-IP>:8080`

Start the User Service and Gateway before submitting the form. See
`../Harn-Kan-Gateway/README.md` for Gateway setup.

## Checks

```bash
npm run lint
npx tsc --noEmit
npx expo-doctor

How to start
npx expo login --browser
npx expo start
```
