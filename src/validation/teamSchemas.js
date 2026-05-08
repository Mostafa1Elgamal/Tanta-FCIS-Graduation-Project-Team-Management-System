const { z } = require('zod');

const createTeamSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(30, 'Title cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9 _]+$/, 'Title can only contain letters, numbers, spaces, and underscores'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    totalSize: z.number().min(2).max(10),
    requiredTracks: z.array(z.object({
      track: z.string(),
      neededCount: z.number().optional().default(1)
    })).min(1, 'At least one required track is needed'),
    leaderRole: z.string().optional(),
    isPrivate: z.boolean().optional(),
  })
});

const updateTeamSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(30, 'Title cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9 _]+$/, 'Title can only contain letters, numbers, spaces, and underscores')
      .optional(),
    description: z.string().min(10, 'Description must be at least 10 characters').optional(),
    totalSize: z.number().min(2).max(10).optional(),
    requiredTracks: z.array(z.object({
      track: z.string(),
      neededCount: z.number().optional()
    })).optional(),
    status: z.enum(['INCOMPLETE', 'COMPLETE']).optional(),
    isPrivate: z.boolean().optional(),
  })
});

module.exports = {
  createTeamSchema,
  updateTeamSchema,
};
