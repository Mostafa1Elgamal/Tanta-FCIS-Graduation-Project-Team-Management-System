const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validation/authSchemas');

const router = express.Router();

router.use(protect);

router.get('/', userController.getAllUsers);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.get('/:id', userController.getUser);

module.exports = router;
