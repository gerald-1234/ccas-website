const express = require('express');
const controller = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', allowRoles('receptionist', 'doctor', 'nurse', 'admin'), controller.listPatients);
router.post('/', allowRoles('receptionist', 'admin'), controller.createPatient);
router.get(
  '/:id',
  allowRoles('patient', 'receptionist', 'doctor', 'nurse', 'admin'),
  controller.getPatient
);
router.patch(
  '/:id',
  allowRoles('patient', 'receptionist', 'admin'),
  controller.updatePatient
);

module.exports = router;
