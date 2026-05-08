'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Users,
  Mail,
  ExternalLink,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { Github } from '@/components/icons/Github';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { requestService } from '@/services/request.service';
import { matchingService } from '@/services/matching.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud'];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', search, selectedTrack],
    queryFn: () => {
      const params: any = { isLookingForTeam: true };
      if (search) params.name = search;
      if (selectedTrack !== 'All') params.track = selectedTrack;
      return userService.getAllUsers(params);
    },
  });

  const { data: recommendations } = useQuery({
    queryKey: ['userRecommendations'],
    queryFn: matchingService.recommendTeammates,
    enabled: !!currentUser?.team,
  });

  const inviteMutation = useMutation({
    mutationFn: ({ userId, teamId }: { userId: string, teamId: string }) =>
      requestService.inviteUser(userId, teamId),
    onSuccess: () => {
      toast.success('Invitation sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });

  const handleInvite = (userId: string) => {
    if (!currentUser?.team) {
      toast.error('You must be in a team to invite users.');
      return;
    }
    
    // Extract team ID safely from string or object
    const teamId = typeof currentUser.team === 'string' 
      ? currentUser.team 
      : (currentUser.team as any)._id || (currentUser.team as any).id;

    if (!teamId) {
      toast.error('Could not determine team ID. Please refresh.');
      return;
    }

    inviteMutation.mutate({ userId, teamId });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900">Find Teammates</h1>
        <p className="text-slate-500">Discover talented students ready to join a project.</p>
      </div>

      {/* Recommended Section */}
      {currentUser?.team && recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--github-blue)]" />
            <h2 className="text-xl font-bold text-slate-800">Smart Recommendations</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((match) => (
              <Card key={match.item._id} className="border-indigo-100 bg-indigo-50/20 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-lg">
                      {match.item.name.charAt(0)}
                    </div>
                    <Badge variant="success">{Math.round(match.score)}% match</Badge>
                  </div>
                  <CardTitle className="mt-4">{match.item.name}</CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {match.item.tracks.map(track => (
                      <Badge key={track} variant="secondary" className="text-[10px]">{track}</Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.item.skills.slice(0, 4).map(skill => (
                      <Badge key={skill} variant="outline" className="bg-white text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={() => handleInvite(match.item._id)}
                    isLoading={inviteMutation.isPending && inviteMutation.variables?.userId === match.item._id}
                  >
                    <UserPlus size={16} className="mr-2" />
                    Invite to Team
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Browsing Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--github-fg)]">All Available Students</h2>

        {/* Filters */}
        <Card className="bg-[var(--github-subtle)] border-[var(--github-border)]">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by student name..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="h-8 rounded-[6px] border border-[var(--github-border)] bg-[var(--github-bg)] px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--github-blue)] min-w-[200px] text-[var(--github-fg)]"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="All">All Tracks</option>
              {TRACKS_OPTIONS.map(track => <option key={track} value={track}>{track}</option>)}
            </select>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.filter(u => u._id !== currentUser?._id).map((student) => (
              <Card key={student._id} className="flex flex-col group hover:border-[var(--github-blue)] transition-all">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-[var(--github-subtle)] flex items-center justify-center font-bold text-[var(--github-fg)] opacity-70 text-xl group-hover:bg-[var(--github-blue)] group-hover:text-white transition-colors border border-[var(--github-border)]">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.tracks.map(track => (
                          <Badge key={track} variant="secondary" className="text-[10px]">{track}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm text-slate-600 line-clamp-2 italic">
                    "{student.bio || 'Hello! I am looking for a graduation project team.'}"
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 pt-2">
                    {student.githubUrl && (
                      <a href={student.githubUrl} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                        <Github size={18} />
                      </a>
                    )}
                    {student.portfolioUrl && (
                      <a href={student.portfolioUrl} target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <a href={`mailto:${student.email}`} className="text-slate-400 hover:text-slate-900 transition-colors">
                      <Mail size={18} />
                    </a>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t border-[var(--github-border)]">
                  <Button
                    variant={currentUser?.team ? 'primary' : 'outline'}
                    className="w-full"
                    disabled={!currentUser?.team}
                    onClick={() => handleInvite(student._id)}
                    isLoading={inviteMutation.isPending && inviteMutation.variables?.userId === student._id}
                  >
                    <UserPlus size={16} className="mr-2" />
                    {currentUser?.team ? 'Invite to Team' : 'No Team Found'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No students found</h3>
            <p className="text-slate-500">Everyone seems to be in a team or filters are too strict.</p>
          </div>
        )}
      </div>
    </div>
  );
}
