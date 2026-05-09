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

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Analysis', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing'];

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#c9d1d9]">Explore Teams</h1>
          <p className="text-sm text-[#8b949e]">Find the perfect project team to join.</p>
        </div>
        <Link href="/teams/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
          <input
            placeholder="Search teams..."
            className="gh-input w-full pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="gh-input h-9 bg-[#161b22] border-border text-[#c9d1d9]"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="All">All Tracks</option>
            {TRACKS_OPTIONS.map(track => <option key={track} value={track}>{track}</option>)}
          </select>
          <select
            className="gh-input h-9 bg-[#161b22] border-border text-[#c9d1d9]"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Incomplete">Recruiting</option>
            <option value="Complete">Full</option>
          </select>
        </div>
      </div>

      {/* Teams List */}
      <div className="border border-border rounded-md overflow-hidden bg-[#0d1117]">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 bg-[#161b22] animate-pulse">
                <div className="h-4 w-1/4 bg-[#30363d] rounded mb-2" />
                <div className="h-3 w-1/2 bg-[#30363d] rounded" />
              </div>
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="divide-y divide-border">
            {teams.map((team) => (
              <div key={team._id} className="p-4 hover:bg-[#161b22] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/teams/${team._id}`} className="text-base font-bold text-[#58a6ff] hover:underline">
                      {team.title}
                    </Link>
                    <Badge variant={team.status === 'COMPLETE' ? 'success' : 'warning'}>
                      {team.status === 'COMPLETE' ? 'Full' : 'Recruiting'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#8b949e] line-clamp-2 max-w-2xl">{team.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {team.requiredTracks.map(rt => (
                      <Badge key={rt.track} variant="outline" className="text-[10px]">{rt.track}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 pt-2 text-[11px] text-[#8b949e]">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {team.currentSize} / {team.totalSize} members
                    </span>
                    <span>Updated recently</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/${((team.leaderId as any)?.phoneNumber?.replace(/\D/g, '') || '').startsWith('20') ? (team.leaderId as any)?.phoneNumber?.replace(/\D/g, '') : '20' + ((team.leaderId as any)?.phoneNumber?.replace(/\D/g, '') || '').replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" size="sm" className="text-[#238636] border-[#238636]/30 hover:border-[#238636]">
                      WhatsApp
                    </Button>
                  </a>
                  <Link href={`/teams/${team._id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <Filter size={48} className="mx-auto text-[#484f58] mb-4" />
            <h3 className="text-lg font-semibold text-[#c9d1d9]">No teams found</h3>
            <p className="text-sm text-[#8b949e] mb-6">Adjust your search or filters to find more teams.</p>
            <Button variant="secondary" onClick={() => { setSearch(''); setSelectedTrack('All'); setSelectedStatus('All'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
