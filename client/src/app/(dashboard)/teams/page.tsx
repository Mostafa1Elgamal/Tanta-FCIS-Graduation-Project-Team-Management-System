'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Users, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { teamService } from '@/services/team.service';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud'];

export default function TeamsPage() {
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams', search, selectedTrack, selectedStatus],
    queryFn: () => {
      const params: any = {};
      if (search) params.title = search;
      if (selectedTrack !== 'All') params.track = selectedTrack;
      if (selectedStatus !== 'All') params.status = selectedStatus.toLowerCase();
      return teamService.getAllTeams(params);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Teams</h1>
          <p className="text-slate-500">Find the perfect project team to join.</p>
        </div>
        <Link href="/teams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-slate-50/50 border-none shadow-none">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by team title..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
            >
              <option value="All">All Tracks</option>
              {TRACKS_OPTIONS.map(track => <option key={track} value={track}>{track}</option>)}
            </select>
            <select 
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Incomplete">Recruiting</option>
              <option value="Complete">Full</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : teams && teams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team._id} className="flex flex-col group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant={team.status === 'COMPLETE' ? 'success' : 'warning'} className="mb-2">
                    {team.status === 'COMPLETE' ? 'Full' : 'Recruiting'}
                  </Badge>
                  <div className="flex items-center text-slate-400 text-xs font-medium">
                    <Users size={14} className="mr-1" />
                    {team.currentSize} / {team.totalSize}
                  </div>
                </div>
                <CardTitle className="group-hover:text-indigo-600 transition-colors">{team.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{team.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {team.requiredTracks.map(rt => (
                    <Badge key={rt.track} variant="outline" className="text-[10px] uppercase tracking-wider">{rt.track}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-slate-50">
                <Link href={`/teams/${team._id}`}>
                  <Button variant="ghost" className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                    View Details
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <Filter size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No teams found</h3>
          <p className="text-slate-500">Try adjusting your filters or search terms.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setSelectedTrack('All'); setSelectedStatus('All'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
