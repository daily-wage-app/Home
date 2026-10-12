# Daily Wage Home

Static user-facing Daily Wage page with first-entry profile setup and Firebase-backed rewards. The profile setup, check-in, TrueMoney withdrawal form, and history messages are presented in Burmese.

## Profile and authentication

The first visit asks for full name, date of birth, country, gender, and consent; phone and email are optional. After consent, the page creates a Firebase anonymous-auth session and saves the profile to `userProfiles/{uid}` in the default Cloud Firestore database. The worker can read and update only their own profile. Anonymous sign-in identifies a browser session, not a verified person; clearing browser data or losing that session can make the wallet inaccessible. Do not treat profile fields as identity verification.

## Reward rules

- A worker may check in once per **Bangkok calendar day** (`Asia/Bangkok`).
- Seven consecutive Bangkok-day check-ins award **1,000 points**; missing a day resets the streak. After an award, the next seven-day cycle starts again.
- **100 points = 1 THB**. The minimum withdrawal is **10 THB / 1,000 points**, in whole baht.
- A worker can submit at most one withdrawal request per Bangkok calendar day.
- Points are deducted atomically with the request. If an administrator rejects it, the points are atomically returned.
- The user can see their request history and masked account number.

## TrueMoney withdrawal flow

The form accepts the TrueMoney account holder name and an 8–15 digit registered wallet/phone number. A separate consent checkbox is required before the app sends the account details, profile name, requested amount, and points to `withdrawalRequests/{requestId}` in Firestore. Only the signed-in worker and the verified administrator can read a request; the admin page masks the number until the administrator explicitly reveals it.

Requests start as `pending`, then the admin can mark them `processing`, `paid`, or `rejected`. The admin is expected to review and manually process within 24 hours. **This app does not connect to TrueMoney and does not transfer money automatically**; `paid` is an admin record after an off-app transfer. A rejection requires a reason and returns the deducted points.

## Firebase project and collections

- Project: `daily-29af6`
- Database: Firestore `(default)` in `asia-southeast1` (Singapore)
- Worker authentication: Firebase Anonymous sign-in
- Collections: `userProfiles`, `rewardWallets`, `withdrawalRequests`
- Admin dashboard: <https://daily-wage-app.github.io/Server/>
- Authorized web origin: `daily-wage-app.github.io`

`firebase-config.js` contains public web client configuration, not a service-account key. User records and wallet details are never stored in Git. The rules in `daily-wage-app/Server/firestore.rules` must be deployed before the reward writes can succeed. Deploying rules changes access control and should be reviewed/approved by the Firebase project owner first.

## Privacy and rollout

TrueMoney account details are sensitive financial information. The request form collects them only when the user asks to withdraw and agrees to share them with the authorized administrator. Keep admin access restricted, do not export or forward the records, establish retention/deletion procedures, publish a privacy notice, and configure Firebase App Check before broad public use. Anonymous accounts are vulnerable to account loss and multi-account reward abuse; use a durable verified sign-in and an appropriate anti-abuse policy before treating rewards as cash-equivalent.
