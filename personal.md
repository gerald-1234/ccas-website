# CareConnect Backend: Personal Defence Handbook

This document is a private study guide for understanding and defending the
CareConnect Clinic Appointment System backend.

It is written for someone who knows basic JavaScript but is still learning
Node.js, Express, databases, authentication, and backend development.

Read it in order at least once. After that, use the table of contents to revise
specific topics.

---

## Table of Contents

1. What the project does
2. The one-minute defence explanation
3. Important web-development vocabulary
4. JavaScript concepts used in this backend
5. Node.js, npm, and the installed packages
6. Project structure and architecture
7. How one HTTP request moves through the application
8. Environment variables and `server.js`
9. How `app.js` configures Express
10. How the Supabase connection works
11. How to read Supabase database queries
12. Database tables, keys, and relationships
13. Authentication with bcrypt and JWT
14. Authorization and role-based access control
15. Shared helper functions
16. The appointment scheduling algorithm
17. Authentication controller
18. Patient controller
19. Doctor controller
20. Appointment controller
21. Medical controller
22. Notification controller
23. Report controller
24. Admin controller and first-admin script
25. Route files and route protection
26. HTTP status codes used by the project
27. Tests and how to explain them
28. Frontend integration
29. Running locally and deploying to Render
30. A complete demonstration sequence
31. Likely defence questions and strong answers
32. Current limitations and honest answers
33. Debugging guide
34. Final revision checklist
35. Glossary

---

# 1. What the Project Does

CareConnect is a clinic appointment and patient-record system.

The clinic's old process used paper folders and appointment books. That caused
problems such as:

- Missing patient files
- Slow retrieval of medical history
- Double-booked doctors
- Patients being booked at conflicting times
- Long waiting times
- Difficulty producing management reports
- Weak control over who could view medical information

The backend solves these problems by providing an API for:

- Patient registration
- User login
- Staff-account management
- Doctor availability
- Appointment booking
- Appointment conflict checking
- Appointment rescheduling and cancellation
- Patient check-in
- Nurse vital-sign entry
- Doctor medical-record entry
- Patient medical history
- In-app reminders
- Attendance reports
- Doctor-utilization reports
- Audit logs

The project has six roles:

1. `patient`
2. `receptionist`
3. `doctor`
4. `nurse`
5. `manager`
6. `admin`

The backend is built with:

- JavaScript
- Node.js
- Express.js
- Supabase PostgreSQL
- JWT authentication
- bcrypt password hashing

---

# 2. The One-Minute Defence Explanation

Memorize the meaning of this explanation, not necessarily every word:

> CareConnect uses a three-tier architecture. The frontend is the presentation
> layer, the Express backend is the business-logic layer, and Supabase
> PostgreSQL is the data layer. Users log in with email and password. Passwords
> are stored as bcrypt hashes, not plain text. After login, the server returns a
> JWT, and protected requests send that token in the Authorization header.
> Authentication middleware verifies the token and loads the current user,
> while role middleware controls which functions each role can use. Appointment
> booking checks the doctor's weekly schedule and compares the requested time
> against existing doctor and patient appointments to prevent conflicts.
> Nurses record vital signs, assigned doctors create medical records, managers
> view reports, and admins manage staff accounts and audit logs.

If asked why the code is divided into files:

> Routes define the URL and HTTP method, middleware handles authentication and
> permissions, controllers contain the business logic, utilities contain
> reusable calculations, and the Supabase configuration provides database
> access. This separation makes the code easier to understand, test, and
> maintain.

---

# 3. Important Web-Development Vocabulary

## Frontend

The frontend is the part users see and interact with in the browser.

Examples:

- Login page
- Patient dashboard
- Appointment form
- Doctor schedule screen
- Report charts

The frontend does not directly access the secret database connection. It calls
the Express API.

## Backend

The backend runs on a server. It receives requests, applies rules, reads or
writes the database, and sends responses.

Examples of backend rules:

- A patient cannot view another patient's profile.
- A doctor cannot write a record for another doctor's appointment.
- A doctor cannot be booked outside the doctor's available hours.
- A patient cannot have overlapping appointments.

## API

API means Application Programming Interface.

In this project, the API is a collection of HTTP routes such as:

```text
POST /api/auth/login
GET /api/doctors
POST /api/appointments
PUT /api/medical/appointments/:appointmentId/record
```

The frontend calls these routes.

## HTTP Request

A request is sent by the frontend to the backend.

A request can contain:

- A method, such as `GET`, `POST`, `PATCH`, or `PUT`
- A URL
- Headers
- Query parameters
- Path parameters
- A JSON body

Example:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@careconnect.local",
  "password": "Password1"
}
```

## HTTP Response

A response is sent by the backend to the frontend.

Example:

```json
{
  "message": "Login successful.",
  "token": "a-jwt-token",
  "user": {
    "id": "user-uuid",
    "role": "admin"
  }
}
```

## JSON

JSON means JavaScript Object Notation. It is the data format used between the
frontend and backend.

JSON uses key-value pairs:

```json
{
  "first_name": "Ada",
  "role": "patient",
  "is_active": true
}
```

## Database

The database stores information permanently in tables.

Examples:

- `users`
- `patients`
- `doctors`
- `appointments`
- `medical_records`

## Table

A table stores one type of data.

For example, each row in `appointments` represents one appointment.

## Row

A row is one record in a table.

## Column

A column is one property of a row.

For example:

```text
appointment_date
appointment_time
status
reason_for_visit
```

## Authentication

Authentication answers:

> Who is this user?

Login and JWT verification perform authentication.

## Authorization

Authorization answers:

> What is this user allowed to do?

Role middleware and controller ownership checks perform authorization.

## Middleware

Middleware is a function that runs between the incoming request and the final
controller.

It can:

- Read the request
- Reject the request
- Add information to the request
- Continue to the next function

Example request flow:

```text
Request
  -> authMiddleware
  -> roleMiddleware
  -> controller
  -> response
```

---

# 4. JavaScript Concepts Used in This Backend

## 4.1 `const` and `let`

`const` creates a variable that cannot be assigned a completely new value.

```js
const port = 5000;
```

This is not allowed:

```js
port = 6000;
```

However, a `const` object can still have its properties changed:

```js
const update = { failed_login_attempts: 1 };
update.locked_until = null;
```

`let` creates a variable whose value may change:

```js
let profile = null;
profile = result.data;
```

Use `const` by default. Use `let` when reassignment is required.

## 4.2 Strings and Template Literals

A normal string:

```js
const action = 'LOGIN';
```

A template literal uses backticks and can insert values with `${...}`:

```js
const message = `Patient ID: ${patient.id}`;
```

If `patient.id` is `123`, the result is:

```text
Patient ID: 123
```

## 4.3 Arrays

An array is an ordered list:

```js
const roles = ['patient', 'doctor', 'admin'];
```

Check whether an array contains a value:

```js
roles.includes('doctor');
```

This returns `true`.

## 4.4 Objects

An object stores key-value pairs:

```js
const user = {
  id: '123',
  email: 'ada@example.com',
  role: 'patient',
};
```

Read a property:

```js
user.role
```

## 4.5 Functions

A named function:

```js
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
```

It receives `email`, processes it, and returns a result.

Calling it:

```js
const email = normalizeEmail('  ADA@EXAMPLE.COM ');
```

Result:

```text
ada@example.com
```

## 4.6 Arrow Functions

An arrow function is a shorter function syntax:

```js
const doubled = numbers.map((number) => number * 2);
```

This:

```js
(number) => number * 2
```

means:

```js
function (number) {
  return number * 2;
}
```

## 4.7 Callback Functions

A callback is a function passed into another function.

Example from CORS:

```js
origin(origin, callback) {
  return callback(null, true);
}
```

Express or the CORS library provides `callback`. Our code calls it when the
origin has been checked.

## 4.8 `return`

`return` ends a function and optionally sends back a value.

In a controller:

```js
return res.status(400).json({ error: 'Email is invalid.' });
```

The `return` is important because it stops the rest of the function from
continuing.

Without `return`, the code might try to send another response later and cause:

```text
Cannot set headers after they are sent
```

## 4.9 Truthy and Falsy Values

JavaScript treats some values as false in conditions.

Falsy values include:

- `false`
- `0`
- `''`
- `null`
- `undefined`
- `NaN`

Example:

```js
if (!email) {
  // runs when email is empty, null, or undefined
}
```

## 4.10 The `||` Operator

`||` means "use the first truthy value."

```js
const port = Number(process.env.PORT) || 5000;
```

If `PORT` exists and is valid, use it. Otherwise, use `5000`.

Another example:

```js
const header = req.headers.authorization || '';
```

If the header is missing, use an empty string so later string operations do not
crash.

## 4.11 The `&&` Operator

`&&` means both sides must be truthy.

```js
req.body && req.body.email
```

This first checks that `req.body` exists before reading `email`.

## 4.12 Ternary Operator

The ternary operator is a short `if/else` expression:

```js
const token = header.startsWith('Bearer ') ? header.slice(7) : null;
```

Equivalent:

```js
let token;
if (header.startsWith('Bearer ')) {
  token = header.slice(7);
} else {
  token = null;
}
```

## 4.13 Destructuring

Object destructuring extracts properties into variables:

```js
const { data, error } = await supabase.from('users').select('*');
```

Equivalent:

```js
const result = await supabase.from('users').select('*');
const data = result.data;
const error = result.error;
```

Array destructuring:

```js
const [hours, minutes] = '09:30'.split(':').map(Number);
```

Result:

```js
hours === 9;
minutes === 30;
```

## 4.14 Spread Syntax

Spread syntax copies values.

Array spread:

```js
const combined = [
  ...(doctorResult.data || []),
  ...(patientResult.data || []),
];
```

This creates one array containing both result arrays.

Object spread:

```js
const appointmentResponse = {
  ...appointment,
  patient,
  doctor,
};
```

This copies all appointment properties and adds patient and doctor.

## 4.15 Rest Syntax

Rest syntax collects the remaining properties.

From the medical history code:

```js
data.map(({ doctor_notes, ...record }) => record);
```

For every medical record:

- Extract `doctor_notes`
- Put every other property into `record`
- Return `record`

This hides private doctor notes from the patient response.

## 4.16 Array Methods

### `.map()`

Transforms every item and returns a new array.

```js
const rows = periods.map((period) => ({
  doctor_id: doctor.id,
  day_of_week: Number(period.day_of_week),
}));
```

### `.filter()`

Keeps only matching items.

```js
const completed = appointments.filter(
  (appointment) => appointment.status === 'completed'
);
```

### `.some()`

Returns `true` when at least one item matches.

```js
const conflict = appointments.some((appointment) => {
  return timesOverlap(...);
});
```

### `.reduce()`

Combines all items into one result.

```js
const totalMinutes = appointments.reduce(
  (sum, appointment) => sum + appointment.duration_minutes,
  0
);
```

The `0` is the starting value of `sum`.

## 4.17 `async` and `await`

Database operations take time, so they are asynchronous.

An asynchronous function is declared with `async`:

```js
async function login(req, res) {
}
```

`await` pauses that function until a Promise finishes:

```js
const { data, error } = await supabase
  .from('users')
  .select('*');
