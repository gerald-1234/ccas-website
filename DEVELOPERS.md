# CareConnect Frontend Integration Guide

This document is the contract between the frontend and the Express backend.

## Implemented Frontend

The vanilla JavaScript frontend is available in `client/`.

```text
client/
  index.html
  dashboard.html
  assets/css/styles.css
  assets/js/
  assets/images/
```

The frontend API address is configured in:

```text
client/assets/js/config.js
```

Use a local web server because the JavaScript files use ES modules:

```powershell
cd client
python -m http.server 5500
```

See `client/README.md` for the page structure, role navigation, deployment
steps, and frontend defence notes.

## Base URLs

Local development:

```text
http://localhost:5000
```

API prefix:

```text
/api
```

Production:

```text
https://YOUR-RENDER-SERVICE.onrender.com
```

Keep the base URL in one frontend configuration value. Do not repeat it across
page scripts.

## Request Format

Send JSON for requests with a body:

```http
Content-Type: application/json
```

Every protected route also needs:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Do not put `SUPABASE_SECRET_KEY` in the frontend. The frontend communicates only
with the Express API.

## Suggested API Helper

```js
const API_URL = 'http://localhost:5000/api';

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('careconnect_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }

  return data;
}
```

Save the token after login or registration:

```js
const data = await apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

sessionStorage.setItem('careconnect_token', data.token);
```

Remove the token during logout.

## Roles

| Role | Main frontend area |
|---|---|
| `patient` | Own profile, doctors, appointments, history, notifications |
| `receptionist` | Patients, bookings, check-in, cancellations |
| `doctor` | Own schedule, patient history, consultation records |
| `nurse` | Appointment list and vital signs |
| `manager` | Summary and utilization reports |
| `admin` | Users, all operational modules, audit logs |

Use `GET /api/auth/me` after login to decide which dashboard to show.

## Date and Time Rules

- Dates use `YYYY-MM-DD`.
- Times use 24-hour `HH:MM`.
- `day_of_week` uses `1` for Monday and `7` for Sunday.
- The frontend should request available slots before submitting an appointment.
- `duration_minutes` must match the doctor slot duration.

Example:

```json
{
  "appointment_date": "2026-08-10",
  "appointment_time": "09:30",
  "duration_minutes": 30
}
```

## Common Responses

Success:

```json
{
  "message": "Appointment booked.",
  "appointment": {}
}
```

Validation or permission error:

```json
{
  "error": "The selected time is outside the doctor's available slots."
}
```

Paginated list:

