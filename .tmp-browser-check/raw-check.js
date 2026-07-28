const { chromium } = require('playwright');

const baseUrl = 'http://localhost:5500';

const patientUser = {
  id: 'user-patient-1',
  email: 'ada@example.com',
  role: 'patient',
  first_name: 'Ada',
  last_name: 'Okafor',
  phone: '+2348012345678',
};

const adminUser = {
  id: 'user-admin-1',
  email: 'admin@careconnect.test',
  role: 'admin',
  first_name: 'Ngozi',
  last_name: 'Eze',
  phone: '+2348033333333',
};

const patient = {
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
  doctor_availability: [{
    id: 'availability-1',
    doctor_id: 'doctor-1',
    day_of_week: 1,
    start_time: '09:00:00',
    end_time: '13:00:00',
    slot_duration_minutes: 30,
  }],
};

const appointments = [{
  id: 'appointment-12345678',
  patient_id: patient.id,
  doctor_id: doctor.id,
  appointment_date: '2026-08-03',
  appointment_time: '09:30:00',
  duration_minutes: 30,
  reason_for_visit: 'Recurring headache',
  status: 'scheduled',
  cancellation_reason: null,
  patient,
  doctor,
}, {
  id: 'appointment-completed',
  patient_id: patient.id,
  doctor_id: doctor.id,
  appointment_date: '2026-07-21',
  appointment_time: '11:00:00',
  duration_minutes: 30,
  reason_for_visit: 'Routine check-up',
  status: 'completed',
  cancellation_reason: null,
  patient,
  doctor,
}];

const notifications = [{
  id: 'notification-1',
  notification_type: 'confirmation',
  title: 'Appointment confirmed',
  message: 'Your appointment is booked for 2026-08-03 at 09:30 with Dr. Emeka Nwosu.',
  show_at: '2026-07-28T08:00:00+01:00',
  is_read: false,
}];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function installMocks(page, currentUser) {
  await page.route('http://localhost:5000/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api', '');
    const method = request.method();
    let response;

    if (path === '/health') {
      response = { status: 'ok', time: '2026-07-28T09:00:00+01:00' };
    } else if (path === '/auth/login' && method === 'POST') {
      response = { message: 'Login successful.', token: 'test-token', user: patientUser };
    } else if (path === '/auth/me') {
      response = {
        user: currentUser,
        profile: currentUser.role === 'patient' ? patient : null,
      };
    } else if (path === '/auth/logout') {
      response = { message: 'Logged out.' };
    } else if (path === '/doctors') {
      response = { doctors: [doctor] };
    } else if (path === '/appointments' && method === 'GET') {
      response = {
        appointments,
        pagination: { page: 1, limit: 100, total: appointments.length },
      };
    } else if (path === '/appointments' && method === 'POST') {
      response = { message: 'Appointment booked.', appointment: appointments[0] };
    } else if (path === '/doctors/doctor-1/slots') {
      response = {
        date: url.searchParams.get('date'),
        slots: [
          { appointment_time: '10:00', duration_minutes: 30 },
          { appointment_time: '10:30', duration_minutes: 30 },
        ],
      };
    } else if (path === '/notifications') {
      response = {
        notifications,
        pagination: { page: 1, limit: 100, total: notifications.length },
      };
    } else if (path === '/patients') {
      response = {
        patients: [patient],
        pagination: { page: 1, limit: 100, total: 1 },
      };
    } else if (path === '/admin/users') {
      response = {
        users: [
          { ...adminUser, is_active: true, created_at: '2026-01-01T09:00:00+01:00' },
          { ...patientUser, is_active: true, created_at: '2026-01-12T09:00:00+01:00' },
        ],
        pagination: { page: 1, limit: 100, total: 2 },
      };
    } else if (path === '/reports/summary') {
      response = {
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
      };
    } else if (path === '/reports/doctor-utilization') {
      response = {
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
      };
    } else {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: `Unmocked route: ${method} ${path}` }),
      });
    }

    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

