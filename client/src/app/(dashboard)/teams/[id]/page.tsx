'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  MapPin,
  Mail, 
  ShieldCheck, 
  UserPlus, 
  ArrowLeft,
  Settings,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { teamService } from '@/services/team.service';
import { requestService } from '@/services/request.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const teamId = params.id as string;

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamService.getTeam(teamId),
  });

  const applyMutation = useMutation({
    mutationFn: (message?: string) => requestService.applyToTeam(teamId, message),
    onSuccess: () => {
      toast.success('Application sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send application');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => teamService.deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team deleted successfully');
      router.push('/dashboard');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-100 rounded" />
        <div className="h-64 bg-slate-100 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 h-96 bg-slate-100 rounded-xl" />
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!team) return <div className="p-8 text-center">Team not found</div>;

  const leader = team.leaderId as any;
  const isLeader = leader?._id === user?._id;
  const isMember = team.members.some(m => {
    const memberId = typeof m.userId === 'object' ? (m.userId as any)._id : m.userId;
    return memberId === user?._id;
  });
  const canApply = user?.status === 'LOOKING' && !isMember && team.status !== 'COMPLETE';

  return (
    <div className="space-y-6 pb-12">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Teams
      </Button>

      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[6px] bg-[var(--github-card-bg)] border border-[var(--github-border)] shadow-sm">
        <div className="h-32 bg-[var(--github-sidebar-bg)] border-b border-[var(--github-border)]" />
        <div className="px-8 pb-8">
          <div className="relative -mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="h-24 w-24 rounded-[6px] bg-[var(--github-card-bg)] p-1 shadow-lg ring-4 ring-[var(--github-card-bg)]">
                <div className="h-full w-full rounded-[6px] bg-[var(--github-subtle)] flex items-center justify-center text-[var(--github-fg)] font-bold text-3xl border border-[var(--github-border)]">
                  {team.title.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-[var(--github-fg)]">{team.title}</h1>
                  <Badge variant={team.status === 'COMPLETE' ? 'success' : 'warning'}>
                    {team.status === 'COMPLETE' ? 'Complete' : 'Recruiting'}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-y-2 gap-x-4 text-sm text-[var(--github-fg)] opacity-70">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Led by <span className="font-semibold text-[var(--github-fg)]">{leader?.name || 'Unknown'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {team.currentSize} / {team.totalSize} members
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {isLeader ? (
                <>
                  <Link href={`/teams/${teamId}/edit`}>
                    <Button variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Team
                    </Button>
                  </Link>
                  <Button variant="danger" onClick={() => {
                    if (confirm('Are you sure you want to delete this team?')) deleteMutation.mutate();
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : canApply ? (
                <Button size="lg" onClick={() => applyMutation.mutate()} isLoading={applyMutation.isPending}>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Apply to Join
                </Button>
              ) : isMember ? (
                <Badge variant="secondary" className="px-4 py-2 text-sm">Already a member</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* About Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{team.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Current contributors to this project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {team.members.map((member) => {
                  const memberUser = member.userId as any;
                  if (!memberUser) return null;
                  return (
                    <div key={memberUser._id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {memberUser.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{memberUser.name}</h4>
                        <p className="text-xs text-slate-500">{memberUser.tracks?.[0] || member.role}</p>
                      </div>
                      {memberUser._id === leader?._id && (
                        <Badge variant="default" className="ml-auto text-[8px] px-1.5 py-0">LEADER</Badge>
                      )}
                    </div>
                  );
                })}
                {/* Vacant Slots */}
                {Array.from({ length: team.totalSize - team.currentSize }).map((_, i) => (
                  <div key={`vacant-${i}`} className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="h-12 w-12 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-300">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-400 italic text-sm">Vacant Position</h4>
                      <p className="text-[10px] text-slate-400">Apply to fill this spot</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Specialties</CardTitle>
              <CardDescription>Skills we are looking for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {team.requiredTracks.map(rt => (
                  <Badge key={rt.track} variant="secondary" className="px-3 py-1">{rt.track} ({rt.neededCount})</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {team.status === 'INCOMPLETE' && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle size={20} />
                  <CardTitle className="text-lg">Recruiting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-800">
                  This team is still looking for members in: 
                  <span className="font-bold ml-1">
                    {team.requiredTracks.map(rt => rt.track).join(', ')}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{leader?.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>Tanta University, FCIS</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
