'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { teamService } from '@/services/team.service';
import { requestService } from '@/services/request.service';
import { matchingService } from '@/services/matching.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: myTeam } = useQuery({
    queryKey: ['myTeam', user?.team],
    queryFn: () => (user?.team ? teamService.getTeam(typeof user.team === 'string' ? user.team : user.team._id) : null),
    enabled: !!user?.team,
  });

  const { data: requests } = useQuery({
    queryKey: ['requests'],
    queryFn: requestService.getRequests,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['teamRecommendations'],
    queryFn: matchingService.recommendTeams,
    enabled: !user?.team,
  });

  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--github-fg)]">Welcome back, {user?.name}!</h1>
          <p className="text-[var(--github-fg)] opacity-70">Here's what's happening with your graduation project team.</p>
        </div>
        {!user?.team && (
          <Link href="/teams/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create a Team
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Project Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.status === 'IN_TEAM' ? 'In a Team' : 'Looking for Team'}</div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.status === 'IN_TEAM' ? 'You are part of a project team' : 'Check out recommendations below'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              {pendingRequests.length > 0 ? 'Action required' : 'All caught up'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Track</CardTitle>
            <Trophy className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {user?.tracks && user.tracks.length > 0 ? user.tracks[0] : 'Not Set'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.tracks && user.tracks.length > 1 ? `+${user.tracks.length - 1} more tracks` : 'Your primary track'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Teammates Found</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myTeam ? `${myTeam.currentSize} / ${myTeam.totalSize}` : '0'}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total team members</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {/* Current Team Section */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-[var(--github-subtle)]">
              <CardTitle>Current Team</CardTitle>
              <CardDescription>Manage your team and project details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {myTeam ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--github-blue)]">{myTeam.title}</h3>
                    <Badge variant={myTeam.status === 'COMPLETE' ? 'success' : 'warning'}>
                      {myTeam.status === 'COMPLETE' ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{myTeam.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {myTeam.requiredTracks.map((rt) => (
                      <Badge key={rt.track} variant="outline">{rt.track}</Badge>
                    ))}
                  </div>
                  <Link href={`/teams/${myTeam._id}`}>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-slate-100 p-3 text-slate-400 mb-4">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-600 mb-4 font-medium">You haven't joined a team yet.</p>
                  <div className="flex gap-4">
                    <Link href="/teams">
                      <Button variant="outline">Browse Teams</Button>
                    </Link>
                    <Link href="/teams/new">
                      <Button>Create Team</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>Applications and invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((req) => (
                    <div key={req._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {typeof req.sender === 'object' && req.sender ? (req.sender as any).name?.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {req.type?.toLowerCase() === 'application' ? 'Application received' : 'Invitation received'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {typeof req.team === 'object' && req.team ? (req.team as any).title : 'Team Project'}
                          </p>
                        </div>
                      </div>
                      <Link href="/requests">
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ))}
                  {pendingRequests.length > 3 && (
                    <Link href="/requests">
                      <Button variant="ghost" className="w-full text-slate-500 text-xs">View all {pendingRequests.length} requests</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Smart Recommendations */}
          {!user?.team && (
            <Card className="border-indigo-100 bg-indigo-50/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Smart Matches</CardTitle>
                </div>
                <CardDescription>Based on your track and skills</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((match) => (
                      <div key={match.item?._id} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm transition-hover hover:shadow-md">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{match.item?.title || 'Unknown Team'}</h4>
                          <Badge variant="success">{Math.round(match.score || 0)}% match</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{match.item?.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {match.item?.members?.slice(0, 3).map((m: any, i: number) => (
                              <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                                {typeof m === 'object' && m ? m.name?.charAt(0) : 'U'}
                              </div>
                            ))}
                          </div>
                          <Link href={`/teams/${match.item._id}`} className="text-xs font-semibold text-indigo-600 flex items-center hover:underline">
                            View <ArrowRight size={12} className="ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                    <Link href="/teams">
                      <Button variant="outline" className="w-full bg-white">View All Teams</Button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4 italic">Complete your profile to get recommendations!</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Tips / Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Team Selection Ends</p>
                  <p className="text-xs text-slate-500">May 20, 2026</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Proposal Submission</p>
                  <p className="text-xs text-slate-500">June 15, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
