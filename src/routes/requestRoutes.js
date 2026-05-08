const express = require('express');
const requestController = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/apply', requestController.applyToTeam);
router.post('/invite', requestController.inviteUser);
router.get('/', requestController.getRequests);
router.put('/:id/accept', requestController.acceptRequest);
router.put('/:id/reject', requestController.rejectRequest);

module.exports = router;
