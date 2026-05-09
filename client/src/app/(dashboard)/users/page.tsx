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
import { cn } from '@/utils/cn';

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Analysis', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing'];

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2 border-b border-border pb-6">
        <h1 className="text-2xl font-semibold text-[#c9d1d9]">Find Teammates</h1>
        <p className="text-sm text-[#8b949e]">Discover talented students ready to collaborate on graduation projects.</p>
      </div>

      {/* Recommended Section */}
      {currentUser?.team && recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#d29922]" />
            <h2 className="text-sm font-semibold text-[#c9d1d9]">Recommended for your team</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recommendations.slice(0, 3).map((match) => (
              <div key={match.item._id} className="p-4 rounded-md border border-[#d29922]/30 bg-[rgba(210,153,34,0.05)] flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-10 w-10 rounded-full bg-[#30363d] flex items-center justify-center font-bold text-[#c9d1d9]">
                      {match.item.name.charAt(0)}
                    </div>
                    <Badge variant="outline" className="border-[#238636] text-[#238636] text-[10px]">
                      {Math.round(match.score)}% Match
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#c9d1d9] mb-1">{match.item.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {match.item.tracks.slice(0, 2).map(track => (
                      <Badge key={track} variant="secondary" className="text-[9px] bg-[#161b22] border-border">{track}</Badge>
                    ))}
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${(match.item.phoneNumber?.replace(/\D/g, '') || '').startsWith('20') ? match.item.phoneNumber?.replace(/\D/g, '') : '20' + (match.item.phoneNumber?.replace(/\D/g, '') || '').replace(/^0/, '')}`}
                  target="_blank"
                  className="w-full"
                >
                  <Button variant="secondary" size="sm" className="w-full text-xs h-8 text-[#238636] border-[#238636]/30 hover:border-[#238636]">
                    Contact via WhatsApp
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Browsing Section */}
      <div className="space-y-6 pt-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8b949e]" />
            <input
              placeholder="Search students..."
              className="gh-input w-full pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="gh-input h-9 bg-[#161b22] border-border text-[#c9d1d9] min-w-[180px]"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="All">All Tracks</option>
            {TRACKS_OPTIONS.map(track => <option key={track} value={track}>{track}</option>)}
          </select>
        </div>

        {/* User List */}
        <div className="border border-border rounded-md overflow-hidden bg-[#0d1117]">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 bg-[#161b22] animate-pulse h-24" />
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="divide-y divide-border">
              {users.filter(u => u._id !== currentUser?._id).map((student) => (
                <div key={student._id} className="p-4 hover:bg-[#161b22] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#30363d] flex items-center justify-center font-bold text-[#c9d1d9] text-[10px]">
                        {student.name.charAt(0)}
                      </div>
                      <h3 className="text-base font-bold text-[#58a6ff] hover:underline cursor-pointer">
                        {student.name}
                      </h3>
                      <div className="flex gap-1">
                        {student.tracks.map(track => (
                          <Badge key={track} variant="outline" className="text-[10px] border-border">{track}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#8b949e] line-clamp-1 max-w-2xl">
                      {student.bio || 'Available for collaboration on graduation projects.'}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {student.skills.slice(0, 6).map(skill => (
                        <span key={skill} className="text-[11px] text-[#8b949e] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#2f81f7]/40" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-4">
                      {student.githubUrl && (
                        <a href={student.githubUrl} target="_blank" className="text-[#8b949e] hover:text-[#c9d1d9]">
                          <Github size={20} />
                        </a>
                      )}
                      <a 
                        href={`https://wa.me/${(student.phoneNumber?.replace(/\D/g, '') || '').startsWith('20') ? student.phoneNumber?.replace(/\D/g, '') : '20' + (student.phoneNumber?.replace(/\D/g, '') || '').replace(/^0/, '')}`}
                        target="_blank"
                        className="flex items-center gap-2"
                      >
                        <Button variant="secondary" size="sm" className="text-[#238636] border-[#238636]/30 hover:border-[#238636]">
                          <Mail size={14} className="mr-2" />
                          Contact
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center">
              <Users size={48} className="mx-auto text-[#484f58] mb-4" />
              <h3 className="text-lg font-semibold text-[#c9d1d9]">No students found</h3>
              <p className="text-sm text-[#8b949e]">Everyone seems to be in a team or filters are too strict.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
