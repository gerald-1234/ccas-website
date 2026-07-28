# CareConnect Frontend

This folder contains the CareConnect user interface. It uses only HTML, CSS,
and vanilla JavaScript so the code can be explained without a frontend
framework or build tool.

## Pages

- `index.html` contains patient registration and login.
- `dashboard.html` contains the authenticated clinic portal.

The dashboard is shared by all roles. JavaScript reads the logged-in user's
role from `GET /api/auth/me` and shows only the pages that role can access.

## Run Locally

Start the Express backend first:

```powershell
cd server
npm run dev
```

In a second terminal, serve the frontend:

```powershell
cd client
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

ES modules are used, so the frontend should be served through a local web
server instead of opening `index.html` directly.

The backend `CLIENT_URL` environment variable must include:

```env
CLIENT_URL=http://localhost:5500
```

## API Configuration

The API address is stored once in:

```text
assets/js/config.js
```

On `localhost`, the frontend uses:

```text
http://localhost:5000/api
```

On a deployed host, it uses the Render backend:

```text
https://careconnect-clinic-appointment-system.onrender.com/api
```

Change the production address in `config.js` if the Render service name
changes. Also update the `connect-src` value in `_headers`.

## JavaScript Structure

```text
assets/js/
  config.js       API address and storage key names
  api.js          Fetch requests and JWT session storage
  state.js        Shared data for the current page
  ui.js           Reusable formatting, modal, icon, and toast helpers
  auth.js         Login and patient registration
  dashboard.js    Role navigation and page routing
  pages/
    overview.js       Dashboard totals and quick actions
    appointments.js   Booking and appointment status workflow
    clinical.js       Vital signs and consultation records
    patients.js       Patient directory and registration
    doctors.js        Doctor directory and availability
    history.js        Patient medical history
    reports.js        Attendance and utilization reports
    admin.js          Staff accounts and audit logs
    notifications.js In-app appointment messages
    account.js        Profile and password settings
```

Each file owns one clear part of the application. This keeps the project
beginner-friendly and makes the code easier to defend.

## Request Flow

1. A user submits the login form.
2. `auth.js` calls `apiRequest('/auth/login')`.
3. `api.js` sends the request to the Express backend.
4. The returned JWT is saved in `sessionStorage`.
5. `dashboard.html` opens and calls `GET /api/auth/me`.
6. `dashboard.js` builds the navigation for the returned role.
7. A page module requests the data needed for that page.
8. `ui.js` formats and displays the response.

Protected requests include:

```http
Authorization: Bearer JWT_VALUE
```

The Supabase secret key is never used by this frontend.

## Role Areas

| Role | Main frontend pages |
|---|---|
| Patient | Appointments, doctors, medical history, notifications, account |
| Receptionist | Appointments, patients, doctors, notifications |
| Doctor | Appointments, patients, availability, clinical records |
| Nurse | Appointments, patients, vital signs |
| Manager | Overview, reports, doctors |
| Admin | All operational, reporting, and administration pages |

Frontend role checks improve the interface, but the Express middleware remains
the real security control. A hidden button is not a security feature.

## Main Design Decisions

- One dashboard is used for every role to avoid repeated HTML.
- Hash navigation such as `#appointments` keeps the static deployment simple.
- `sessionStorage` removes the token when the browser tab is closed.
- All server requests pass through one `apiRequest()` function.
- User-provided text is escaped before it is inserted into HTML.
- Appointment times come from the backend slot route instead of being guessed
  by the frontend.
- Report charts use normal HTML and CSS instead of a chart library.
- Dates are calculated from the browser's current date and are not hard-coded.

## Deployment

The `client/` folder can be deployed to a static host such as Cloudflare Pages,
Netlify, or Render Static Sites.

After deployment:

1. Set the backend `CLIENT_URL` to the exact frontend origin.
2. Confirm the Render API URL in `assets/js/config.js`.
3. Confirm the same API URL in `_headers` under `connect-src`.
4. Test login, registration, and one protected page.

Never put `SUPABASE_SECRET_KEY` or `JWT_SECRET` in this folder.

## Defence Summary

A short explanation for a defence is:

> The frontend is a static HTML, CSS, and vanilla JavaScript application. Login
> returns a JWT that is saved for the current browser tab. Every protected
> request sends that token to the Express API. The dashboard calls `/auth/me`
> to identify the user's role, then displays only the pages and actions allowed
> for that role. The backend still performs the final authentication,
> authorization, validation, and database work.
