'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users, Layout, Loader2 } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

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

export default function EditTeamPage() {
  const { id } = useParams();
  const teamId = id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamService.getTeam(teamId),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    if (team) {
      reset({
        title: team.title,
        description: team.description,
        totalSize: team.totalSize,
        requiredTracks: team.requiredTracks,
      });
    }
  }, [team, reset]);

  const selectedTracks = watch('requiredTracks')?.map(rt => rt.track) || [];

  const toggleTrack = (track: string) => {
    const current = watch('requiredTracks') || [];
    if (selectedTracks.includes(track)) {
      setValue('requiredTracks', current.filter(t => t.track !== track));
    } else {
      setValue('requiredTracks', [...current, { track, neededCount: 1 }]);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: TeamFormValues) => teamService.updateTeam(teamId, data),
    onSuccess: () => {
      toast.success('Team updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      router.push(`/teams/${teamId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update team');
    },
  });

  const onSubmit = (data: TeamFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-slate-500">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Team
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Manage Team</h1>
        <p className="text-slate-500 text-lg">Update your project details and requirements.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="text-indigo-600" size={20} />
              <CardTitle>Team Details</CardTitle>
            </div>
            <CardDescription>Update your project title and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Team Title"
              {...register('title')}
              error={errors.title?.message}
            />
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              <CardTitle>Requirements</CardTitle>
            </div>
            <CardDescription>Adjust team size and needed tracks</CardDescription>
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
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-700">Required Tracks</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TRACKS.map(track => (
                  <button
                    key={track}
                    type="button"
                    onClick={() => toggleTrack(track)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
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
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" size="lg" isLoading={isSubmitting || mutation.isPending} className="px-10">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
