const express = require('express');
const controller = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, allowRoles('manager', 'admin'));
router.get('/summary', controller.summary);
router.get('/doctor-utilization', controller.doctorUtilization);

module.exports = router;
