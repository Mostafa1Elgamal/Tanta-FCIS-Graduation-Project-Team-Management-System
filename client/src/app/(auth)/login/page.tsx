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

const loginSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+[1-9]\d{9,14}$/, { message: 'Phone must be in international format (e.g. +20...)' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-[#0d1117]">
      <div className="w-full max-w-[308px] space-y-4">
        <div className="flex flex-col items-center justify-center mb-6">
          <GraduationCap size={48} className="text-[#f0f6fc]" />
          <h2 className="mt-6 text-center text-2xl font-light tracking-tight text-[#f0f6fc]">
            Sign in to TeamUp
          </h2>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-[#f0f6fc] block">Phone number</label>
              <input
                type="tel"
                className="gh-input w-full"
                {...register('phoneNumber')}
              />
              {errors.phoneNumber && <p className="text-[10px] text-[#f85149] mt-1">{errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-sm text-[#f0f6fc] block">Password</label>
                <Link href="#" className="text-xs text-[#58a6ff] hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                className="gh-input w-full"
                {...register('password')}
              />
              {errors.password && <p className="text-[10px] text-[#f85149] mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" className="w-full gh-button-primary" isLoading={isLoading}>
              Sign in
            </Button>
          </form>
        </div>

        <div className="border border-[#30363d] rounded-md p-4 text-center">
          <p className="text-sm text-[#f0f6fc]">
            New to TeamUp?{' '}
            <Link href="/register" className="text-[#58a6ff] hover:underline">
              Create an account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
