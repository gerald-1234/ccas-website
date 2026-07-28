const { test, expect } = require('playwright/test');

const patientUser = {
  id: 'user-patient-1',
  email: 'ada@example.com',
  role: 'patient',
  first_name: 'Ada',
  last_name: 'Okafor',
  phone: '+2348012345678',
};

const patientProfile = {
  id: 'patient-1',
  user_id: patientUser.id,
  first_name: 'Ada',
  last_name: 'Okafor',
  gender: 'Female',
  date_of_birth: '2001-05-14',
  phone: '+2348012345678',
  email: 'ada@example.com',
  residential_address: '12 Clinic Road, Owerri',
  blood_group: 'O+',
  emergency_contact_name: 'Chidi Okafor',
  emergency_contact_phone: '+2348098765432',
  registration_date: '2026-01-12',
};

const doctor = {
  id: 'doctor-1',
  user_id: 'user-doctor-1',
  first_name: 'Emeka',
  last_name: 'Nwosu',
  specialization: 'General Medicine',
  phone: '+2348022222222',
  email: 'emeka@careconnect.test',
  consultation_room: 'Room 4',
  availability_status: 'available',
  doctor_availability: [
    {
      id: 'availability-1',
      doctor_id: 'doctor-1',
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '13:00:00',
      slot_duration_minutes: 30,
    },
  ],
};

const appointments = [
  {
    id: 'appointment-12345678',
    patient_id: patientProfile.id,
    doctor_id: doctor.id,
    appointment_date: '2026-08-03',
    appointment_time: '09:30:00',
    duration_minutes: 30,
    reason_for_visit: 'Recurring headache',
    status: 'scheduled',
    cancellation_reason: null,
    patient: patientProfile,
    doctor,
  },
  {
    id: 'appointment-completed',
    patient_id: patientProfile.id,
    doctor_id: doctor.id,
    appointment_date: '2026-07-21',
    appointment_time: '11:00:00',
    duration_minutes: 30,
    reason_for_visit: 'Routine check-up',
    status: 'completed',
    cancellation_reason: null,
    patient: patientProfile,
    doctor,
  },
];

const notifications = [
  {
    id: 'notification-1',
    notification_type: 'confirmation',
    title: 'Appointment confirmed',
    message: 'Your appointment is booked for 2026-08-03 at 09:30 with Dr. Emeka Nwosu.',
    show_at: '2026-07-28T08:00:00+01:00',
    is_read: false,
  },
];

const adminUser = {
  id: 'user-admin-1',
  email: 'admin@careconnect.test',
  role: 'admin',
  first_name: 'Ngozi',
  last_name: 'Eze',
  phone: '+2348033333333',
};

async function mockApi(page, user = patientUser) {
  await page.route('http://localhost:5000/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '');
    const method = request.method();

    if (path === '/health') {
      return route.fulfill({ json: { status: 'ok', time: '2026-07-28T09:00:00+01:00' } });
    }

    if (path === '/auth/login' && method === 'POST') {
      return route.fulfill({
        json: { message: 'Login successful.', token: 'test-token', user: patientUser },
      });
    }

    if (path === '/auth/register' && method === 'POST') {
      return route.fulfill({
        status: 201,
        json: { message: 'Registration successful.', token: 'test-token', user: patientUser, patient: patientProfile },
      });
    }

    if (path === '/auth/me') {
      return route.fulfill({
        json: { user, profile: user.role === 'patient' ? patientProfile : null },
      });
    }

    if (path === '/auth/logout') {
      return route.fulfill({ json: { message: 'Logged out.' } });
    }

    if (path === '/doctors') {
      return route.fulfill({ json: { doctors: [doctor] } });
    }

    if (path === '/appointments' && method === 'GET') {
      return route.fulfill({
        json: { appointments, pagination: { page: 1, limit: 100, total: appointments.length } },
      });
    }

    if (path === '/appointments' && method === 'POST') {
      return route.fulfill({
        status: 201,
        json: { message: 'Appointment booked.', appointment: appointments[0] },
      });
    }

    if (path === '/doctors/doctor-1/slots') {
      return route.fulfill({
        json: {
          date: url.searchParams.get('date'),
          slots: [
            { appointment_time: '10:00', duration_minutes: 30 },
            { appointment_time: '10:30', duration_minutes: 30 },
          ],
        },
      });
    }

    if (path === '/notifications') {
      return route.fulfill({
        json: { notifications, pagination: { page: 1, limit: 100, total: notifications.length } },
      });
    }

    if (path.endsWith('/read') && method === 'PATCH') {
      return route.fulfill({ json: { message: 'Notification marked as read.' } });
    }

    if (path === '/medical/patients/patient-1/history') {
      return route.fulfill({
        json: {
          medical_records: [{
            id: 'record-1',
            diagnosis: 'Tension headache',
            treatment: 'Rest and hydration',
            prescription: 'Paracetamol 500mg',
            visit_date: '2026-07-21',
            doctor: {
              first_name: 'Emeka',
              last_name: 'Nwosu',
              specialization: 'General Medicine',
            },
          }],
        },
      });
    }

    if (path === '/admin/users') {
      return route.fulfill({
        json: {
          users: [
            adminUser,
            { ...patientUser, is_active: true, created_at: '2026-01-12T09:00:00+01:00' },
            {
              id: doctor.user_id,
              email: doctor.email,
              role: 'doctor',
              first_name: doctor.first_name,
              last_name: doctor.last_name,
              phone: doctor.phone,
              is_active: true,
              created_at: '2026-02-02T09:00:00+01:00',
            },
          ].map((item) => ({
            is_active: true,
            created_at: '2026-01-01T09:00:00+01:00',
            ...item,
          })),
          pagination: { page: 1, limit: 100, total: 3 },
        },
      });
    }

    if (path === '/admin/audit-logs') {
      return route.fulfill({
        json: {
          audit_logs: [{
            id: 'audit-1',
            action: 'LOGIN',
            details: 'admin@careconnect.test logged in',
            created_at: '2026-07-28T08:45:00+01:00',
            user: adminUser,
          }],
          pagination: { page: 1, limit: 100, total: 1 },
        },
      });
    }

    if (path === '/reports/summary') {
      return route.fulfill({
        json: {
          range: { from: '2026-07-01', to: '2026-07-28' },
          total_appointments: 42,
          attendance_rate_percent: 88.5,
          appointments_by_status: {
            scheduled: 8,
            checked_in: 3,
            completed: 24,
            cancelled: 5,
            no_show: 2,
          },
        },
      });
    }

    if (path === '/reports/doctor-utilization') {
      return route.fulfill({
        json: {
          range: { from: '2026-07-01', to: '2026-07-28' },
          doctors: [{
            doctor_id: doctor.id,
            doctor_name: 'Dr. Emeka Nwosu',
            specialization: doctor.specialization,
            total_appointments: 20,
            completed_appointments: 17,
            booked_minutes: 600,
            completion_percent: 85,
          }],
        },
      });
    }

    if (path === '/patients') {
      return route.fulfill({
        json: { patients: [patientProfile], pagination: { page: 1, limit: 100, total: 1 } },
      });
    }

    return route.fulfill({ status: 404, json: { error: `Unmocked route: ${method} ${path}` } });
  });
}