async function openAuthenticatedPage(browser, user, viewport) {
  const page = await browser.newPage({ viewport });
  await installMocks(page, user);
  await page.addInitScript((savedUser) => {
    sessionStorage.setItem('careconnect_token', 'test-token');
    sessionStorage.setItem('careconnect_user', JSON.stringify(savedUser));
  }, user);
  return page;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const consoleErrors = [];

  try {
    const auth = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    auth.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`auth: ${message.text()}`);
    });
    await installMocks(auth, patientUser);
    await auth.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    assert(await auth.getByRole('heading', { name: 'Sign in to your account' }).isVisible(), 'Desktop login heading is not visible.');
    assert(await auth.getByText('Clinic server is online').isVisible(), 'API status did not become online.');
    assert(await auth.locator('.auth-visual').isVisible(), 'Desktop care visual is not visible.');
    await auth.screenshot({ path: '.tmp-browser-check/results/auth-desktop.png', fullPage: true });
    await auth.getByRole('tab', { name: 'Patient registration' }).click();
    assert(await auth.locator('#register-form').isVisible(), 'Patient registration form did not open.');

    const mobileAuth = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await installMocks(mobileAuth, patientUser);
    await mobileAuth.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    assert(await mobileAuth.locator('.auth-mobile-brand').isVisible(), 'Mobile CareConnect brand is not visible.');
    assert(await mobileAuth.locator('.auth-brand-panel').isHidden(), 'Desktop brand panel is visible on mobile.');
    await mobileAuth.screenshot({ path: '.tmp-browser-check/results/auth-mobile.png', fullPage: true });

    const patientPage = await openAuthenticatedPage(
      browser,
      patientUser,
      { width: 1366, height: 900 }
    );
    patientPage.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`patient: ${message.text()}`);
    });
    await patientPage.goto(`${baseUrl}/dashboard.html#overview`, { waitUntil: 'networkidle' });
    assert(await patientPage.getByRole('heading', { name: 'Welcome, Ada' }).isVisible(), 'Patient overview did not load.');
    assert(await patientPage.locator('[data-nav-page="history"]').isVisible(), 'Patient history navigation is missing.');
    assert(await patientPage.locator('[data-nav-page="admin"]').count() === 0, 'Patient can see administration navigation.');
    await patientPage.screenshot({ path: '.tmp-browser-check/results/patient-dashboard.png', fullPage: true });

    await patientPage.locator('[data-nav-page="appointments"]').click();
    await patientPage.getByRole('heading', { name: 'Appointment list' }).waitFor();
    await patientPage.locator('[data-book-appointment]').click();
    await patientPage.locator('#modal-form [name="doctor_id"]').selectOption('doctor-1');
    await patientPage.locator('#modal-form [name="appointment_date"]').fill('2026-08-05');
    await patientPage.locator('[data-slot-time="10:00"]').waitFor();
    await patientPage.locator('[data-slot-time="10:00"]').click();
    await patientPage.locator('#modal-form [name="reason_for_visit"]').fill('Follow-up consultation');
    await patientPage.locator('#modal-submit').click();
    await patientPage.getByText('Appointment booked.').waitFor();

    const mobileDashboard = await openAuthenticatedPage(
      browser,
      patientUser,
      { width: 390, height: 844 }
    );
    await mobileDashboard.goto(`${baseUrl}/dashboard.html#overview`, { waitUntil: 'networkidle' });
    await mobileDashboard.locator('[data-open-sidebar]').click();
    assert(
      (await mobileDashboard.locator('#sidebar').getAttribute('class')).includes('is-open'),
      'Mobile navigation drawer did not open.'
    );
    await mobileDashboard.screenshot({
      path: '.tmp-browser-check/results/patient-mobile-menu.png',
      fullPage: true,
    });

    const adminPage = await openAuthenticatedPage(
      browser,
      adminUser,
      { width: 1440, height: 900 }
    );
    adminPage.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`admin: ${message.text()}`);
    });
    await adminPage.goto(`${baseUrl}/dashboard.html#admin`, { waitUntil: 'networkidle' });
    assert(await adminPage.getByRole('heading', { name: 'System users' }).isVisible(), 'Administration page did not load.');
    assert(await adminPage.locator('[data-create-staff]').isVisible(), 'Add staff button is missing.');
    await adminPage.screenshot({ path: '.tmp-browser-check/results/admin-dashboard.png', fullPage: true });

    assert(consoleErrors.length === 0, `Browser console errors:\n${consoleErrors.join('\n')}`);
    console.log('PASS auth desktop');
    console.log('PASS auth mobile');
    console.log('PASS patient dashboard and booking');
    console.log('PASS mobile dashboard navigation');
    console.log('PASS admin dashboard');
    console.log('PASS no browser console errors');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
