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
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  totalSize: z.coerce.number().min(2).max(10),
  requiredTracks: z.array(z.object({
    track: z.string(),
    neededCount: z.number().default(1)
  })).min(1, 'At least one required track is needed'),
});

interface TeamFormValues {
  title: string;
  description: string;
  totalSize: number;
  requiredTracks: {
    track: string;
    neededCount: number;
  }[];
}

const AVAILABLE_TRACKS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud'];

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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-slate-500">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Create a New Team</h1>
        <p className="text-slate-500 text-lg">Start your graduation project journey here.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Layout size={20} />
              </div>
              <CardTitle>Basic Information</CardTitle>
            </div>
            <CardDescription>Tell everyone what your project is about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Team Title"
              placeholder="e.g. AI-Powered Smart Agriculture System"
              {...register('title')}
              error={errors.title?.message}
            />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your project goals, technologies, and what you're looking for in teammates..."
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Users size={20} />
              </div>
              <CardTitle>Team Configuration</CardTitle>
            </div>
            <CardDescription>Set the size and required skills for your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Team Size (max members)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="2"
                  max="10"
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  {...register('totalSize')}
                />
                <span className="flex items-center justify-center h-10 w-12 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-100">
                  {watch('totalSize')}
                </span>
              </div>
              <p className="text-xs text-slate-500 italic">Recommended team size is 3-6 members.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Required Tracks</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TRACKS.map(track => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => toggleTrack(track)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      selectedTracks.includes(track)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
              {errors.requiredTracks && <p className="text-xs text-red-500">{errors.requiredTracks.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/50 rounded-b-xl py-4 border-t border-slate-200">
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Plus size={16} />
              <span>You will automatically be added as the team leader.</span>
            </div>
          </CardFooter>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" size="lg" isLoading={isSubmitting} className="px-10">
            Create Team
          </Button>
        </div>
      </form>
    </div>
  );
}
