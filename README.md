# NUR

NUR is a hybrid Islamic companion: a Vite/React web app with an Express server for Gemini features, plus a native Jetpack Compose Android app. Qur'an text, prayer calculations, Duas, Adhkar, Qibla, Tasbih, and reflections are implemented in the clients; the web server provides the Gemini endpoints and serves the built SPA.

## Requirements

- Node.js 20 or newer
- Bun 1.x (the repository uses `bun.lock`)
- JDK 17 and Android SDK 35 for Android builds
- Android Studio for device deployment

## Local Web Development

```powershell
bun install --frozen-lockfile
Copy-Item .env.example .env
bun run dev
```

The development server runs on `http://localhost:3000`. Set `GEMINI_API_KEY` in `.env` to enable live AI features. Without it, those endpoints report that the service is unavailable; offline client features remain available.

## Web Build and Production

```powershell
bun run typecheck
bun run build
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:CORS_ORIGINS = "https://your-web-domain.example"
$env:GEMINI_API_KEY = "your-secret"
bun run start
```

The server listens on `HOST` (default `0.0.0.0`) and `PORT` (default `3000`). It serves the Vite output and exposes `GET /health`. For a separately deployed frontend, set `VITE_API_URL` to the public backend URL and configure that URL in `CORS_ORIGINS`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | No | Browser API base URL; empty means same-origin. |
| `GEMINI_API_KEY` | For AI | Private server-side Gemini credential. Never use a `VITE_` name. |
| `PORT` | No | HTTP port. |
| `HOST` | No | Bind address. |
| `CORS_ORIGINS` | For split deploy | Comma-separated exact frontend origins. |

Keep `.env` out of version control. `.env.example` is the only environment file intended for the repository.

## Android

Open the repository in Android Studio and sync the Gradle project. Build the debug APK with:

```powershell
gradlew.bat :app:assembleDebug
```

The repository currently does not include a Gradle wrapper, so use the Android Studio Gradle installation or generate a wrapper with a matching Gradle version before running that command. The app uses public Qur'an services for remote text/audio and Android device services for location, sensors, and TTS.

For a signed release, create a keystore locally and provide all of these environment variables before building:

```powershell
$env:NUR_KEYSTORE_PATH = "C:\secure\nur-release.jks"
$env:NUR_KEYSTORE_PASSWORD = "..."
$env:NUR_KEY_ALIAS = "nur"
$env:NUR_KEY_PASSWORD = "..."
gradlew.bat :app:bundleRelease
```

Never commit the keystore or passwords. `NUR_VERSION_CODE` and `NUR_VERSION_NAME` can override the release version. If signing variables are absent, the release variant remains unsigned and is not suitable for distribution.

## Docker Deployment

The included Dockerfile builds the Vite client and runs the same Express server, so one service is sufficient:

```powershell
docker build -t nur .
docker run --rm -p 3000:3000 `
  -e GEMINI_API_KEY=your-secret `
  -e CORS_ORIGINS=https://your-web-domain.example `
  nur
```

Set `PORT` if the hosting provider supplies a different port. Render, Railway, or Cloud Run can deploy this container and expose the configured port.

## Troubleshooting

- `bun` or Node is missing: install Bun and Node 20+, then reopen the terminal.
- AI requests return `503`: verify `GEMINI_API_KEY` and inspect server logs; the key is never sent to the browser.
- A split frontend cannot call the API: set `VITE_API_URL` and add the exact frontend origin to `CORS_ORIGINS`.
- Android release signing fails: verify all four `NUR_*` signing variables and the keystore path.
- Qibla shows no coordinates: grant location permission and enable device location; the app intentionally does not use a fake fallback.
