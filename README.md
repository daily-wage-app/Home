# Daily Wage Home

A static HTML homepage for the Daily Wage app.

## First-entry user profile

`index.html` now opens a first-entry profile form when no profile exists in the browser. It collects:

- Full name (required)
- Date of birth (required)
- Country (required)
- Gender (required, including “Prefer not to say”)
- Phone number (optional)
- Email (optional)
- Data-use consent (required)

The form validates the required fields, saves a copy in `localStorage`, updates the Home user card, and supports editing later with **Edit profile**.

## Sending data to a separate repository/service

A browser cannot safely write directly to a Git repository. GitHub tokens must never be placed in this HTML file, and raw personal data should not be committed to Git history. The Home page therefore sends a JSON `POST` to a separate HTTPS receiver API when one is configured.

Set the receiver URL in `index.html`:

```html
<meta name="user-data-endpoint" content="https://data.example.com/api/user-profiles" />
```

The receiver must:

1. Accept `POST` requests with `Content-Type: application/json`.
2. Allow CORS from the deployed Home origin.
3. Return any `2xx` status on success.
4. Authenticate/rate-limit requests server-side and validate the payload again.
5. Store personal data in a protected database or analytics store, not in a public Git repo.

### Payload contract

```json
{
  "schemaVersion": 1,
  "event": "user_profile.submitted",
  "source": "daily-wage-app/Home",
  "clientId": "browser-generated-stable-id",
  "submittedAt": "2026-10-07T00:00:00.000Z",
  "profile": {
    "fullName": "Aung Aung",
    "dateOfBirth": "1995-04-12",
    "country": "Myanmar",
    "gender": "prefer_not_to_say",
    "phone": "+95 9 000 000 000",
    "email": "user@example.com"
  }
}
```

If the endpoint is blank, the page intentionally stays local-only and tells the user that syncing is not configured. If a configured receiver fails, the profile remains saved as a local draft with a retryable error instead of being silently discarded.

## Analysis and implementation notes

- **Current repository state:** `Home` is a static HTML repository and no second data repository or API endpoint exists yet.
- **Integration boundary:** the `<meta name="user-data-endpoint">` value is the explicit boundary between this frontend and the future data/analysis service.
- **Privacy:** date of birth, gender, phone, and email are personal data. The UI requests consent and the client sends no credentials. The receiver still needs server-side access controls, encryption, retention/deletion rules, and data-minimization policies.
- **Reliability:** local-first persistence prevents a temporary network error from losing the form. The current static page does not implement an offline queue or automatic retry; add those in the receiver/client after the target service contract is confirmed.
- **Next required decision:** provide the second repository's API URL (or create a backend repository/service) before enabling production sync. A GitHub repository URL alone is not a valid browser data endpoint.