```

It does not block the entire Node.js server. Other requests can still be
processed.

## 4.18 Promises and `Promise.all`

A Promise represents work that will finish later.

`Promise.all` runs independent asynchronous operations together:

```js
const [scheduleResult, appointmentResult] = await Promise.all([
  loadSchedule(),
  loadAppointments(),
]);
```

This is faster than waiting for the first query before starting the second.

Use it only when the second operation does not depend on the result of the
first.

## 4.19 `try` and `catch`

Potentially failing code goes inside `try`:

```js
try {
  const result = await databaseOperation();
  return res.json(result);
} catch (error) {
  return res.status(500).json({ error: 'Operation failed.' });
}
```

If an error is thrown, execution jumps to `catch`.

## 4.20 Throwing Errors

This:

```js
if (error) throw error;
```

means:

> If Supabase returned an error, stop normal execution and let `catch` handle it.

## 4.21 `require()` and `module.exports`

This project uses CommonJS modules.

Import:

```js
const express = require('express');
```

Export:

```js
module.exports = app;
```

Export multiple values:

```js
module.exports = {
  buildAvailableSlots,
  timesOverlap,
};
```

Import selected values:

```js
const { buildAvailableSlots, timesOverlap } = require('./utils/appointment');
```

## 4.22 Regular Expressions

A regular expression checks a text pattern.

Email pattern:

```js
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

Time pattern:

```js
/^\d{2}:\d{2}(:\d{2})?$/
```

The time pattern means:

- Start of text: `^`
- Exactly two digits: `\d{2}`
- A colon
- Exactly two digits
- An optional `:SS` part
- End of text: `$`

## 4.23 `Number()`, `String()`, and `parseInt()`

HTTP input often arrives as strings.

Convert to number:

```js
Number(req.body.duration_minutes);
```

Convert safely to string:

```js
String(req.body.first_name).trim();
```

Parse an integer:

```js
Number.parseInt(req.query.page, 10);
```

The `10` means base 10.

## 4.24 `null` and `undefined`

`undefined` usually means a property was not supplied.

`null` usually means the property intentionally has no value.

Example:

```js
phone: req.body.phone || null
```

If no phone is supplied, store SQL `NULL`.

---

# 5. Node.js, npm, and Installed Packages

## Node.js

JavaScript normally runs in a browser. Node.js lets JavaScript run on a server.

Node provides:

- File execution
- Environment variables
- Networking
- Package loading
- A server runtime

## npm

npm is the Node package manager.

Important commands:

```bash
npm install
npm start
npm run dev
npm test
npm run create-admin
```

## `package.json`

`server/package.json` describes the backend.

Important fields:

```json
{
  "main": "server.js",
  "type": "commonjs"
}
```

`main` identifies the entry file.

`type: commonjs` means the project uses `require()` and `module.exports`.

## Scripts

```json
"scripts": {
  "create-admin": "node src/scripts/createAdmin.js",
  "dev": "node --watch server.js",
  "start": "node server.js",
  "test": "node --test"
}
```

### `npm run dev`

`node --watch` restarts the server after code changes.

### `npm start`

Starts the normal server. Render uses this command.

### `npm test`

Runs Node's built-in test runner.

### `npm run create-admin`

Creates the first administrator from environment variables.

## Dependencies

### `express`

Creates the HTTP server, routes, middleware, requests, and responses.

### `@supabase/supabase-js`

Connects the backend to Supabase PostgreSQL through Supabase's JavaScript client.

### `bcryptjs`

Hashes passwords and compares login passwords with stored hashes.

### `jsonwebtoken`

Creates and verifies JWT authentication tokens.

### `dotenv`

Loads values from `server/.env` into `process.env`.

### `cors`

Controls which frontend origins may call the API from a browser.

### `helmet`

Adds security-related HTTP response headers.

### `compression`

Compresses responses to reduce transferred data.

### `express-rate-limit`

Limits how many requests an IP address can send in a time window.

---

# 6. Project Structure and Architecture

```text
Care-connect-Appointment-System/
  database/
    schema.sql
  server/
    .env.example
    package.json
    package-lock.json
    server.js
    src/
      app.js
      config/
        supabase.js
      controllers/
        adminController.js
        appointmentController.js
        authController.js
        doctorController.js
        medicalController.js
        notificationController.js
        patientController.js
        reportController.js
      middleware/
        authMiddleware.js
        roleMiddleware.js
      routes/
        adminRoutes.js
        appointmentRoutes.js
        authRoutes.js
        doctorRoutes.js
        medicalRoutes.js
        notificationRoutes.js
        patientRoutes.js
        reportRoutes.js
      scripts/
        createAdmin.js
      utils/
        appointment.js
        audit.js
        helpers.js
    test/
      appointment.test.js
      helpers.test.js
  DEVELOPERS.md
  README.md
  render.yaml
```

## Responsibility of Each Layer

### Routes

Routes answer:

> Which controller should handle this URL and method?

Example:

```js
router.post('/login', controller.login);
```

### Middleware

Middleware answers:

> Is the request authenticated and authorized?

### Controllers

Controllers answer:

> What business steps must happen for this operation?

### Utilities

Utilities contain reusable logic that does not belong to one route.

Examples:

- Password validation
- Pagination
- Time conversion
- Appointment-overlap calculation

### Config

Configuration files create reusable connections, such as the Supabase client.

### Database Schema

The SQL file defines the tables, columns, constraints, foreign keys, and indexes.

---

# 7. How One HTTP Request Moves Through the Application

Consider:

```text
POST /api/appointments
```

## Step 1: The frontend sends the request

