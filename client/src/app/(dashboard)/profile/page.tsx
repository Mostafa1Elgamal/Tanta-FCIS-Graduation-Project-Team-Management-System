'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Mail,
  Globe,
  Code,
  Save,
  CheckCircle2
} from 'lucide-react';
import { Github } from '@/components/icons/Github';
import { useAuthStore } from '@/store/useAuthStore';
import { userService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const profileSchema = z.object({
  department: z.string().min(2, 'Department is required'),
  tracks: z.array(z.string()).min(1, 'At least one track is required'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  skills: z.string().optional(),
  githubUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  portfolioUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  status: z.enum(['LOOKING', 'IN_TEAM']),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud', 'Data Analysis', 'Data Science', 'Machine Learning', 'Embedded Systems', 'Game Development', 'DevOps', 'Blockchain', 'Software Testing'];

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      department: user?.department || '',
      tracks: user?.tracks || [],
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      githubUrl: user?.githubUrl || '',
      portfolioUrl: user?.portfolioUrl || '',
      status: user?.status || 'LOOKING',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const skillsArray = data.skills
        ? data.skills.split(',').map(s => s.trim()).filter(s => s !== '')
        : [];

      const updatedUser = await userService.updateProfile({
        ...data,
        skills: skillsArray,
      });

      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const currentStatus = watch('status');
  const selectedTracks = watch('tracks');

  const toggleTrack = (track: string) => {
    if (selectedTracks.includes(track)) {
      setValue('tracks', selectedTracks.filter(t => t !== track));
    } else {
      setValue('tracks', [...selectedTracks, track]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#c9d1d9]">Settings</h1>
          <p className="text-sm text-[#8b949e]">Manage your public profile and preferences.</p>
        </div>
        <Button
          variant={isEditing ? 'secondary' : 'primary'}
          onClick={() => {
            if (isEditing) reset();
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-md bg-[#30363d] flex items-center justify-center text-5xl font-bold text-[#c9d1d9] border border-border">
              {user?.name?.charAt(0)}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#c9d1d9]">{user?.name}</h2>
              <p className="text-[#8b949e] text-sm">{user?.department}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
              <Mail size={16} className="text-[#8b949e]" />
              <span className="truncate">{user?.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
              <Github size={16} className="text-[#8b949e]" />
              {user?.githubUrl ? (
                <a href={user.githubUrl} target="_blank" className="text-[#58a6ff] hover:underline truncate">
                  {user.githubUrl.replace('https://github.com/', '')}
                </a>
              ) : <span className="text-[#8b949e] italic">No GitHub</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#c9d1d9]">
              <Globe size={16} className="text-[#8b949e]" />
              {user?.portfolioUrl ? (
                <a href={user.portfolioUrl} target="_blank" className="text-[#58a6ff] hover:underline truncate">
                  {user.portfolioUrl.replace('https://', '')}
                </a>
              ) : <span className="text-[#8b949e] italic">No Portfolio</span>}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Badge variant={user?.status === 'LOOKING' ? 'success' : 'secondary'} className="w-full justify-center py-1">
              {user?.status === 'LOOKING' ? 'Looking for Team' : 'Currently in Team'}
            </Badge>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2">Public Profile</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#c9d1d9]">Bio</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-border bg-[#0d1117] px-3 py-2 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      placeholder="Write a short bio about yourself..."
                      {...register('bio')}
                    />
                    {errors.bio && <p className="text-[10px] text-[#f85149]">{errors.bio.message}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="GitHub URL"
                      placeholder="https://github.com/..."
                      {...register('githubUrl')}
                      error={errors.githubUrl?.message}
                      className="gh-input h-9"
                    />
                    <Input
                      label="Portfolio URL"
                      placeholder="https://..."
                      {...register('portfolioUrl')}
                      error={errors.portfolioUrl?.message}
                      className="gh-input h-9"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2">Technical Tracks</h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {TRACKS_OPTIONS.map(track => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => toggleTrack(track)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                          selectedTracks.includes(track)
                            ? "bg-[#238636] text-white border-[#238636]"
                            : "bg-[#161b22] text-[#8b949e] border-border hover:border-[#8b949e]"
                        )}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                  {errors.tracks && <p className="text-[10px] text-[#f85149]">{errors.tracks.message}</p>}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2">Availability</h3>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      value="LOOKING"
                      {...register('status')}
                      className="h-4 w-4 border-border bg-[#161b22] text-blue-600 focus:ring-offset-[#0d1117] focus:ring-blue-500"
                    />
                    <span className="text-sm text-[#c9d1d9] group-hover:text-[#58a6ff]">Available for Teams</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      value="IN_TEAM"
                      {...register('status')}
                      className="h-4 w-4 border-border bg-[#161b22] text-blue-600 focus:ring-offset-[#0d1117] focus:ring-blue-500"
                    />
                    <span className="text-sm text-[#c9d1d9] group-hover:text-[#58a6ff]">Not Looking</span>
                  </label>
                </div>
              </section>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  <Save size={16} className="mr-2" />
                  Save Settings
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              <section>
                <h3 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2 mb-4">About</h3>
                <p className="text-sm text-[#8b949e] leading-relaxed whitespace-pre-wrap">
                  {user?.bio || 'No bio provided.'}
                </p>
              </section>

              <section>
                <h3 className="text-base font-semibold text-[#c9d1d9] border-b border-border pb-2 mb-4">Expertise</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Tracks</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user?.tracks?.map(track => (
                        <Badge key={track} variant="outline" className="bg-[#161b22] border-border text-[#c9d1d9]">
                          {track}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {user?.skills?.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-[#0d1117] border-border text-[#8b949e]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {user?.status === 'IN_TEAM' && (
                <div className="p-4 rounded-md border border-[#238636] bg-[rgba(35,134,54,0.1)] text-[#3fb950] text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <CheckCircle2 size={16} />
                    Project Team Assigned
                  </div>
                  <p className="text-xs opacity-80">You are currently part of a graduation project team.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
