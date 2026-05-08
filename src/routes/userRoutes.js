const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', userController.getAllUsers);
router.put('/profile', userController.updateProfile);
router.get('/:id', userController.getUser);

module.exports = router;
