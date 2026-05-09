const { z } = require('zod');

const applyToTeamSchema = z.object({
  body: z.object({
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ID'),
    track: z.string().min(1, 'Track is required'),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  })
});

const inviteUserSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
    teamId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid team ID'),
    track: z.string().min(1, 'Track is required'),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  })
});

module.exports = {
  applyToTeamSchema,
  inviteUserSchema,
};