```http
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

```json
{
  "doctor_id": "doctor-uuid",
  "appointment_date": "2026-08-10",
  "appointment_time": "09:30",
  "duration_minutes": 30,
  "reason_for_visit": "Headache"
}
```

## Step 2: `app.js` receives it

This line mounted appointment routes:

```js
app.use('/api/appointments', appointmentRoutes);
```

## Step 3: The route file matches it

```js
router.post(
  '/',
  allowRoles('patient', 'receptionist', 'admin'),
  controller.createAppointment
);
```

Because the router is mounted at `/api/appointments`, `/` means the full route
is `/api/appointments`.

## Step 4: Authentication middleware runs

The route file has:

```js
router.use(authMiddleware);
```

It:

1. Reads the `Authorization` header
2. Extracts the JWT
3. Verifies the signature and expiry
4. Loads the current user from the database
5. Rejects inactive accounts
6. Sets `req.user`
7. Calls `next()`

## Step 5: Role middleware runs

```js
allowRoles('patient', 'receptionist', 'admin')
```

It checks:

```js
roles.includes(req.user.role)
```

If the role is not allowed, it returns `403`.

## Step 6: The controller runs

`createAppointment`:

1. Checks required fields
2. Finds the patient
3. Finds the doctor
4. Checks the doctor status
5. Checks doctor availability
6. Checks the requested time is in the future
7. Checks doctor and patient conflicts
8. Inserts the appointment
9. Creates notifications
10. Creates an audit log
11. Returns `201`

## Step 7: The frontend receives JSON

```json
{
  "message": "Appointment booked.",
  "appointment": {}
}
```

That complete journey is a strong defence explanation.

---

# 8. Environment Variables and `server.js`

## Why `.env` Exists

Some values must not be written directly into source code.

Examples:

- Supabase URL
- Supabase secret key
- JWT secret
- Allowed frontend URL

The real `.env` file is ignored by Git.

## Loading `.env`

```js
require('dotenv').config();
```

This reads `server/.env` and places values in `process.env`.

Example:

```js
process.env.JWT_SECRET
```

## Required Variable Check

```js
const requiredVariables = ['SUPABASE_URL', 'JWT_SECRET'];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} is missing from server/.env`);
  }
}
```

This is called "fail fast."

Instead of starting a broken server, the application stops immediately with a
clear configuration error.

## Supporting Two Supabase Key Names

```js
if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY)
```

This allows either the newer secret-key name or the older service-role-key name.

## JWT Secret Length

```js
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters.');
}
```

A longer random secret makes token forgery harder.

## Port

```js
const port = Number(process.env.PORT) || 5000;
```

Locally, it normally uses `5000`.

Render supplies its own `PORT`, so the application must respect it.

## Starting the Server

```js
app.listen(port, '0.0.0.0', () => {
  console.log(`CareConnect API running on port ${port}`);
});
```

`0.0.0.0` means listen on all network interfaces, which allows the hosting
platform to reach the server.

---

# 9. How `app.js` Configures Express

## Creating the Application

```js
const app = express();
```

This creates the Express application.

## Trusting One Proxy

```js
app.set('trust proxy', 1);
```

Render places the Node server behind a reverse proxy. Trusting one proxy helps
Express and rate limiting understand the original request.

## Helmet

```js
app.use(helmet());
```

Helmet adds security headers.

Defence answer:

> Helmet improves the API's default HTTP security posture by adding standard
> protective response headers.

## Compression

```js
app.use(compression());
```

Large JSON responses can be compressed before being sent.

## JSON Parser

```js
app.use(express.json({ limit: '200kb' }));
```

This:

- Reads JSON request bodies
- Creates `req.body`
- Rejects bodies larger than 200 KB

Without `express.json()`, `req.body` would usually be undefined.

## CORS

```js
const allowedOrigins = String(process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
```

If:

```env
CLIENT_URL=http://localhost:5500,https://careconnect.example.com
```

Then:

1. `.split(',')` creates an array
2. `.map(...trim())` removes spaces
3. `.filter(Boolean)` removes empty items

CORS check:

```js
if (!origin || allowedOrigins.includes(origin)) {
  return callback(null, true);
}
```

No origin is allowed for tools such as Postman or server-to-server requests.

Browser origins must be in the allowlist.

## General Rate Limit

```js
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});
```

Calculation:

```text
15 minutes x 60 seconds x 1000 milliseconds
```

An IP can make up to 500 API requests in that window.

## Login Rate Limit

Login has a tighter limit:

```js
max: 30
```

This reduces password guessing.

## Health Routes

```js
app.get('/', ...);
app.get('/api/health', ...);
```

The health route lets Render or a developer verify that the server process is
running.

It does not prove every database operation is working. It proves the Express
server is responding.

## Mounting Routers

```js
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
```

The prefix is combined with paths inside the route file.

## 404 Handler

```js
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});
```

It is placed after all valid routes. Therefore it only runs when nothing
matched.

## Final Error Handler

```js
app.use((error, req, res, next) => {
});
```

Express recognizes error middleware because it has four parameters.

It handles:

- Blocked CORS origins with `403`
- Unexpected errors with `500`

---

# 10. How the Supabase Connection Works

File:

```text
server/src/config/supabase.js
```

Import:

```js
const { createClient } = require('@supabase/supabase-js');
```

Choose a key:

```js
const key =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
```

Create the client:

```js
const supabase = createClient(process.env.SUPABASE_URL, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

The application does not use Supabase Auth sessions. It uses its own `users`
table, bcrypt, and JWT. Therefore Supabase token refresh and session persistence
are disabled.

Important security rule:

> The secret key stays in the backend environment. The frontend must never
> receive it.

Finally:

```js
module.exports = supabase;
```

Every controller imports the same configured client.

---

# 11. How to Read Supabase Database Queries

Supabase queries are chainable.

## Select All Rows

```js
const { data, error } = await supabase
  .from('doctors')
  .select('*');
```

Meaning:

```text
SELECT * FROM doctors;
```

## Filter with `.eq()`

```js
.eq('email', email)
```

Meaning:

```text
WHERE email = supplied_email
```

## Match Several Values with `.in()`

```js
.in('status', ['scheduled', 'checked_in'])
```

Meaning:

```text
WHERE status IN ('scheduled', 'checked_in')
```

## Greater Than or Equal

```js
.gte('appointment_date', from)
```

Meaning:

```text
appointment_date >= from
```

## Less Than or Equal

```js
.lte('appointment_date', to)
```

## Insert

```js
supabase.from('users').insert({
  email,
  role: 'patient',
});
```

## Update

```js
supabase
  .from('appointments')
  .update({ status: 'cancelled' })
  .eq('id', appointment.id);
```

Always notice the `.eq()` on updates. Without a filter, many rows could be
updated.

## Delete

```js
supabase
  .from('notifications')
  .delete()
  .eq('appointment_id', appointment.id);
```

## Upsert

```js
.upsert(values, { onConflict: 'appointment_id' })
```

Upsert means:

- Insert if no matching row exists
- Update if a matching row exists

`appointment_id` is unique in `vital_signs` and `medical_records`, so one
appointment has at most one current vitals row and one medical record.

## `.select()` After Insert or Update

```js
.insert(values)
.select()
```

This asks Supabase to return the inserted row.

## `.single()`

```js
.single()
```

The query must return exactly one row.

## `.maybeSingle()`

```js
.maybeSingle()
```

The query may return:

- One row
- No row

It is useful for "find if it exists" operations.

## Ordering

```js
.order('created_at', { ascending: false })
```

Newest rows come first.

## Pagination with `.range()`

```js
.range(from, to)
```

Supabase uses inclusive indexes.

For page 1 and limit 20:

```text
from = 0
to = 19
```

## Count

```js
.select('*', { count: 'exact' })
```

Supabase returns:

```js
{
  data,
  count,
  error
}
```

## Count Without Returning Rows

```js
.select('id', { count: 'exact', head: true })
```

`head: true` asks for the count without downloading row data.

## Joined Relationship Select

```js
const APPOINTMENT_SELECT = `
  *,
  patient:patients!appointments_patient_id_fkey(
    id,user_id,first_name,last_name,email,phone
  ),
  doctor:doctors!appointments_doctor_id_fkey(
    id,user_id,first_name,last_name,specialization,consultation_room
  )
`;
```

This looks confusing, but it means:

- Select every appointment column with `*`
- Follow the patient foreign key
- Return selected patient fields under the name `patient`
- Follow the doctor foreign key
- Return selected doctor fields under the name `doctor`

The response becomes:

```js
{
  id: 'appointment-id',
  patient_id: 'patient-id',
  doctor_id: 'doctor-id',
  patient: {
    first_name: 'Ada'
  },
  doctor: {
    first_name: 'Ifeanyi'
  }
}
```

---

# 12. Database Tables, Keys, and Relationships

## Primary Key

A primary key uniquely identifies a row.

Every table uses:

```sql
id uuid primary key default gen_random_uuid()
```

UUID means Universally Unique Identifier.

Example:

```text
550e8400-e29b-41d4-a716-446655440000
```

## Foreign Key

A foreign key connects one table to another.

Example:

```sql
patient_id uuid not null references public.patients(id)
```

This means every appointment's `patient_id` must point to a real patient.

## Main Relationships

```text
users 1 ---- 0..1 patients
users 1 ---- 0..1 doctors

patients 1 ---- many appointments
doctors 1 ---- many appointments

doctors 1 ---- many doctor_availability rows

appointments 1 ---- 0..1 vital_signs
appointments 1 ---- 0..1 medical_records
appointments 1 ---- many notifications

