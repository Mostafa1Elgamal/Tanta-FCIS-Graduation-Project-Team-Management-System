const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phoneNumber: z.string()
      .regex(/^\+[1-9]\d{9,14}$/, 'Phone must be in international format (e.g. +20...)'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    department: z.string().min(2, 'Department is required'),
    email: z.string().email().optional().or(z.literal('')),
    tracks: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    bio: z.string().max(500).optional(),
  })
});

const loginSchema = z.object({
  body: z.object({
    phoneNumber: z.string()
      .regex(/^\+[1-9]\d{9,14}$/, 'Phone must be in international format (e.g. +20...)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  })
});

module.exports = {
  registerSchema,
  loginSchema,
};
