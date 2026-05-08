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

const TRACKS_OPTIONS = ['Frontend', 'Backend', 'AI', 'Mobile', 'UI/UX', 'Cybersecurity', 'Cloud'];

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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-500">Manage your identity and availability.</p>
        </div>
        <Button
          variant={isEditing ? 'outline' : 'primary'}
          onClick={() => {
            if (isEditing) reset();
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Info Sidebar */}
        <div className="space-y-6">
          <Card className="text-center overflow-hidden">
            <div className="h-24 bg-indigo-600" />
            <CardContent className="pt-0 -mt-10 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-600 shadow-sm">
                {user?.name?.charAt(0)}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                <Mail size={14} />
                {user?.email}
              </p>
              <div className="mt-4 w-full flex items-center justify-center gap-2">
                <Badge variant={user?.status === 'LOOKING' ? 'success' : 'secondary'}>
                  {user?.status === 'LOOKING' ? 'Looking for Team' : 'In a Team'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact & Social</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Github size={18} className="text-slate-400" />
                {user?.githubUrl ? (
                  <a href={user.githubUrl} target="_blank" className="hover:text-indigo-600 hover:underline transition-colors truncate">
                    {user.githubUrl.replace('https://', '')}
                  </a>
                ) : <span className="text-slate-300 italic">Not added</span>}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Globe size={18} className="text-slate-400" />
                {user?.portfolioUrl ? (
                  <a href={user.portfolioUrl} target="_blank" className="hover:text-indigo-600 hover:underline transition-colors truncate">
                    {user.portfolioUrl.replace('https://', '')}
                  </a>
                ) : <span className="text-slate-300 italic">Not added</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form/Display Area */}
        <div className="md:col-span-2 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    label="Department"
                    placeholder="e.g. Computer Science"
                    {...register('department')}
                    error={errors.department?.message}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Expertise Tracks</label>
                    <div className="flex flex-wrap gap-2">
                      {TRACKS_OPTIONS.map(track => (
                        <button
                          key={track}
                          type="button"
                          onClick={() => toggleTrack(track)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                            selectedTracks.includes(track)
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                          )}
                        >
                          {track}
                        </button>
                      ))}
                    </div>
                    {errors.tracks && <p className="text-xs text-red-500">{errors.tracks.message}</p>}
                  </div>

                  <Input
                    label="Bio"
                    placeholder="Short description about yourself..."
                    {...register('bio')}
                    error={errors.bio?.message}
                  />

                  <Input
                    label="Skills (comma separated)"
                    placeholder="React, Node.js, Python, Figma..."
                    {...register('skills')}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Github URL"
                      placeholder="https://github.com/..."
                      {...register('githubUrl')}
                      error={errors.githubUrl?.message}
                    />
                    <Input
                      label="Portfolio URL"
                      placeholder="https://..."
                      {...register('portfolioUrl')}
                      error={errors.portfolioUrl?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Availability Status</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="LOOKING"
                          {...register('status')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Looking for Team</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="IN_TEAM"
                          {...register('status')}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">Already in a Team</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                  <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </form>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 leading-relaxed">
                    {user?.bio || 'No bio provided. Click edit to add one!'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expertise & Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Department</h4>
                    <p className="text-slate-700 font-medium mb-4">{user?.department || 'Not Specified'}</p>

                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Specialization Tracks</h4>
                    <div className="flex flex-wrap gap-2">
                      {user?.tracks && user.tracks.length > 0 ? (
                        user.tracks.map(track => (
                          <Badge key={track} variant="default" className="text-xs">
                            <Code size={12} className="mr-1" />
                            {track}
                          </Badge>
                        ))
                      ) : <p className="text-sm text-slate-400">No tracks specified</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Skills & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {user?.skills && user.skills.length > 0 ? (
                        user.skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="px-3 py-1.5 rounded-lg border border-slate-200">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {user?.status === 'IN_TEAM' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-emerald-900 font-bold">Successfully Matched</h4>
                    <p className="text-emerald-700 text-sm">You are currently assigned to a team. If you want to join another team, update your status to "Looking for Team".</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