users 1 ---- many audit_logs
```

## Why `users` and `patients` Are Separate

`users` stores login information:

- Email
- Password hash
- Role
- Active status
- Lock information

`patients` stores medical and demographic information:

- Date of birth
- Gender
- Address
- Blood group
- Emergency contact

This separation follows normalization and separation of concerns.

A receptionist can create a patient without creating a login account. In that
case, `patients.user_id` is `NULL`.

## `users`

Important columns:

- `email`: unique login identity
- `password_hash`: hashed password
- `role`: access role
- `is_active`: account enabled or disabled
- `failed_login_attempts`: wrong-password counter
- `locked_until`: temporary lock ending time

## `patients`

Important constraints:

```sql
date_of_birth <= current_date
```

A future date of birth is rejected by the database.

Blood group must be one of the allowed values.

## `doctors`

Stores professional information such as:

- Specialization
- Consultation room
- Availability status

## `doctor_availability`

Each row represents one weekly working period.

Example:

```text
Doctor A
Monday
09:00 to 13:00
30-minute slots
```

`day_of_week` uses:

```text
1 Monday
2 Tuesday
3 Wednesday
4 Thursday
5 Friday
6 Saturday
7 Sunday
```

## `appointments`

Links exactly one patient to exactly one doctor.

Status values:

- `scheduled`
- `checked_in`
- `completed`
- `cancelled`
- `no_show`

Cancelled appointments are not deleted. This preserves history and supports
reports and audits.

## `vital_signs`

`appointment_id` is unique.

Therefore one appointment has one current vital-sign record. Calling upsert
again updates it.

## `medical_records`

Also has a unique `appointment_id`.

The record stores:

- Diagnosis
- Treatment
- Prescription
- Doctor notes
- Visit date

## `notifications`

Notifications are in-app messages.

`show_at` controls when the message becomes visible.

## `audit_logs`

Stores significant actions:

- Who acted
- Action name
- Details
- Time

## Indexes

Indexes speed up common searches:

```sql
appointments_date_index
appointments_doctor_index
appointments_patient_index
medical_records_patient_index
```

Defence answer:

> An index is an additional database structure that makes searches faster,
> especially for columns frequently used in WHERE conditions.

## Row Level Security

RLS is enabled on all tables.

The frontend is not given a direct table policy or backend secret. It must call
the Express API.

The server-side Supabase secret client performs the database operations.

---

# 13. Authentication with bcrypt and JWT

## Why Passwords Are Hashed

The database must not store plain-text passwords.

This would be dangerous:

```text
password = Password1
```

Instead:

```js
const passwordHash = await bcrypt.hash(password, 10);
```

The result looks like random text and cannot simply be reversed.

The `10` is the bcrypt cost factor. It controls how much computational work is
used.

## Password Comparison

Login does not decrypt the stored hash.

It uses:

```js
const passwordMatches = await bcrypt.compare(
  suppliedPassword,
  user.password_hash
);
```

bcrypt hashes the supplied password appropriately and checks whether it matches.

## JWT

JWT means JSON Web Token.

The token is created after successful login:

```js
jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
);
```

The token contains:

- User ID
- Role
- Issued time
- Expiry time
- Digital signature

The token is signed, not encrypted. Do not place passwords or medical data
inside it.

## Sending the Token

Frontend request:

```http
Authorization: Bearer JWT_TOKEN
```

## Verifying the Token

```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

Verification fails when:

- The signature is invalid
- The token was modified
- The token expired
- The secret does not match

## Why the Middleware Loads the User Again

The JWT contains a role, but the middleware still queries `users`.

This allows the server to check the current `is_active` value.

If an admin deactivates an account, the next protected request is rejected even
if the JWT has not expired.

## Account Locking

Wrong passwords increment:

```text
failed_login_attempts
```

After five wrong attempts:

- The counter resets
- `locked_until` is set to 15 minutes in the future

During the lock, login returns `423 Locked`.

## Logout

The current implementation uses stateless JWTs.

The logout endpoint tells the frontend to remove the saved token.

Because there is no token blacklist, deleting the frontend token is the logout
mechanism.

Be ready to explain this as a current project limitation.

---

# 14. Authorization and Role-Based Access Control

Authentication verifies identity.

Authorization verifies permission.

## Role Middleware

```js
function allowRoles(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You do not have permission for this action.'
      });
    }
    next();
  };
}
```

## Rest Parameter

The syntax:

```js
...roles
```

collects all supplied roles into an array.

Calling:

```js
allowRoles('doctor', 'admin')
```

creates:

```js
roles = ['doctor', 'admin'];
```

## Middleware Factory

`allowRoles` does not directly handle a request.

It returns another function that handles the request.

This lets different routes create different permission checks.

## Route-Level vs Record-Level Authorization

Route-level:

```js
allowRoles('doctor', 'admin')
```

Record-level:

```js
appointment.doctor.user_id === req.user.id
```

The second check is necessary because allowing the `doctor` role alone would let
one doctor modify another doctor's appointment.

This is an important defence point:

> Role checks decide the type of user allowed, while ownership checks decide
> whether that user is connected to the specific record.

---

# 15. Shared Helper Functions

File:

```text
server/src/utils/helpers.js
```

## Email Normalization

```js
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
```

It prevents these from being treated differently:

```text
ADA@EXAMPLE.COM
ada@example.com
 ada@example.com
```

## Email Validation

```js
EMAIL_PATTERN.test(normalizeEmail(email))
```

This performs basic format validation.

It is not a complete proof that the mailbox exists.

## Missing Fields

```js
function missingFields(body, fields) {
  return fields.filter((field) => {
    const value = body && body[field];
    return (
      value === undefined ||
      value === null ||
      String(value).trim() === ''
    );
  });
}
```

It returns an array of required field names that are absent or empty.

Example:

```js
missingFields(
  { email: 'a@example.com' },
  ['email', 'password']
);
```

Result:

```js
['password']
```

## Password Validation

Rules:

- At least 8 characters
- At most 72 characters
- At least one letter
- At least one number

It returns:

- An error message when invalid
- `null` when valid

This lets controllers write:

```js
const passwordError = validatePassword(password);
if (passwordError) {
  return res.status(400).json({ error: passwordError });
}
```

## Date Format Validation

```js
/^\d{4}-\d{2}-\d{2}$/
```

This checks the format only.

The database also checks date data types, and the patient table checks that date
of birth is not in the future.

## Time to Minutes

```js
function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
}
```

Example:

```text
09:30
```

Calculation:

```text
9 x 60 + 30 = 570
```

Comparing appointment times becomes easier after converting them to one number.

## Day of Week

JavaScript returns:

```text
0 Sunday
1 Monday
...
6 Saturday
```

The database uses:

```text
1 Monday
...
7 Sunday
```

Therefore:

```js
return jsDay === 0 ? 7 : jsDay;
```

converts Sunday from `0` to `7`.

## Pagination

```js
const page = Math.max(1, parseInt(query.page) || 1);
const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
```

This ensures:

- Page cannot be below 1
- Limit cannot be below 1
- Limit cannot exceed 100
- Defaults are page 1 and 20 rows

For page 2 and limit 20:

```text
from = 20
to = 39
```

---

# 16. The Appointment Scheduling Algorithm

This is one of the most important parts of the defence.

File:

```text
server/src/utils/appointment.js
```

## 16.1 Overlap Formula

Two time ranges overlap when:

```text
firstStart < secondEnd
AND
firstEnd > secondStart
```

Code:

```js
return firstStartMinutes < secondEndMinutes &&
       firstEndMinutes > secondStartMinutes;
```

## Example 1: Overlap

Appointment A:

```text
09:00 to 09:30
```

Appointment B:

```text
09:15 to 09:45
```

They overlap because B starts before A ends.

## Example 2: No Overlap

Appointment A:

```text
09:00 to 09:30
```

Appointment B:

```text
09:30 to 10:00
```

They touch at the boundary but do not overlap.

That is why the formula uses `<` and `>`, not `<=` and `>=`.

## 16.2 Checking Doctor Schedule

```js
function fitsDoctorSchedule(time, duration, schedule) {
}
```

The requested appointment must:

1. Start at or after the period start
2. End at or before the period end
3. Use the same duration as the doctor's slot
4. Start exactly on a slot boundary

Slot-boundary check:

```js
(start - periodStart) % slotDuration === 0
```

The `%` operator gives the remainder.

Example:

```text
Period starts: 09:00
Slot: 30 minutes
Requested: 10:00
Difference: 60
60 % 30 = 0
```

Valid.

Requested `10:15`:

```text
Difference: 75
75 % 30 = 15
```

Invalid.

## 16.3 Building Available Slots

For each availability period:

```js
for (
  let start = periodStart;
  start + duration <= end;
  start += duration
)
```

This creates every possible slot.

For `09:00` to `10:30` with 30-minute slots:

```text
09:00
09:30
10:00
```

It then checks every slot against booked appointments:

```js
const isBooked = appointments.some(...);
```

Only unbooked slots are returned.

## 16.4 Checking Both Doctor and Patient

