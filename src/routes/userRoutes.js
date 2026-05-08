const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.put('/profile', userController.updateProfile);

module.exports = router;
