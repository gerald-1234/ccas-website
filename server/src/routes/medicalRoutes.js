const express = require('express');
const controller = require('../controllers/medicalController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get(
  '/appointments/:appointmentId',
  allowRoles('patient', 'doctor', 'nurse', 'admin'),
  controller.getClinicalRecord
);
router.put(
  '/appointments/:appointmentId/vitals',
  allowRoles('nurse', 'admin'),
  controller.saveVitalSigns
);
router.put(
  '/appointments/:appointmentId/record',
  allowRoles('doctor', 'admin'),
  controller.saveMedicalRecord
);
router.get(
  '/patients/:patientId/history',
  allowRoles('patient', 'doctor', 'admin'),
  controller.getPatientHistory
);

module.exports = router;
