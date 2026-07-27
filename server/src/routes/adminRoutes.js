const express = require('express');
const controller = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware, allowRoles('admin'));
router.get('/users', controller.listUsers);
router.post('/users', controller.createStaff);
router.patch('/users/:id/status', controller.updateUserStatus);
router.patch('/users/:id/reset-password', controller.resetPassword);
router.get('/audit-logs', controller.listAuditLogs);

module.exports = router;
