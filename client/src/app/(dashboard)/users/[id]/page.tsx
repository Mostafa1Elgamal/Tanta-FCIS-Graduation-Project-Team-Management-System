'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Code, 
  Briefcase,
  Users,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-48 bg-[#161b22] rounded-md border border-border" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <div className="h-64 bg-[#161b22] rounded-md border border-border" />
          </div>
          <div className="md:col-span-2 space-y-6">
            <div className="h-64 bg-[#161b22] rounded-md border border-border" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <h2 className="text-xl font-semibold text-[#c9d1d9]">User not found</h2>
        <p className="text-[#8b949e] mt-2">The user you are looking for does not exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header / Profile Info */}
      <div className="relative border border-border rounded-lg bg-[#161b22] overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#1f6feb] to-[#238636] opacity-20" />
        <div className="px-8 pb-8 flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12">
          <div className="h-24 w-24 rounded-full bg-[#30363d] border-4 border-[#0d1117] flex items-center justify-center text-4xl font-bold text-[#c9d1d9] shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-bold text-[#c9d1d9]">{user.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-[#8b949e]">
              <span className="flex items-center gap-1.5">
                <Briefcase size={14} />
                {user.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                Tanta University
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex gap-3 pt-4 md:pt-0">
            <a 
              href={`https://wa.me/${(user.phoneNumber?.replace(/\D/g, '') || '').startsWith('20') ? user.phoneNumber?.replace(/\D/g, '') : '20' + (user.phoneNumber?.replace(/\D/g, '') || '').replace(/^0/, '')}`}
              target="_blank"
            >
              <Button className="gh-button-primary">
                <MessageSquare size={16} className="mr-2" />
                Message
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-[#0d1117] border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border mb-4 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-[#c9d1d9]">About</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                  <Phone size={14} className="text-[#8b949e]" />
                  {user.phoneNumber}
                </div>
                {user.email && (
                  <div className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                    <Mail size={14} className="text-[#8b949e]" />
                    {user.email}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-[#c9d1d9]">
                  <Users size={14} className="text-[#8b949e]" />
                  {user.status === 'IN_TEAM' ? 'Currently in a team' : 'Looking for a team'}
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-3">
                <h4 className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider">Tracks</h4>
                <div className="flex flex-wrap gap-2">
                  {user.tracks.map(track => (
                    <Badge key={track} variant="secondary" className="bg-[#161b22] border-border text-[#c9d1d9]">
                      {track}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bio & Skills */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#0d1117] border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border mb-4 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-[#c9d1d9]">Biography</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
                {user.bio || 'This user has not provided a biography yet.'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#0d1117] border-border shadow-none">
            <CardHeader className="pb-3 border-b border-border mb-4 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-[#c9d1d9]">Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {user.skills && user.skills.length > 0 ? (
                  user.skills.map(skill => (
                    <div key={skill} className="px-3 py-1.5 rounded-md border border-border bg-[#161b22] text-xs text-[#c9d1d9] flex items-center gap-2">
                      <Code size={12} className="text-[#2f81f7]" />
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#8b949e]">No skills listed yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
