const { chromium } = require('playwright');

const baseUrl = 'http://localhost:5500';
const user = {
  id: 'user-patient-1',
  email: 'ada@example.com',
  role: 'patient',
  first_name: 'Ada',
  last_name: 'Okafor',
  phone: '+2348012345678',
};
const profile = {
  id: 'patient-1',
  user_id: user.id,
  first_name: 'Ada',
  last_name: 'Okafor',
  gender: 'Female',
  date_of_birth: '2001-05-14',
  phone: '+2348012345678',
  email: user.email,
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
  doctor_availability: [],
};
const appointment = {
  id: 'appointment-1',
  patient_id: profile.id,
  doctor_id: doctor.id,
  appointment_date: '2026-08-03',
  appointment_time: '09:30:00',
  duration_minutes: 30,
  reason_for_visit: 'Recurring headache',
  status: 'scheduled',
  patient: profile,
  doctor,
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function mock(page) {
  await page.route('http://localhost:5000/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api', '');
    let body;
    if (path === '/health') body = { status: 'ok' };
    else if (path === '/auth/me') body = { user, profile };
    else if (path === '/doctors') body = { doctors: [doctor] };
    else if (path === '/appointments') {
      body = { appointments: [appointment], pagination: { page: 1, limit: 100, total: 1 } };
    } else if (path === '/notifications') {
      body = { notifications: [], pagination: { page: 1, limit: 100, total: 0 } };
    } else {
      body = { error: `Unmocked ${path}` };
    }
    await route.fulfill({
      status: body.error ? 404 : 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

async function assertLayout(page, label) {
  const result = await page.evaluate(() => {
    const images = [...document.images].map((image) => ({
      src: image.getAttribute('src'),
      complete: image.complete,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
    const clippedButtons = [...document.querySelectorAll('button')]
      .filter((button) => {
        const style = getComputedStyle(button);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        if (button.matches('.icon-button')) return false;
        return button.scrollWidth > button.clientWidth + 1;
      })
      .map((button) => button.textContent.trim().replace(/\s+/g, ' '));
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      images,
      clippedButtons,
    };
  });

  assert(
    result.documentWidth <= result.viewportWidth + 1,
    `${label}: document has horizontal overflow (${result.documentWidth}px > ${result.viewportWidth}px).`
  );
  assert(
    result.bodyWidth <= result.viewportWidth + 1,
    `${label}: body has horizontal overflow (${result.bodyWidth}px > ${result.viewportWidth}px).`
  );
  assert(
    result.images.every((image) => image.complete && image.width > 0 && image.height > 0),
    `${label}: one or more image assets failed to load: ${JSON.stringify(result.images)}`
  );
  assert(
    result.clippedButtons.length === 0,
    `${label}: button text is clipped: ${result.clippedButtons.join(', ')}`
  );
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const authDesktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await mock(authDesktop);
    await authDesktop.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await assertLayout(authDesktop, 'auth desktop');

    const authMobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mock(authMobile);
    await authMobile.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await assertLayout(authMobile, 'auth mobile');

    for (const [label, viewport] of [
      ['dashboard desktop', { width: 1366, height: 900 }],
      ['dashboard mobile', { width: 390, height: 844 }],
    ]) {
      const page = await browser.newPage({ viewport });
      await mock(page);
      await page.addInitScript((savedUser) => {
        sessionStorage.setItem('careconnect_token', 'test-token');
        sessionStorage.setItem('careconnect_user', JSON.stringify(savedUser));
      }, user);
      await page.goto(`${baseUrl}/dashboard.html#overview`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: 'Welcome, Ada' }).waitFor();
      await assertLayout(page, label);

      if (label === 'dashboard desktop') {
        const bounds = await page.evaluate(() => {
          const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
          const topbar = document.querySelector('.topbar').getBoundingClientRect();
          return { sidebarRight: sidebar.right, topbarLeft: topbar.left };
        });
        assert(
          Math.abs(bounds.sidebarRight - bounds.topbarLeft) <= 1,
          'dashboard desktop: sidebar and topbar overlap or leave a gap.'
        );
      }
    }

    console.log('PASS image assets load');
    console.log('PASS no horizontal page overflow');
    console.log('PASS no clipped button text');
    console.log('PASS desktop shell boundaries');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
