const express = require('express');
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const validate = require('../middleware/validate');
const { createTeamSchema, updateTeamSchema } = require('../validation/teamSchemas');

const router = express.Router();

router.use(protect);

router.post('/', validate(createTeamSchema), teamController.createTeam);
router.get('/', teamController.getAllTeams);
router.get('/:id', teamController.getTeam);
router.put('/:id', validate(updateTeamSchema), teamController.updateTeam);
router.delete('/:id', teamController.deleteTeam);
router.post('/respond-switch', teamController.respondToSwitch);
router.post('/:id/members', teamController.addMember);

module.exports = router;
