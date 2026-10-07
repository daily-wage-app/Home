# Daily Wage Home

Static user-facing Daily Wage page with first-entry profile setup.

## Profile submission

The first visit opens a required form for full name, date of birth, country, gender, and consent; phone and email are optional. After the user accepts the consent checkbox, the page creates a Firebase anonymous-auth session and writes the profile to Cloud Firestore's default database at `userProfiles/{Firebase anonymous UID}`. Successful profiles and failed-sync drafts are cached in the browser's local storage. If the Firebase write fails, the form stays open and explains the sync error so the user can retry.

The user may edit the profile later. The page reads and writes only the signed-in anonymous UID's document; Firestore Security Rules enforce that boundary.

## Firebase project

- Project: `daily-29af6`
- Database: Firestore `(default)` in `asia-southeast1` (Singapore)
- Worker authentication: Firebase anonymous sign-in
- Collection: `userProfiles`
- Admin dashboard: <https://daily-wage-app.github.io/Server/>
- Authorized web origin: `daily-wage-app.github.io`

Firebase web configuration in `firebase-config.js` is public client metadata, not a service-account key. No user profile records or privileged server credentials are committed to this repository.

## Data and privacy

Fields sent to Firestore are `uid`, `fullName`, `dateOfBirth`, `country`, `gender`, optional `phone` and `email`, consent version/time, creation/update timestamps, and source. The form requires consent before sending. Only the verified administrator account `dailywage172@gmail.com` can list all profiles; a worker can read/write only their own document, and deletes are denied by the Firestore rules in `daily-wage-app/Server`.

This form does not verify identity or age. Before broad public use, configure Firebase App Check/reCAPTCHA, publish a privacy policy, establish data retention/deletion procedures, and monitor Firebase quotas. The current configuration does not upgrade the Firebase billing plan.
