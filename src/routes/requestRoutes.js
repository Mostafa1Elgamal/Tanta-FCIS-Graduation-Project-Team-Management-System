const express = require('express');
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

const validate = require('../middleware/validate');
const { applyToTeamSchema, inviteUserSchema } = require('../validation/requestSchemas');

const router = express.Router();

router.use(protect);

router.post('/apply', validate(applyToTeamSchema), requestController.applyToTeam);
router.post('/invite', validate(inviteUserSchema), requestController.inviteUser);
router.get('/', requestController.getRequests);
router.put('/:id/accept', requestController.acceptRequest);
router.put('/:id/reject', requestController.rejectRequest);

module.exports = router;