The controller queries:

- Existing appointments for the doctor
- Existing appointments for the patient

This prevents:

- One doctor having two patients at the same time
- One patient booking two doctors at the same time

## Why Cancelled and Completed Appointments Do Not Block Slots

Conflict queries only include:

```js
['scheduled', 'checked_in']
```

Cancelled appointments should not block a slot.

Completed appointments are historical and normally cannot conflict with a new
future booking.

---

# 17. Authentication Controller

File:

```text
server/src/controllers/authController.js
```

## `createToken(user)`

Creates a JWT containing only:

- User ID
- Role

It expires using `JWT_EXPIRES_IN`, defaulting to eight hours.

## `publicUser(user)`

Returns safe account fields.

It deliberately does not return:

- `password_hash`
- Failed-login count
- Lock information

## `patientData(body)`

Converts incoming registration data to the exact database column names and
normalizes text.

## `register`

Detailed flow:

1. Define required fields
2. Find missing fields
3. Normalize email
4. Validate password
5. Validate date format
6. Validate blood group
7. Hash password
8. Insert the `users` row with role `patient`
9. Insert the `patients` row linked by `user_id`
10. If patient insertion fails, remove the incomplete user
11. Create an audit log
12. Return token, user, and patient

## Why There Are Two Inserts

Login data and patient data belong to different tables.

The user row must be created first because the patient row needs:

```js
user_id: user.id
```

## Error Code `23505`

PostgreSQL code `23505` means a unique constraint was violated.

Here it normally means the email already exists.

The API converts it to:

```text
409 Conflict
```

## Cleanup on Patient Insert Failure

```js
await supabase.from('users').delete().eq('id', user.id);
```

Supabase's normal JavaScript chain here is not a database transaction.

The cleanup avoids leaving a patient login without a patient profile.

## `login`

Detailed flow:

1. Normalize email
2. Check email and password exist
3. Find the user
4. Reject unknown credentials
5. Reject inactive account
6. Check temporary lock
7. Compare password with bcrypt
8. On failure, increment attempts
9. Lock for 15 minutes after five failures
10. On success, clear failures and lock
11. Add audit log
12. Return JWT and safe user object

## Why Login Uses a Generic Credential Error

```text
Invalid email or password.
```

It does not separately say "email not found" or "wrong password."

This reveals less information to attackers.

## `me`

Returns the logged-in account.

For:

- Patient: also loads patient profile
- Doctor: also loads doctor profile
- Other roles: profile remains `null`

## `changePassword`

1. Validate both passwords exist
2. Validate new password strength
3. Load stored password hash
4. Compare current password
5. Hash new password
6. Update database
7. Audit the change

## `logout`

The backend explains that the frontend should delete the token.

---

# 18. Patient Controller

File:

```text
server/src/controllers/patientController.js
```

## Two Ways to Create a Patient

### Self-registration

```text
POST /api/auth/register
```

Creates:

- User account
- Patient profile

### Staff registration

```text
POST /api/patients
```

Creates:

- Patient profile only

This supports walk-in patients who do not need online login.

## `listPatients`

Supports:

- Pagination
- Search by first name
- Search by last name
- Search by phone

Search cleaning:

```js
replace(/[,%()]/g, '')
```

This removes characters that could interfere with the Supabase filter string.

`ilike` performs case-insensitive text matching.

## `getPatient`

Loads by:

```js
req.params.id
```

A patient user can only access a row whose:

```js
patient.user_id === req.user.id
```

Staff access is already limited by route middleware.

## `updatePatient`

This creates a whitelist:

```js
const fields = [
  'first_name',
  'last_name',
  ...
];
```

Only whitelisted fields are copied.

This prevents a user from updating sensitive or unrelated columns such as:

- `id`
- `user_id`
- `registration_date`

Ownership rules:

- Patient can update own profile
- Receptionist can update
- Admin can update

---

# 19. Doctor Controller

File:

```text
server/src/controllers/doctorController.js
```

## `listDoctors`

This query:

```js
.select('*, doctor_availability(*)')
```

returns each doctor together with availability periods.

## `getDoctor`

Loads one doctor by URL parameter.

## `getAvailableSlots`

Detailed flow:

1. Read `date` from query parameters
2. Validate `YYYY-MM-DD` format
3. Convert date to day of week
4. Load doctor availability for that weekday
5. Load active appointments for that date
6. Generate slots
7. Remove booked slots
8. Return free slots

The two database reads use `Promise.all` because they are independent.

## `setAvailability`

Request body:

```json
{
  "periods": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "13:00",
      "slot_duration_minutes": 30
    }
  ]
}
```

The controller:

1. Checks periods is a non-empty array
2. Checks required fields
3. Checks day is between 1 and 7
4. Finds the doctor
5. Ensures doctor users modify only themselves
6. Deletes old availability
7. Inserts new availability
8. Creates an audit log

An admin can edit any doctor's availability.

---

# 20. Appointment Controller

File:

```text
server/src/controllers/appointmentController.js
```

This is the largest and most important controller.

## `APPOINTMENT_SELECT`

Creates one reusable join definition so list, get, reschedule, cancel, and status
operations all receive patient and doctor details.

## `appointmentDateTime(date, time)`

```js
const offset = process.env.CLINIC_UTC_OFFSET || '+01:00';
return new Date(`${date}T${time}:00${offset}`);
```

This combines separate database date and time values into a JavaScript `Date`.

Nigeria uses UTC+01:00, configured in `.env`.

It is used to:

- Reject past appointments
- Calculate reminder time

## `getPatientForRequest(req)`

If the caller is a patient:

```js
req.user.id -> patients.user_id
```

The patient cannot choose another patient's ID.

If staff books:

```js
req.body.patient_id
```

is used.

## `appointmentHasConflict`

Receives one object:

```js
{
  appointmentId,
  patientId,
  doctorId,
  date,
  time,
  duration
}
```

This is object-parameter syntax. It makes many parameters clearer and avoids
depending on their position.

It queries doctor and patient appointments on the same date.

During rescheduling, it skips the current appointment:

```js
if (appointment.id === appointmentId) return false;
```

Otherwise the appointment would conflict with itself.

## `queueNotifications`

Only online patients have `patient.user_id`.

Therefore:

```js
if (!patient.user_id) return;
```

Staff-created patients do not receive in-app account notifications.

Before creating new notifications, unread old notifications for that appointment
are removed.

Types:

- `confirmation`
- `rescheduled`
- `cancelled`
- `reminder`

Reminder calculation:

```text
appointment time - reminder hours
```

The reminder row is created immediately but has a future `show_at`.

The notification route only returns rows where:

```text
show_at <= current time
```

## `validateBooking`

Checks:

1. Date format
2. Time format
3. Integer duration
4. Minimum duration
5. Appointment is in the future
6. Doctor availability status
7. Weekly schedule match
8. Slot boundary and duration match

Instead of sending responses itself, it returns:

- Error message when invalid
- `null` when valid

## `createAppointment`

Detailed sequence:

1. Check required request fields
2. Require `patient_id` for staff booking
3. Load patient and doctor together
4. Return `404` if either is absent
5. Validate requested date and time
6. Check conflict
7. Insert appointment
8. Create confirmation and reminder
9. Add audit log
10. Return `201`

## `listAppointments`

The result is filtered by role:

- Patient sees own appointments
- Doctor sees assigned appointments
- Receptionist sees all
- Nurse sees all
- Admin sees all
- Manager is rejected because managers use reports

Optional filters:

- Status
- Date
- Doctor ID
- Patient ID
- Page
- Limit

## `getAppointment`

Record-level permission:

- Receptionist, nurse, admin: allowed
- Patient: only own appointment
- Doctor: only assigned appointment

## `rescheduleAppointment`

Allowed:

- Patient owner
- Receptionist
- Admin

Only `scheduled` appointments can be rescheduled.

The new time goes through the same:

- Availability validation
- Conflict validation

Then notifications are replaced.

## `cancelAppointment`

Requires a reason.

Allowed:

- Patient owner
- Assigned doctor
- Receptionist
- Admin

It updates status instead of deleting the row.

Closed appointments cannot be cancelled again.

## `updateStatus`

Accepted values:

- `checked_in`
- `completed`
- `no_show`

Role rules:

- Receptionist: `checked_in` or `no_show`
- Assigned doctor: `completed`
- Admin: any accepted value

---

# 21. Medical Controller

File:

```text
server/src/controllers/medicalController.js
```

## Private `getAppointment`

This helper is not an API controller. It is used by other functions to load the
appointment together with patient and doctor ownership information.

## `getClinicalRecord`

Allowed:

- Patient owner
- Assigned doctor
- Nurse
- Admin

It loads vital signs and medical record in parallel.

Patient privacy:

```js
delete medicalRecord.doctor_notes;
```

Doctor notes are removed before sending a patient response.

