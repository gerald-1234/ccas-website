const express = require('express');
const controller = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', controller.listNotifications);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
