const express = require('express');
const matchingController = require('../controllers/matchingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/teams', matchingController.recommendTeams);
router.get('/users', matchingController.recommendTeammates);

module.exports = router;