## `saveVitalSigns`

Allowed by route:

- Nurse
- Admin

It uses:

```js
.upsert(values, { onConflict: 'appointment_id' })
```

The first call inserts. Later calls update the same appointment's vitals.

## `saveMedicalRecord`

Allowed by route:

- Doctor
- Admin

Additional ownership check:

```js
appointment.doctor.user_id === req.user.id
```

After saving the medical record:

```js
status = 'completed'
```

This connects the clinical workflow to appointment status.

## `getPatientHistory`

Patient:

- Can only view own history
- Does not receive doctor notes

Doctor:

- Must have at least one appointment with the patient

Admin:

- Can view history

The doctor-access count query avoids sending all appointments when only the
existence of a relationship is needed.

---

# 22. Notification Controller

File:

```text
server/src/controllers/notificationController.js
```

## Listing

Filters:

```js
.eq('user_id', req.user.id)
.lte('show_at', new Date().toISOString())
```

This guarantees:

- A user sees only their notifications
- Future reminders stay hidden until due

## Marking as Read

The update includes both:

```js
.eq('id', req.params.id)
.eq('user_id', req.user.id)
```

The second filter prevents one user from marking another user's notification.

---

# 23. Report Controller

File:

```text
server/src/controllers/reportController.js
```

Only managers and admins can access report routes.

## Date Range

If no range is supplied, both dates default to today.

This check works because ISO dates sort in chronological order:

```js
from > to
```

For `YYYY-MM-DD`, string order matches date order.

## Summary Report

The controller starts counters:

```js
const byStatus = {
  scheduled: 0,
  checked_in: 0,
  completed: 0,
  cancelled: 0,
  no_show: 0,
};
```

Then increments:

```js
byStatus[appointment.status] += 1;
```

This is dynamic property access. If status is `completed`, it means:

```js
byStatus.completed += 1;
```

Attendance calculation:

```text
attended = checked_in + completed
finished = attended + no_show
attendance rate = attended / finished x 100
```

Scheduled and cancelled appointments are not counted as finished attendance
outcomes.

## Doctor Utilization

For each doctor:

1. Filter that doctor's appointments
2. Count completed appointments
3. Add duration of non-cancelled appointments
4. Calculate completion percentage

The current report uses:

```text
completed appointments / all appointments x 100
```

It also returns booked minutes.

Be precise during defence: this is an operational completion indicator, not a
full hospital workforce-capacity model.

---

# 24. Admin Controller and First-Admin Script

## Why a Bootstrap Script Is Needed

Admin routes require an admin token.

But at the beginning, there is no admin to create the first admin.

`createAdmin.js` solves this bootstrap problem.

It reads:

```env
ADMIN_FIRST_NAME
ADMIN_LAST_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

Then:

1. Validates email/password
2. Checks if account exists
3. Hashes password
4. Inserts role `admin`

Run:

```bash
npm run create-admin
```

## `createStaff`

Allowed roles:

- Receptionist
- Doctor
- Nurse
- Manager
- Admin

Patient accounts use patient registration instead.

If creating a doctor:

1. Insert `users` row
2. Insert `doctors` row
3. If doctor insert fails, remove incomplete user

## `listUsers`

Returns safe account fields, not password hashes.

Can filter by role.

## `updateUserStatus`

Accepts a real boolean:

```json
{
  "is_active": false
}
```

An admin cannot deactivate their own account through this route.

## `resetPassword`

The admin supplies a new password.

The code:

- Validates it
- Hashes it
- Updates the user
- Clears login lock information
- Audits the reset

## `listAuditLogs`

Returns audit rows joined with basic user information.

---

# 25. Route Files and Route Protection

## `req.body`

Data from JSON request body:

```js
req.body.email
```

## `req.params`

Values inside the route path:

Route:

```text
/patients/:id
```

Request:

```text
/patients/123
```

Then:

```js
req.params.id === '123'
```

## `req.query`

Values after `?`:

```text
/appointments?status=scheduled&page=2
```

Then:

```js
req.query.status === 'scheduled'
req.query.page === '2'
```

Query values are strings.

## `req.user`

This does not come directly from the frontend.

`authMiddleware` creates it after verifying the JWT and loading the database
user.

## Route Protection Order

Example:

```js
router.put(
  '/appointments/:appointmentId/record',
  allowRoles('doctor', 'admin'),
  controller.saveMedicalRecord
);
```

Because the router already used:

```js
router.use(authMiddleware);
```

The effective order is:

```text
authMiddleware
allowRoles
saveMedicalRecord
```

## Route Summary

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

### Patients

```text
GET   /api/patients
POST  /api/patients
GET   /api/patients/:id
PATCH /api/patients/:id
```

### Doctors

```text
GET /api/doctors
GET /api/doctors/:id
GET /api/doctors/:id/slots
PUT /api/doctors/:id/availability
```

### Appointments

```text
GET   /api/appointments
POST  /api/appointments
GET   /api/appointments/:id
PATCH /api/appointments/:id/reschedule
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/status
```

### Medical

```text
GET /api/medical/appointments/:appointmentId
PUT /api/medical/appointments/:appointmentId/vitals
PUT /api/medical/appointments/:appointmentId/record
GET /api/medical/patients/:patientId/history
```

### Notifications

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

### Reports

```text
GET /api/reports/summary
GET /api/reports/doctor-utilization
```

### Admin

```text
GET   /api/admin/users
POST  /api/admin/users
PATCH /api/admin/users/:id/status
PATCH /api/admin/users/:id/reset-password
GET   /api/admin/audit-logs
```

---

# 26. HTTP Status Codes Used by the Project

## `200 OK`

Normal successful request.

Examples:

- Login
- List doctors
- Update appointment

## `201 Created`

A new resource was created.

Examples:

- Patient registration
- Staff account creation
- Appointment booking

## `400 Bad Request`

The request data is missing or invalid.

Examples:

- Invalid email
- Missing diagnosis
- Bad time format

## `401 Unauthorized`

Authentication failed.

Examples:

- Missing token
- Expired token
- Wrong login password

The HTTP name says "Unauthorized," but it normally represents failed
authentication.

## `403 Forbidden`

The user is authenticated but not allowed.

Examples:

- Patient tries to view another patient's profile
- Nurse tries to create staff
- Doctor tries to edit another doctor's record

## `404 Not Found`

The requested resource does not exist.

## `409 Conflict`

The request conflicts with current system state.

Examples:

- Duplicate email
- Double booking
- Trying to reschedule a closed appointment

## `423 Locked`

The account is temporarily locked after repeated login failures.

## `429 Too Many Requests`

Rate limiter rejected excessive requests.

## `500 Internal Server Error`

An unexpected server or database error occurred.

The API returns a general message instead of exposing database internals.

---

# 27. Tests and How to Explain Them

Run:

```bash
npm test
```

The project uses Node's built-in test runner:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
```

## Test Structure

```js
test('description', () => {
  assert.equal(actual, expected);
});
```

## Helper Tests

They test:

- Time conversion
- Monday day number
- Date format
- Password rules

## Appointment Tests

They test:

- Boundary-touching appointments do not overlap
- Actual overlap is detected
- Appointment fits schedule
- Invalid slot boundary is rejected
- Booked slot is removed from available slots

## Why Utilities Are Easy to Test

Functions such as `timesOverlap`:

- Receive values
- Return values
- Do not need HTTP
- Do not need the database

This type of function is called a pure function when its output depends only on
its input and it has no side effects.

## What the Current Tests Do Not Cover

The current tests do not run a real Supabase test database.

Therefore they do not fully test:

- Route authentication
- Database insertion
- Foreign keys
- Complete registration
- Complete booking workflow

This is a reasonable limitation to acknowledge.

---

# 28. Frontend Integration

## Login Flow

1. Frontend sends email/password
2. Backend returns JWT and user
3. Frontend stores token
4. Frontend calls `/api/auth/me`
5. Frontend opens dashboard based on `user.role`

## Protected Request

