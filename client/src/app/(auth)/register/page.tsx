'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{9,14}$/, { message: 'Phone must be in international format (e.g. +20...)' }),
  email: z.string().email().optional().or(z.literal('')),
  department: z.string().min(2, { message: 'Please specify your department' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      department: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const getPasswordStrength = () => {
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[a-z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    return score;
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = data;
      // Remove empty email to avoid MongoDB unique index issues
      if (!registerData.email) delete registerData.email;
      
      await registerUser(registerData);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#0d1117]">
      <div className="w-full max-w-[440px] space-y-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <GraduationCap size={48} className="text-[#f0f6fc]" />
          <h2 className="mt-6 text-center text-2xl font-light tracking-tight text-[#f0f6fc]">
            Join TeamUp
          </h2>
          <p className="mt-2 text-center text-sm text-[#8b949e]">
            Create your account to start collaborating
          </p>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-[#f0f6fc] block">Full Name</label>
                <input
                  type="text"
                  className="gh-input w-full"
                  placeholder="John Doe"
                  {...register('name')}
                />
                {errors.name && <p className="text-[10px] text-[#f85149] mt-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-[#f0f6fc] block">Phone Number</label>
                <input
                  type="tel"
                  className="gh-input w-full"
                  placeholder="+20..."
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && <p className="text-[10px] text-[#f85149] mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-[#f0f6fc] block">Department / Major</label>
              <input
                type="text"
                className="gh-input w-full"
                placeholder="e.g. Computer Science"
                {...register('department')}
              />
              {errors.department && <p className="text-[10px] text-[#f85149] mt-1">{errors.department.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-[#f0f6fc] block">Password</label>
                <input
                  type="password"
                  className="gh-input w-full"
                  {...register('password')}
                />
                {errors.password && <p className="text-[10px] text-[#f85149] mt-1">{errors.password.message}</p>}
                
                {/* Strength Indicator */}
                {passwordValue && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step} 
                          className={cn(
                            "flex-1 rounded-full transition-all duration-300",
                            step <= strength 
                              ? strength <= 2 ? "bg-[#da3633]" : strength === 3 ? "bg-[#d29922]" : "bg-[#238636]"
                              : "bg-[#30363d]"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[9px] text-[#8b949e]">
                      {strength <= 1 ? 'Very Weak' : strength === 2 ? 'Weak' : strength === 3 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm text-[#f0f6fc] block">Confirm Password</label>
                <input
                  type="password"
                  className="gh-input w-full"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-[10px] text-[#f85149] mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full gh-button-primary mt-2" isLoading={isLoading}>
              Create account
            </Button>
          </form>
        </div>

        <div className="border border-[#30363d] rounded-md p-4 text-center">
          <p className="text-sm text-[#f0f6fc]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#58a6ff] hover:underline">
              Sign in
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
