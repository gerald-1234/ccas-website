const express = require('express');
const controller = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.listAppointments);
router.post(
  '/',
  allowRoles('patient', 'receptionist', 'admin'),
  controller.createAppointment
);
router.patch('/:id/reschedule', controller.rescheduleAppointment);
router.patch('/:id/cancel', controller.cancelAppointment);
router.patch(
  '/:id/status',
  allowRoles('receptionist', 'doctor', 'admin'),
  controller.updateStatus
);
router.get('/:id', controller.getAppointment);

module.exports = router;