```json
{
  "patients": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

## Status Codes

| Code | Meaning |
|---|---|
| `200` | Request succeeded |
| `201` | New record created |
| `400` | Missing or invalid input |
| `401` | Token missing, invalid, or expired |
| `403` | Logged in but role is not allowed |
| `404` | Record not found |
| `409` | Booking conflict or duplicate account |
| `423` | Account temporarily locked |
| `500` | Unexpected backend/database error |

## Health Routes

| Method | Route | Auth |
|---|---|---|
| `GET` | `/` | No |
| `GET` | `/api/health` | No |

## Authentication Routes

### Register a patient

`POST /api/auth/register`

Auth: No

```json
{
  "first_name": "Ada",
  "last_name": "Okafor",
  "gender": "Female",
  "date_of_birth": "2001-05-14",
  "phone": "+2348012345678",
  "email": "ada@example.com",
  "password": "Password1",
  "residential_address": "12 Clinic Road, Owerri",
  "blood_group": "O+",
  "emergency_contact_name": "Chidi Okafor",
  "emergency_contact_phone": "+2348098765432"
}
```

Returns `token`, `user`, and `patient`.

### Login

`POST /api/auth/login`

Auth: No

```json
{
  "email": "ada@example.com",
  "password": "Password1"
}
```

Returns `token` and `user`.

### Current account

`GET /api/auth/me`

Auth: Any logged-in user

Returns `user` and a `profile` for patients and doctors.

### Change password

`POST /api/auth/change-password`

```json
{
  "current_password": "Password1",
  "new_password": "NewPassword2"
}
```

### Logout

`POST /api/auth/logout`

The frontend must remove its saved JWT.

## Patient Routes

| Method | Route | Roles |
|---|---|---|
| `GET` | `/api/patients?search=&page=1&limit=20` | receptionist, doctor, nurse, admin |
| `POST` | `/api/patients` | receptionist, admin |
| `GET` | `/api/patients/:id` | patient owner, receptionist, doctor, nurse, admin |
| `PATCH` | `/api/patients/:id` | patient owner, receptionist, admin |

`POST /api/patients` uses the same patient fields as registration except
`password` is omitted and `email` is optional. A staff-created patient does not
automatically have a login account.

## Doctor Routes

| Method | Route | Roles |
|---|---|---|
| `GET` | `/api/doctors` | any logged-in user |
| `GET` | `/api/doctors/:id` | any logged-in user |
| `GET` | `/api/doctors/:id/slots?date=2026-08-10` | any logged-in user |
| `PUT` | `/api/doctors/:id/availability` | same doctor, admin |

Availability body:

```json
{
  "periods": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "13:00",
      "slot_duration_minutes": 30
    },
    {
      "day_of_week": 3,
      "start_time": "10:00",
      "end_time": "15:00",
      "slot_duration_minutes": 30
    }
  ]
}
```

Available-slots response:

```json
{
  "date": "2026-08-10",
  "slots": [
    {
      "appointment_time": "09:00",
      "duration_minutes": 30
    }
  ]
}
```

## Appointment Routes

| Method | Route | Roles |
|---|---|---|
| `GET` | `/api/appointments` | role-filtered result |
| `POST` | `/api/appointments` | patient, receptionist, admin |
| `GET` | `/api/appointments/:id` | related patient/doctor, receptionist, nurse, admin |
| `PATCH` | `/api/appointments/:id/reschedule` | patient owner, receptionist, admin |
| `PATCH` | `/api/appointments/:id/cancel` | patient owner, assigned doctor, receptionist, admin |
| `PATCH` | `/api/appointments/:id/status` | receptionist, assigned doctor, admin |

List filters:

```text
?date=2026-08-10
?status=scheduled
?doctor_id=UUID
?patient_id=UUID
?page=1&limit=20
```

Patient booking:

```json
{
  "doctor_id": "DOCTOR_UUID",
  "appointment_date": "2026-08-10",
  "appointment_time": "09:30",
  "duration_minutes": 30,
  "reason_for_visit": "Persistent headache"
}
```

Receptionist/admin booking adds:

```json
{
  "patient_id": "PATIENT_UUID"
}
```

Reschedule:

```json
{
  "appointment_date": "2026-08-12",
  "appointment_time": "10:00",
  "duration_minutes": 30
}
```

Cancel:

```json
{
  "cancellation_reason": "Patient is unavailable"
}
```

Status:

```json
{
  "status": "checked_in"
}
```

Receptionists may set `checked_in` or `no_show`. The assigned doctor may set
`completed`. Admins may set any supported value on this route.

## Medical Routes

| Method | Route | Roles |
|---|---|---|
| `GET` | `/api/medical/appointments/:appointmentId` | related patient/doctor, nurse, admin |
| `PUT` | `/api/medical/appointments/:appointmentId/vitals` | nurse, admin |
| `PUT` | `/api/medical/appointments/:appointmentId/record` | assigned doctor, admin |
| `GET` | `/api/medical/patients/:patientId/history` | patient owner, related doctor, admin |

Vital signs:

```json
{
  "temperature_c": 36.8,
  "systolic_bp": 120,
  "diastolic_bp": 80,
  "pulse_rate": 72,
  "respiratory_rate": 16,
  "oxygen_saturation": 98,
  "weight_kg": 68.5,
  "height_cm": 170,
  "observations": "Patient is stable"
}
```

Medical record:

```json
{
  "diagnosis": "Migraine",
  "treatment": "Rest and hydration",
  "prescription": "Paracetamol 500mg",
  "doctor_notes": "Review after one week"
}
```

Patient responses do not include `doctor_notes`.

## Notification Routes

| Method | Route | Roles |
|---|---|---|
| `GET` | `/api/notifications?page=1&limit=20` | any logged-in user |
| `PATCH` | `/api/notifications/:id/read` | notification owner |

Notifications are in-app messages. Confirmation messages are available
immediately. Reminder messages appear only when their configured `show_at` time
has been reached.

## Report Routes

Roles: `manager`, `admin`

| Method | Route |
|---|---|
| `GET` | `/api/reports/summary?from=2026-08-01&to=2026-08-31` |
| `GET` | `/api/reports/doctor-utilization?from=2026-08-01&to=2026-08-31` |

The summary returns totals, status counts, and attendance rate. Doctor
utilization returns appointment count, completed count, booked minutes, and
completion percentage per doctor.

## Admin Routes

All routes require the `admin` role.

| Method | Route |
|---|---|
| `GET` | `/api/admin/users?page=1&limit=20&role=doctor` |
| `POST` | `/api/admin/users` |
| `PATCH` | `/api/admin/users/:id/status` |
| `PATCH` | `/api/admin/users/:id/reset-password` |
| `GET` | `/api/admin/audit-logs?page=1&limit=20` |

Create staff:

```json
{
  "first_name": "Ifeanyi",
  "last_name": "Nwosu",
  "email": "ifeanyi@careconnect.test",
  "password": "Password1",
  "role": "doctor",
  "phone": "+2348011111111",
  "specialization": "General Medicine",
  "consultation_room": "Room 4"
}
```

`specialization` is required only when `role` is `doctor`.

Activate or deactivate:

```json
{
  "is_active": false
}
```

Reset password:

```json
{
  "new_password": "Temporary2"
}
```

## Recommended Frontend Flow

1. Login and save the JWT.
2. Call `/auth/me` and open the correct role dashboard.
3. Load doctors.
4. Load slots for the selected doctor and date.
5. Submit only one of the returned slot values when booking.
6. Refresh appointment lists after booking, rescheduling, cancellation, or status changes.
7. Poll notifications when the dashboard opens or after important actions.
8. Remove the JWT and return to login when a request returns `401`.

## CORS

Every frontend origin must be listed in the backend `CLIENT_URL` environment
variable. Multiple origins are separated with commas:

```env
CLIENT_URL=http://localhost:5500,https://careconnect.example.com
```
