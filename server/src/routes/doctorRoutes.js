const express = require('express');
const controller = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.listDoctors);
router.get('/:id/slots', controller.getAvailableSlots);
router.put(
  '/:id/availability',
  allowRoles('doctor', 'admin'),
  controller.setAvailability
);
router.get('/:id', controller.getDoctor);

module.exports = router;