test('authentication page works on desktop and mobile', async ({ browser }) => {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  desktop.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await mockApi(desktop);
  await desktop.goto('/');
  await expect(desktop.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await expect(desktop.getByText('Clinic server is online')).toBeVisible();
  await expect(desktop.locator('.auth-visual')).toBeVisible();
  await desktop.screenshot({ path: '.tmp-browser-check/results/auth-desktop.png', fullPage: true });

  await desktop.getByRole('tab', { name: 'Patient registration' }).click();
  await expect(desktop.getByRole('heading', { name: 'Create your patient account' })).toBeVisible();
  await expect(desktop.locator('#register-form')).toBeVisible();
  expect(errors).toEqual([]);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mockApi(mobile);
  await mobile.goto('/');
  await expect(mobile.locator('.auth-mobile-brand')).toBeVisible();
  await expect(mobile.locator('.auth-brand-panel')).toBeHidden();
  await mobile.screenshot({ path: '.tmp-browser-check/results/auth-mobile.png', fullPage: true });
});

test('patient dashboard navigation and booking flow work', async ({ browser }) => {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await mockApi(page, patientUser);
  await page.addInitScript(({ user }) => {
    sessionStorage.setItem('careconnect_token', 'test-token');
    sessionStorage.setItem('careconnect_user', JSON.stringify(user));
  }, { user: patientUser });

  await page.goto('/dashboard.html#overview');
  await expect(page.getByRole('heading', { name: 'Welcome, Ada' })).toBeVisible();
  await expect(page.locator('[data-nav-page="history"]')).toBeVisible();
  await expect(page.locator('[data-nav-page="admin"]')).toHaveCount(0);
  await page.screenshot({ path: '.tmp-browser-check/results/patient-dashboard.png', fullPage: true });

  await page.locator('[data-nav-page="appointments"]').click();
  await expect(page.getByRole('heading', { name: 'Appointment list' })).toBeVisible();
  await page.locator('[data-book-appointment]').click();
  await page.locator('#modal-form [name="doctor_id"]').selectOption('doctor-1');
  await page.locator('#modal-form [name="appointment_date"]').fill('2026-08-05');
  await expect(page.locator('[data-slot-time="10:00"]')).toBeVisible();
  await page.locator('[data-slot-time="10:00"]').click();
  await page.locator('#modal-form [name="reason_for_visit"]').fill('Follow-up consultation');
  await page.locator('#modal-submit').click();
  await expect(page.getByText('Appointment booked.')).toBeVisible();

  expect(errors).toEqual([]);
});

test('mobile dashboard drawer and admin area work', async ({ browser }) => {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mockApi(mobile, patientUser);
  await mobile.addInitScript(({ user }) => {
    sessionStorage.setItem('careconnect_token', 'test-token');
    sessionStorage.setItem('careconnect_user', JSON.stringify(user));
  }, { user: patientUser });
  await mobile.goto('/dashboard.html#overview');
  await mobile.locator('[data-open-sidebar]').click();
  await expect(mobile.locator('#sidebar')).toHaveClass(/is-open/);
  await mobile.screenshot({ path: '.tmp-browser-check/results/patient-mobile-menu.png', fullPage: true });

  const admin = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await mockApi(admin, adminUser);
  await admin.addInitScript(({ user }) => {
    sessionStorage.setItem('careconnect_token', 'admin-token');
    sessionStorage.setItem('careconnect_user', JSON.stringify(user));
  }, { user: adminUser });
  await admin.goto('/dashboard.html#admin');
  await expect(admin.getByRole('heading', { name: 'System users' })).toBeVisible();
  await expect(admin.locator('[data-nav-page="admin"]')).toBeVisible();
  await expect(admin.locator('[data-create-staff]')).toBeVisible();
  await admin.screenshot({ path: '.tmp-browser-check/results/admin-dashboard.png', fullPage: true });
});