```js
const response = await fetch(`${API_URL}/appointments`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

For JSON body:

```js
const response = await fetch(`${API_URL}/appointments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(appointmentData),
});
```

## Why `JSON.stringify`

JavaScript objects must be converted to JSON text before being sent in the HTTP
body.

## Booking UI Flow

The frontend should:

1. Load doctors
2. Let user select doctor
3. Let user select date
4. Request available slots
5. Display returned slots
6. Submit one returned slot

Do not let the frontend invent arbitrary times when the backend already provides
valid slots.

## Handling Errors

If status is not successful:

```js
const data = await response.json();
throw new Error(data.error || 'Request failed.');
```

## Handling `401`

When a protected request returns `401`:

1. Remove saved token
2. Redirect to login
3. Ask user to authenticate again

---

# 29. Running Locally and Deploying to Render

## Local Setup

1. Create Supabase project
2. Run `database/schema.sql`
3. Open terminal in `server`
4. Install dependencies
5. Create `.env`
6. Create first admin
7. Start server

Commands:

```bash
cd server
npm install
npm run create-admin
npm run dev
```

## Important Environment Values

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
JWT_SECRET=
CLIENT_URL=
CLINIC_UTC_OFFSET=+01:00
```

## Render Blueprint

`render.yaml` tells Render:

- Service type is web
- Runtime is Node
- Backend root is `server`
- Build command is `npm install`
- Start command is `npm start`
- Health path is `/api/health`
- Which environment variables are required

## Deployment Sequence

```text
GitHub repository
  -> Render reads render.yaml
  -> Render enters server/
  -> npm install
  -> npm start
  -> server listens on Render PORT
  -> health check calls /api/health
```

## Supabase vs Render Responsibilities

Render hosts:

- Node.js
- Express API

Supabase hosts:

- PostgreSQL database
- Database API used by the backend

---

# 30. A Complete Demonstration Sequence

Use this order during a live demonstration.

## 1. Show Health Check

```text
GET /api/health
```

Explain that the server is running.

## 2. Login as Admin

Show:

- Password is submitted
- JWT is returned
- JWT is used in the Authorization header

## 3. Create a Doctor

```text
POST /api/admin/users
```

Explain that one user row and one doctor profile row are created.

## 4. Set Doctor Availability

```text
PUT /api/doctors/:id/availability
```

Explain day-of-week and slot duration.

## 5. Register a Patient

Either:

```text
POST /api/auth/register
```

or staff registration:

```text
POST /api/patients
```

## 6. Request Available Slots

```text
GET /api/doctors/:id/slots?date=2026-08-10
```

Explain that booked slots are removed.

## 7. Book Appointment

```text
POST /api/appointments
```

Explain:

- Schedule check
- Doctor conflict check
- Patient conflict check
- Confirmation/reminder creation

## 8. Attempt the Same Booking Again

Show `409 Conflict`.

This is a strong proof that double-booking prevention works.

## 9. Check In Patient

Receptionist:

```text
PATCH /api/appointments/:id/status
```

```json
{
  "status": "checked_in"
}
```

## 10. Record Vital Signs

Nurse:

```text
PUT /api/medical/appointments/:id/vitals
```

## 11. Save Medical Record

Doctor:

```text
PUT /api/medical/appointments/:id/record
```

Explain that appointment status becomes completed.

## 12. Show Patient History

```text
GET /api/medical/patients/:patientId/history
```

## 13. Show Reports

Manager:

```text
GET /api/reports/summary
GET /api/reports/doctor-utilization
```

## 14. Show Audit Logs

Admin:

```text
GET /api/admin/audit-logs
```

---

# 31. Likely Defence Questions and Strong Answers

## Why did you choose Node.js and Express?

> Node.js lets us use JavaScript on the server, while Express provides a simple
> way to organize HTTP routes and middleware. It is suitable for an API with
> many database-driven requests and was easier for the team to learn and
> explain.

## Why Supabase?

> Supabase provides a hosted PostgreSQL database and a JavaScript client. We
> still keep our business logic in Express, while Supabase reduces the setup and
> maintenance required for the database server.

## Is Supabase the backend?

> Supabase is the database platform in this architecture. Express is still the
> application backend because it handles authentication, authorization,
> validation, scheduling rules, reports, and the API contract.

## What architecture is used?

> A three-tier client-server architecture: frontend presentation layer, Express
> business-logic layer, and Supabase PostgreSQL data layer.

## Why separate routes and controllers?

> Routes describe the URL, HTTP method, and middleware. Controllers implement
> the business process. Separating them keeps route definitions readable and
> makes controller logic easier to maintain.

## What is middleware?

> Middleware runs before the controller. Our authentication middleware verifies
> the JWT and loads the user, while role middleware checks whether the role is
> allowed.

## Difference between authentication and authorization?

> Authentication identifies the user. Authorization decides what that user may
> do.

## How are passwords protected?

> Passwords are hashed with bcrypt before insertion. Login uses bcrypt compare,
> so the original password is never stored.

## Why not encrypt passwords?

> Encryption is reversible with a key. Password hashing is one-way and is the
> correct approach for password verification.

## What is a JWT?

> A signed token that carries the user's ID and role and has an expiry. The
> client sends it in the Authorization header, and the server verifies it before
> protected operations.

## Can a user change the role inside the JWT?

> Modifying the token invalidates its signature, so verification fails. Also,
> the server loads the current user from the database on every protected
> request.

## Why query the user after verifying the JWT?

> To confirm the account still exists and remains active. This lets account
> deactivation take effect before the token expires.

## How is brute-force login reduced?

> There is an IP-based login rate limit and an account lock for 15 minutes after
> five failed password attempts.

## How do you prevent double booking?

> The requested time is converted to minutes. We query active appointments for
> the doctor and patient on that date, then use interval-overlap logic. A
> conflict exists when one start is before the other end and one end is after
> the other start.

## Why check both doctor and patient?

> The doctor cannot attend two patients at once, and a patient should not be
> booked with two doctors at the same time.

## Why do boundary times not conflict?

> An appointment ending at 09:30 does not conflict with another starting at
> 09:30. The algorithm uses strict less-than and greater-than comparisons.

## How do you prevent booking outside working hours?

> The requested date is converted to weekday, the doctor's schedule is loaded,
> and the time must fit inside one schedule period, match the configured
> duration, and begin on a slot boundary.

## Why store appointment date and time separately?

> It matches the project's logical schema and makes clinic scheduling and daily
> filtering easy to explain. The controller combines them when it needs a full
> JavaScript Date for future-time and reminder calculations.

## Why are cancelled appointments not deleted?

> They are retained for audit history, reporting, and accountability.

## Why use `PATCH` for cancellation?

> Cancellation changes part of an existing appointment, mainly its status and
> reason. It does not replace the entire appointment.

## Why use `PUT` for vital signs and medical record?

> The route represents the single current clinical resource belonging to an
> appointment. Repeating the request replaces or updates that resource through
> upsert.

## What is upsert?

> Insert if the row does not exist; update it if a row with the conflict key
> already exists.

## Why can a nurse not write a diagnosis?

> Role-based access follows the business rules. Nurses record observations and
> vital signs; doctors own diagnosis, treatment, prescription, and consultation
> notes.

## How do you ensure one doctor edits only their appointment?

> The route requires the doctor role, then the controller compares the logged-in
> user's ID with the assigned doctor's `user_id`.

## How is patient privacy protected?

> JWT authentication, role checks, record ownership checks, hidden doctor notes,
> secret database credentials on the backend, HTTPS in production, and audit
> logging.

## Why remove doctor notes from patient responses?

> The implementation distinguishes patient-visible treatment history from
> internal clinical notes.

## What are foreign keys?

> Columns that reference primary keys in another table. They preserve
> relationships and prevent appointments from pointing to patients or doctors
> that do not exist.

## What is normalization?

> Organizing data into related tables to reduce duplication and update
> anomalies. Users, patients, doctors, appointments, and medical records each
> store data about one main subject.

## What is a primary key?

> A unique identifier for each table row.

## Why UUID?

> UUIDs are unique across systems and are harder to guess sequentially than
> simple numeric IDs.

## What is an index?

> A database structure that speeds up searches on frequently filtered columns,
> such as appointment date, doctor ID, and patient ID.

## What is RLS?

> Row Level Security is a PostgreSQL/Supabase control for table access. It is
> enabled so the browser cannot directly use the tables; the Express backend
> uses the private server key.

## What is CORS?

> A browser security mechanism. The API allowlist decides which frontend origins
> may make browser requests.

## What does Helmet do?

> It adds standard security-related HTTP response headers.

## Why rate limiting?

> It limits automated abuse, brute-force attempts, and accidental request
> flooding.

## Why limit JSON body size?

> It prevents a client from forcing the server to parse an unnecessarily large
> request body and using excessive memory.

## How do reminders work?

> Booking creates a notification row with a future `show_at` value. The
> notification endpoint only returns rows whose `show_at` time has arrived.

## Are reminders sent by email or SMS?

> In this version they are in-app reminders. Email and SMS are valid future
> enhancements.

## How is attendance rate calculated?

> Checked-in and completed appointments count as attended. No-show counts as a
> finished non-attendance outcome. The rate is attended divided by attended plus
> no-show.

## How is doctor utilization calculated?

> The report returns appointment count, completed count, non-cancelled booked
> minutes, and completion percentage. It is a simple operational measure for
> this academic version.

## What is an audit log?

> A chronological record of important user actions for accountability and
> investigation.

## What tests did you write?

> Unit tests for password/date helpers and scheduling logic, including time
> conversion, overlap detection, schedule fit, and removal of booked slots.

## Why not test every controller?

> Full controller integration testing requires an isolated test database and
> setup/cleanup strategy. The current project focuses automated tests on the
> most error-prone pure scheduling logic. Database integration tests are a next
> step.

## Why Render?

> Render can deploy the Node service directly from the repository and provide
> environment variables, a public HTTPS URL, and health checks.

## Why is the database not on Render?

> Supabase already provides managed PostgreSQL. Render hosts the Express
> application while Supabase hosts the data layer.

---

# 32. Current Limitations and Honest Answers

Do not claim the project is perfect. A strong defence identifies limitations and
explains the improvement.

## 32.1 Appointment Race Condition

Current approach:

1. Query for conflicts
2. Insert if none

Two requests arriving at exactly the same moment could both check before either
insert finishes.

Strong answer:

> The application-level check is correct for normal project use. For a
> production clinic, I would also enforce overlapping-slot protection in
> PostgreSQL with a transaction or exclusion constraint so concurrency cannot
> create a race condition.

## 32.2 Registration Is Not One Database Transaction

Creating a patient account inserts into `users`, then `patients`.

The code removes the user if the patient insert fails.

Strong answer:

> The cleanup prevents the common incomplete-account case. A stronger
> production implementation would put both inserts in one PostgreSQL
> transaction or stored procedure so they commit or roll back together.

## 32.3 Availability Replacement Is Delete Then Insert

The old periods are deleted before new periods are inserted.

Strong answer:

> The flow is simple for the academic project. In production I would use a
> transaction so invalid new periods cannot leave the doctor without the old
> schedule.

## 32.4 JWT Logout Does Not Revoke the Token Server-Side

The frontend removes the token.

Strong answer:

> JWT is stateless in this version. For stronger session control I would add
> token versioning, a revocation list, or short-lived access tokens with refresh
> tokens.

## 32.5 Password Reset Is Admin-Driven

Users can change a known password. Admin can reset a password.

There is no email "forgot password" flow.

Strong answer:

> The current reset requirement is handled by an administrator. A future
> version would create an expiring one-time reset token and send a secure link
> to the user's verified email.

## 32.6 Notifications Are In-App Only

Strong answer:

> The notification data model and scheduling behavior are implemented. Email
> and SMS delivery would be added through a background worker or scheduled job.

## 32.7 Test Coverage Is Focused

Strong answer:

> Unit tests cover scheduling calculations. Future work should add API
> integration tests against a separate Supabase test project and security tests
> for every role.

## 32.8 No App-Level Automated Backup Script

Strong answer:

> The database is hosted on Supabase, so backup policy should be configured at
> the database-platform level. A production plan should also include backup
> verification and restoration drills.

## 32.9 Not Automatically Healthcare-Compliant

Strong answer:

> Authentication and authorization are necessary controls, but they do not
> automatically make a system compliant with healthcare laws. A real
> deployment needs legal review, formal policies, encryption review, staff
> training, retention rules, monitoring, and incident procedures.

## 32.10 Date Validation Is Basic in JavaScript

The helper checks the `YYYY-MM-DD` shape. PostgreSQL validates the actual date
type, and the patient table rejects future birth dates.

Strong answer:

> For better client feedback, I would add stricter application-level calendar
> validation before the database query.

## 32.11 Doctor Utilization Is Simplified

Strong answer:

> It currently reports appointment activity, booked minutes, and completion
> percentage. A more advanced utilization formula would divide used minutes by
> total available schedule minutes for the selected period.

---

# 33. Debugging Guide

## Server Says Environment Variable Is Missing

Check:

```text
server/.env
```

Required:

```env
SUPABASE_URL=
SUPABASE_SECRET_KEY=
JWT_SECRET=
```

Run commands from the `server` directory.

## CORS Error

Add the exact frontend origin:

```env
CLIENT_URL=http://localhost:5500
```

Origin includes:

- Protocol
- Host
- Port

These are different:

```text
http://localhost:5500
http://127.0.0.1:5500
```

## `401 Authentication token is required`

Check the frontend header:

```http
Authorization: Bearer TOKEN
```

There must be one space after `Bearer`.

## `401 Invalid or expired token`

Possible causes:

- Token expired
- Wrong JWT secret
- Token was changed
- Token copied incorrectly

Login again.

## `403`

The user is logged in but lacks role or record permission.

Check:

- `req.user.role`
- Route `allowRoles`
- Ownership condition

## Appointment Is Rejected Outside Available Slots

Check:

- Correct weekday
- Doctor availability exists
- Doctor status is `available`
- Duration matches slot duration
- Time starts on slot boundary
- Appointment is in the future

## Appointment Returns `409`

Check doctor and patient appointments on the same date.

The backend intentionally blocks overlaps.

## Supabase Query Returns Error

Check:

- SQL schema was executed
- Table name
- Column name
- Foreign-key ID exists
- RLS/server secret key
- Input satisfies SQL check constraints

## Admin Script Says Account Exists

`ADMIN_EMAIL` already has a user row.

Either use that account or use a different email.

## Render Health Check Fails

Check:

- Environment variables
- Build logs
- Start logs
- `npm start`
- Server listens on `process.env.PORT`
- Host is `0.0.0.0`

---

# 34. Final Revision Checklist

You should be able to explain all of these without reading code:

- [ ] The problem CareConnect solves
- [ ] The six roles
- [ ] Three-tier architecture
- [ ] Difference between frontend, backend, API, and database
- [ ] Difference between authentication and authorization
- [ ] How bcrypt protects passwords
- [ ] How JWT login works
- [ ] How the Authorization header works
- [ ] What middleware does
- [ ] Why routes and controllers are separate
- [ ] What `req.body`, `req.params`, `req.query`, and `req.user` mean
- [ ] How Supabase queries are structured
- [ ] Primary keys and foreign keys
- [ ] Main database relationships
- [ ] Why users and patients are separate tables
- [ ] Why cancelled appointments are retained
- [ ] How doctor availability is stored
- [ ] How time is converted to minutes
- [ ] The interval-overlap formula
- [ ] Why both doctor and patient conflicts are checked
- [ ] How slots are generated
- [ ] How nurse and doctor permissions differ
- [ ] How patient doctor notes are hidden
- [ ] How in-app reminders use `show_at`
- [ ] How attendance rate is calculated
- [ ] How doctor-utilization output is calculated
- [ ] What audit logs are for
- [ ] What the unit tests cover
- [ ] How the first admin is created
- [ ] How Render and Supabase divide responsibilities
- [ ] At least five current limitations and their improvements

## Five-Minute Personal Practice

Without looking at this file, answer:

1. What happens from login request to token response?
2. What happens from appointment form submission to database insert?
3. How does the system stop overlapping appointments?
4. How does the system stop a doctor editing another doctor's record?
5. What would you improve before real clinic deployment?

If any answer is unclear, reread the matching section and inspect the mentioned
source file.

---

# 35. Glossary

## API

A defined way for software components to communicate.

## Authentication

Confirming identity.

## Authorization

Checking permission.

## bcrypt

A password-hashing algorithm designed to be slow enough to resist password
guessing.

## Callback

A function passed into another function to be called later.

## Controller

A function that handles the business logic of a request.

## CORS

Browser rules controlling requests between different origins.

## CRUD

Create, Read, Update, Delete.

## Environment Variable

A configuration value supplied outside source code.

## Express

A Node.js web framework.

## Foreign Key

A column referencing another table's primary key.

## Hash

A one-way transformed value used here for password storage.

## HTTP

The protocol used by web clients and servers.

## Index

A database structure that speeds up searching.

## JSON

The text data format used by the API.

## JWT

A signed authentication token.

## Middleware

A function that runs during request processing before the final controller.

## Node.js

A runtime for executing JavaScript outside the browser.

## Normalization

Organizing database data to reduce duplication and anomalies.

## npm

The Node package manager.

## Pagination

Returning a large list in smaller pages.

## PostgreSQL

The relational database used by Supabase.

## Primary Key

A column uniquely identifying a table row.

## Promise

An object representing asynchronous work that will finish later.

## Query Parameter

A value after `?` in a URL.

## Rate Limiting

Restricting the number of requests in a time window.

## REST

A common style for organizing resource-based HTTP APIs.

## RLS

Row Level Security, a PostgreSQL security feature.

## Route

A combination of HTTP method and URL path handled by the server.

## Supabase

A hosted platform providing PostgreSQL and related database services.

## Transaction

A group of database operations that all succeed together or all roll back.

## UUID

A widely unique identifier used as a primary key.

## Validation

Checking that input has the required format and values.

---

# Final Advice for the Defence

Do not try to memorize every line.

Understand these five stories:

1. How a user logs in securely
2. How middleware protects a route
3. How a patient or receptionist books an appointment
4. How scheduling conflicts are detected
5. How the nurse and doctor complete the clinical workflow

When asked about a limitation:

1. State the current behavior honestly
2. Explain why it is acceptable for the academic scope
3. State the production improvement

That is stronger than claiming the system has no limitations.
