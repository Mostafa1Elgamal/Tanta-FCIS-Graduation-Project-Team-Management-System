'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Users, Layout } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';

const teamSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(30, 'Title cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9 _]+$/, 'Title can only contain letters, numbers, spaces, and underscores'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalSize: z.number().min(2).max(10),
  requiredTracks: z.array(z.object({
    track: z.string(),
    neededCount: z.number()
  })).min(1, 'At least one required track is needed'),
});

type TeamFormValues = z.infer<typeof teamSchema>;

const AVAILABLE_TRACKS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Analysis', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing'];

export default function CreateTeamPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      title: '',
      description: '',
      totalSize: 5,
      requiredTracks: [{ track: 'Frontend', neededCount: 1 }],
    },
  });

  const selectedTracks = watch('requiredTracks').map(rt => rt.track);

  const toggleTrack = (track: string) => {
    const current = watch('requiredTracks');
    if (selectedTracks.includes(track)) {
      setValue('requiredTracks', current.filter(t => t.track !== track));
    } else {
      setValue('requiredTracks', [...current, { track, neededCount: 1 }]);
    }
  };

  const onSubmit = async (data: TeamFormValues) => {
    try {
      const team = await teamService.createTeam(data);
      await checkAuth(); // Refresh user state to include the new team
      toast.success('Team created successfully!');
      router.push(`/teams/${team._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold text-[#c9d1d9]">Create a new team</h1>
        <p className="text-sm text-[#8b949e]">A team contains all project members and track requirements.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#c9d1d9]">Team name</label>
            <input
              placeholder="e.g. smart-agriculture-system"
              className="gh-input w-full h-9"
              {...register('title')}
            />
            <p className="text-[11px] text-[#8b949e]">Great team names are short and memorable.</p>
            {errors.title && <p className="text-[10px] text-[#f85149] mt-1">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#c9d1d9]">Description <span className="text-[#8b949e] font-normal">(optional)</span></label>
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-border bg-[#0d1117] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              placeholder="Briefly describe your graduation project goals..."
              {...register('description')}
            />
            {errors.description && <p className="text-[10px] text-[#f85149] mt-1">{errors.description.message}</p>}
          </div>
        </section>

        <section className="space-y-6 pt-6 border-t border-border">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#c9d1d9]">Maximum team size</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="10"
                className="flex-1 h-1.5 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-[#238636]"
                {...register('totalSize', { valueAsNumber: true })}
              />
              <span className="flex items-center justify-center h-8 w-10 rounded-md bg-[#161b22] text-[#c9d1d9] font-bold text-sm border border-border">
                {watch('totalSize')}
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e]">Most graduation project teams consist of 4-6 members.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#c9d1d9]">Required technical tracks</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TRACKS.map(track => (
                <button
                  key={track}
                  type="button"
                  onClick={() => toggleTrack(track)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    selectedTracks.includes(track)
                      ? 'bg-[#238636] text-white border-[#238636]'
                      : 'bg-[#161b22] text-[#8b949e] border-border hover:border-[#8b949e]'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
            {errors.requiredTracks && <p className="text-[10px] text-[#f85149] mt-1">{errors.requiredTracks.message}</p>}
          </div>
        </section>

        <div className="pt-6 border-t border-border flex flex-col gap-4">
           <div className="flex items-center gap-2 text-xs text-[#8b949e]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#238636]" />
              <span>You will be initialized as the team leader.</span>
           </div>
           <div className="flex justify-end gap-3">
             <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
             <Button variant="primary" type="submit" isLoading={isSubmitting}>
               Create team
             </Button>
           </div>
        </div>
      </form>
    </div>
  );
}
