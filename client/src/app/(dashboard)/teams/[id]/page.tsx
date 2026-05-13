'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  MapPin,
  ArrowLeft,
  Settings,
  Trash2,
  AlertTriangle,
  Phone,
  ShieldCheck,
  UserPlus,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { teamService } from '@/services/team.service';
import { requestService } from '@/services/request.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

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

  const deleteMutation = useMutation({
    mutationFn: () => teamService.deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team deleted successfully');
      router.push('/dashboard');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => teamService.removeMember(teamId, memberId),
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['team', teamId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  });

  const handleRemoveMember = (memberId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(memberId);
    }
  };

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
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-[#8b949e] hover:text-[#c9d1d9]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {isLeader && (
            <Link href={`/teams/${teamId}/edit`}>
              <Button variant="secondary" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
          )}
          {isMember && !isLeader && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-500" 
              onClick={() => handleRemoveMember(user!._id)} 
              disabled={removeMemberMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave Team
            </Button>
          )}
        </div>
      </div>

      {/* Repository Header Style */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xl font-semibold text-[#58a6ff]">
            <Users size={24} className="text-[#8b949e]" />
            <Link href={`/users/${leader?._id}`}>
              <span className="hover:underline cursor-pointer">{leader?.name || 'User'}</span>
            </Link>
            <span className="text-[#8b949e] font-normal">/</span>
            <span className="text-[#c9d1d9] font-bold">{team.title}</span>
            <Badge variant={team.status === 'COMPLETE' ? 'secondary' : 'outline'} className="ml-2 bg-[#161b22] text-[#8b949e] border-border text-[10px]">
              {team.status === 'COMPLETE' ? 'Full' : 'Public'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#8b949e]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Leader: {leader?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {team.currentSize} / {team.totalSize} contributors
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <a 
            href={`https://wa.me/${(leader?.phoneNumber?.replace(/\D/g, '') || '').startsWith('20') ? leader?.phoneNumber?.replace(/\D/g, '') : '20' + (leader?.phoneNumber?.replace(/\D/g, '') || '').replace(/^0/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm" className="text-[#238636] border-[#238636]/30 hover:border-[#238636]">
              <Phone className="mr-2 h-4 w-4" />
              Contact Leader
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-base font-semibold text-[#c9d1d9] mb-3 border-b border-border pb-2">Description</h2>
            <p className="text-sm text-[#8b949e] leading-relaxed whitespace-pre-wrap">{team.description}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#c9d1d9] mb-3 border-b border-border pb-2">Contributors</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {team.members.map((member) => {
                const memberUser = member.userId as any;
                if (!memberUser) return null;
                return (
                  <div key={memberUser._id} className="flex items-center gap-3 p-3 rounded-md border border-border bg-[#161b22]">
                    <div className="h-8 w-8 rounded-full bg-[#30363d] flex items-center justify-center font-bold text-[#c9d1d9] text-xs">
                      {memberUser.name.charAt(0)}
                    </div>
                    <Link href={`/users/${memberUser._id}`} className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[#c9d1d9] truncate hover:text-[#58a6ff] hover:underline cursor-pointer">{memberUser.name}</h4>
                      <p className="text-[10px] text-[#8b949e] uppercase tracking-wider">{memberUser.tracks?.[0] || member.role}</p>
                    </Link>
                    {memberUser._id === leader?._id && (
                      <Badge variant="outline" className="text-[8px] border-[#d29922] text-[#d29922]">LEADER</Badge>
                    )}
                    {isLeader && memberUser._id !== leader?._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 ml-auto h-8 w-8"
                        onClick={() => handleRemoveMember(memberUser._id)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
              {/* Vacant Slots */}
              {Array.from({ length: team.totalSize - team.currentSize }).map((_, i) => (
                <div key={`vacant-${i}`} className="flex items-center gap-3 p-3 rounded-md border border-dashed border-border bg-transparent opacity-50">
                  <div className="h-8 w-8 rounded-full border border-dashed border-border flex items-center justify-center text-[#484f58]">
                    <Users size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-[#484f58]">Vacant Slot</h4>
                    <p className="text-[9px] text-[#484f58]">Looking for {team.requiredTracks[0]?.track || 'member'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <section>
            <h2 className="text-base font-semibold text-[#c9d1d9] mb-3 border-b border-border pb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {team.requiredTracks.map(rt => (
                <Badge key={rt.track} variant="secondary" className="bg-[#161b22] text-[#c9d1d9] border-border">
                  {rt.track} ({rt.neededCount})
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#c9d1d9] mb-3 border-b border-border pb-2">Status</h2>
            <div className={cn(
              "p-4 rounded-md border text-sm",
              team.status === 'COMPLETE' 
                ? "bg-[rgba(35,134,54,0.1)] border-[#238636] text-[#3fb950]" 
                : "bg-[rgba(210,153,34,0.1)] border-[#d29922] text-[#d29922]"
            )}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                <AlertTriangle size={16} />
                {team.status === 'COMPLETE' ? 'Project Team Full' : 'Recruiting Members'}
              </div>
              <p className="text-xs opacity-80">
                {team.status === 'COMPLETE' 
                  ? 'This team has filled all contributor slots.' 
                  : `Looking for ${team.totalSize - team.currentSize} more members to join.`}
              </p>
            </div>
          </section>

          <section className="pt-4">
             <div className="flex items-center gap-2 text-xs text-[#8b949e]">
               <MapPin className="h-4 w-4" />
               <span>Tanta University, FCIS</span>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
