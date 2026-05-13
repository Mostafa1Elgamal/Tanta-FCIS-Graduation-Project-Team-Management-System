'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Save, Users, Layout, Loader2, UserPlus, Phone, XCircle } from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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

const AVAILABLE_TRACKS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing'];

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

  const [memberPhone, setMemberPhone] = React.useState('');
  
  const addMemberMutation = useMutation({
    mutationFn: () => teamService.addMember(teamId, { phoneNumber: memberPhone }),
    onSuccess: (data: any) => {
      if (data.conflict) {
        toast.info(data.message);
      } else {
        toast.success('Member added successfully!');
        queryClient.invalidateQueries({ queryKey: ['team', teamId] });
      }
      setMemberPhone('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add member');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => 
      teamService.removeMember(teamId, memberId),

    onSuccess: () => {
      toast.success('Member removed successfully!');
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  });

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPhone) return;
    addMemberMutation.mutate();
  };
  const handleRemove = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(memberId);
    }
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
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-[#8b949e] hover:text-[#c9d1d9]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold text-[#c9d1d9]">Team Settings</h1>
        </div>
      </div>

      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2">General Details</h2>
            <div className="space-y-4">
              <Input
                label="Project Title"
                {...register('title')}
                error={errors.title?.message}
                className="gh-input h-10"
              />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#c9d1d9]">Description</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-border bg-[#0d1117] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                  placeholder="Tell us about your graduation project..."
                  {...register('description')}
                />
                {errors.description && <p className="text-xs text-[#f85149]">{errors.description.message}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2">Requirements</h2>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#c9d1d9]">Maximum Team Size</label>
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
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#c9d1d9]">Needed Specialties</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TRACKS.map(track => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => toggleTrack(track)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${
                        selectedTracks.includes(track)
                          ? 'bg-[#238636] text-white border-[#238636]'
                          : 'bg-[#161b22] text-[#8b949e] border-border hover:border-[#8b949e]'
                      }`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
                {errors.requiredTracks && <p className="text-xs text-[#f85149]">{errors.requiredTracks.message}</p>}
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting || mutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Update Team
            </Button>
          </div>
        </form>

        <section className="space-y-4 pt-8 border-t border-border">
          <h2 className="text-base font-semibold text-[#c9d1d9]">Member Management</h2>
          <div className="space-y-6">
            <form onSubmit={handleAddMember} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter phone number to add member..."
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  className="gh-input h-9"
                />
              </div>
              <Button variant="primary" type="submit" size="sm" isLoading={addMemberMutation.isPending}>
                <UserPlus size={16} className="mr-2" />
                Add
              </Button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Current Contributors</h4>
              <div className="grid gap-2">
                {team?.members.map((member: any) => {
                  const memberId = typeof member.userId === 'string' ? member.userId : member.userId?._id;
                  const leaderId = typeof team.leaderId === 'string' ? team.leaderId : team.leaderId?._id;
                  const isLeader = memberId === leaderId;
                  
                  return (
                    <div key={memberId} className="flex items-center justify-between p-3 rounded-md border border-border bg-[#161b22]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#30363d] text-[#c9d1d9] flex items-center justify-center font-bold text-xs">
                          {typeof member.userId === 'object' ? member.userId.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#c9d1d9]">
                            {typeof member.userId === 'object' ? member.userId.name : 'Team Member'}
                          </p>
                          <p className="text-[10px] text-[#8b949e]">
                            {typeof member.userId === 'object' ? member.userId.phoneNumber : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {isLeader ? (
                        <Badge variant="outline" className="text-[8px] border-[#d29922] text-[#d29922]">LEADER</Badge>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#8b949e] hover:text-[#f85149]" onClick={() => {handleRemove(memberId)}}>
                          <XCircle size={16} />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
