# CareConnect Clinic Appointment System

This repository contains the Node.js and Express backend for the CareConnect
Clinic Appointment System described in the Software Analysis and Design report.

Controllers use direct Supabase queries, validation is kept in
small helper functions, and every major module has a clear responsibility.

## Main Features

- Patient registration and profile management
- Staff login with JWT authentication
- Six roles: patient, receptionist, doctor, nurse, manager, and admin
- Doctor weekly availability and available-slot generation
- Appointment booking, rescheduling, cancellation, and status updates
- Double-booking checks for both doctors and patients
- Nurse vital-sign entry
- Doctor consultation and medical-history records
- In-app appointment confirmations and reminders
- Attendance and doctor-utilization reports
- Staff-account administration and audit logs

The system does not handle billing, insurance, pharmacy inventory, laboratory
management, or payroll because those items are outside the project scope.

## Technology

- Node.js
- Express.js
- Supabase PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt password hashing

## Project Structure

```text
database/
  schema.sql                 Supabase database tables
server/
  server.js                  Starts the HTTP server
  src/
    app.js                   Express middleware and route registration
    config/                  Supabase connection
    controllers/             Application logic
    middleware/              Authentication and role checks
    routes/                  API route definitions
    scripts/                 Admin setup script
    utils/                   Small shared helper functions
  test/                      Unit tests
DEVELOPERS.md                Frontend integration guide
render.yaml                  Render deployment blueprint
```

## Local Setup

### 1. Create the database

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run the full contents of `database/schema.sql`.
4. Copy the project URL and backend secret key from the Supabase project settings.

The secret key must only be used by the Express backend. Never put it in frontend
JavaScript.

### 2. Configure the backend

Open a terminal in the server directory:

```bash
cd server
npm install
```

Create `server/.env` from `server/.env.example`, then enter the real values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your-secret-key
JWT_SECRET=a-long-random-value-with-at-least-32-characters
CLIENT_URL=http://localhost:5500
```

### 3. Create the first administrator

Set the `ADMIN_*` values in `server/.env`, then run:

```bash
npm run create-admin
```

The administrator can create receptionist, doctor, nurse, manager, and additional
admin accounts through `POST /api/admin/users`.

### 4. Start the backend

Development mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

The default local address is:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Tests

Run:

```bash
npm test
```

The tests cover password/date helpers, appointment overlap detection, doctor
schedule checks, and available-slot generation.

## Render Deployment

The repository includes `render.yaml`.

1. Push the repository to GitHub.
2. Create a Render Blueprint from the repository.
3. Enter `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and `CLIENT_URL` when Render asks.
4. Allow Render to generate `JWT_SECRET`.
5. Deploy the web service.

The blueprint uses `server/` as the root directory, runs `npm install`, starts the
API with `npm start`, and checks `/api/health`.

Run `database/schema.sql` in Supabase before the first deployment. You can create
the first administrator locally because the local script and the deployed API use
the same Supabase database.

## Authentication

Successful registration and login return a JWT:

```json
{
  "token": "jwt-value",
  "user": {
    "id": "user-uuid",
    "role": "patient"
  }
}
```

Protected requests must include:

```http
Authorization: Bearer jwt-value
```

See `DEVELOPERS.md` for the complete route list and frontend examples.

## Defence Notes

- Passwords are hashed with bcrypt before storage.
- JWT middleware identifies the logged-in user.
- Role middleware prevents users from opening routes outside their duties.
- Appointment conflict checks compare start and end times for the doctor and patient.
- A doctor can only write the record for an appointment assigned to that doctor.
- A nurse can record vital signs but cannot write a diagnosis.
- Cancelled appointments remain in the database for reporting and auditing.
- Supabase Row Level Security is enabled so the frontend must use the Express API.
