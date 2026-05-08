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
  Trophy,
  PlusCircle,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { teamService } from '@/services/team.service';
import { matchingService } from '@/services/matching.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: myTeam } = useQuery({
    queryKey: ['myTeam', user?.team],
    queryFn: () => (user?.team ? teamService.getTeam(typeof user.team === 'string' ? user.team : user.team._id) : null),
    enabled: !!user?.team,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['teamRecommendations'],
    queryFn: matchingService.recommendTeams,
    enabled: !user?.team,
  });

  // const pendingRequests = requests?.filter(r => r.status === 'PENDING') || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#c9d1d9]">Dashboard</h1>
          <p className="text-sm text-[#8b949e]">Overview of your graduation project progress.</p>
        </div>
        {!user?.team && (
          <Link href="/teams/new">
            <Button variant="primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Status', value: user?.status === 'IN_TEAM' ? 'In a Team' : 'Looking', icon: CheckCircle2, color: 'text-[#238636]' },
          { label: 'Teammates', value: myTeam ? `${myTeam.currentSize} / ${myTeam.totalSize}` : '0', icon: Users, color: 'text-[#2f81f7]' },
          { label: 'Phone', value: user?.phoneNumber ? 'Verified' : 'Missing', icon: AlertCircle, color: user?.phoneNumber ? 'text-[#238636]' : 'text-[#da3633]' },
          { label: 'Primary Track', value: user?.tracks?.[0] || 'Not Set', icon: Trophy, color: 'text-[#d29922]' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#161b22] border border-border rounded-md p-4 flex items-center gap-4">
            <div className={cn("p-2 rounded-md bg-[#0d1117] border border-border", stat.color)}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8b949e] font-bold">{stat.label}</p>
              <p className="text-sm font-semibold text-[#c9d1d9]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Team / Recommendations */}
          {myTeam ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-[#2f81f7]" />
                    <CardTitle>Current Team</CardTitle>
                  </div>
                  <Badge variant={myTeam.status === 'COMPLETE' ? 'success' : 'warning'}>
                    {myTeam.status === 'COMPLETE' ? 'Full' : 'Recruiting'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Link href={`/teams/${myTeam._id}`} className="text-lg font-bold text-[#58a6ff] hover:underline">
                    {myTeam.title}
                  </Link>
                  <p className="text-sm text-[#8b949e] mt-1 line-clamp-2">{myTeam.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {myTeam.requiredTracks.map((rt) => (
                    <Badge key={rt.track} variant="outline">{rt.track}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Link href={`/teams/${myTeam._id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">View Team Page</Button>
                  </Link>
                  {myTeam.leaderId === user?.id && (
                    <Link href={`/teams/${myTeam._id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full text-[#c9d1d9]">Settings</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-[#161b22] border border-border border-dashed rounded-md p-12 text-center">
              <Users size={48} className="mx-auto text-[#484f58] mb-4" />
              <h3 className="text-lg font-semibold text-[#c9d1d9]">No team joined yet</h3>
              <p className="text-sm text-[#8b949e] mb-6">Join an existing team or create your own to start collaborating.</p>
              <div className="flex justify-center gap-4">
                <Link href="/teams">
                  <Button variant="secondary">Browse Teams</Button>
                </Link>
                <Link href="/teams/new">
                  <Button variant="primary">Create Team</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Activity / Notifications List (Simplified Feed) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#d29922]" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mocked activity feed for now */}
                <div className="flex gap-3 text-sm">
                  <div className="h-6 w-6 rounded-full bg-[#30363d] flex items-center justify-center text-[10px] shrink-0 font-bold">M</div>
                  <div>
                    <p className="text-[#c9d1d9]"><span className="font-bold">You</span> joined the system</p>
                    <p className="text-xs text-[#8b949e]">Recent</p>
                  </div>
                </div>
                <p className="text-xs text-[#8b949e] italic text-center py-4">No recent team activities to show.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          {/* Recommendations if looking */}
          {!user?.team && (
            <Card className="border-[#30363d]">
              <CardHeader>
                <CardTitle className="text-sm">Team Recommendations</CardTitle>
                <CardDescription>Based on your {user?.tracks?.[0] || 'track'}</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((match) => (
                      <Link key={match.item?._id} href={`/teams/${match.item?._id}`} className="block p-3 rounded-md border border-border hover:bg-[#0d1117] transition-colors group">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-[#58a6ff] group-hover:underline truncate">{match.item?.title}</h4>
                          <span className="text-[10px] text-[#238636] font-bold">{Math.round(match.score || 0)}%</span>
                        </div>
                        <div className="flex gap-1">
                          {match.item?.requiredTracks.slice(0, 2).map((rt: any) => (
                            <span key={rt.track} className="text-[9px] text-[#8b949e]">{rt.track}</span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8b949e] italic">No matches found for your tracks.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#c9d1d9]">Project Guidelines</p>
                <p className="text-[10px] text-[#8b949e]">Please ensure your team meets the departmental requirements for student count and track distribution.</p>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-[#8b949e]">Need help? Contact the graduation project department.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
