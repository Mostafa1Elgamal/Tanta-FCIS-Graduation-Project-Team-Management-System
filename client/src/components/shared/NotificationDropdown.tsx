'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notification.service';
import { teamService } from '@/services/team.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500 relative transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">View notifications</span>
        <Bell className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 z-50 mt-2.5 w-80 origin-top-right rounded-md bg-[#161b22] border border-border py-2 shadow-2xl focus:outline-none overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#c9d1d9]">Notifications</h3>
              <span className="text-[10px] bg-[#30363d] text-[#8b949e] px-1.5 py-0.5 rounded-full">{unreadCount} New</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "group flex flex-col gap-1 px-4 py-3 hover:bg-[#1f2428] transition-colors relative cursor-pointer border-b border-border last:border-0",
                      !notification.isRead && "bg-[rgba(56,139,253,0.05)]"
                    )}
                    onClick={() => {
                      if (!notification.isRead && notification.type !== 'TEAM_SWITCH_REQUEST') {
                        markReadMutation.mutate(notification._id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-[11px] leading-normal",
                        notification.isRead ? "text-[#8b949e]" : "text-[#c9d1d9] font-medium"
                      )}>
                        {notification.content}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-[#2f81f7] shrink-0 mt-1 shadow-[0_0_8px_rgba(47,129,247,0.5)]" />
                      )}
                    </div>

                    {notification.type === 'TEAM_SWITCH_REQUEST' && !notification.isRead && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="xs" 
                          variant="primary"
                          className="flex-1 text-[10px] h-6"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await teamService.respondToSwitch(notification._id, 'JOIN');
                              toast.success('Joined new team!');
                              queryClient.invalidateQueries({ queryKey: ['notifications'] });
                              queryClient.invalidateQueries({ queryKey: ['myTeam'] });
                              queryClient.invalidateQueries({ queryKey: ['user'] });
                            } catch (err) {
                              toast.error('Failed to join team');
                            }
                          }}
                        >
                          Join
                        </Button>
                        <Button 
                          size="xs" 
                          variant="secondary" 
                          className="flex-1 text-[10px] h-6"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await teamService.respondToSwitch(notification._id, 'STAY');
                              toast.info('Decided to stay.');
                              queryClient.invalidateQueries({ queryKey: ['notifications'] });
                            } catch (err) {
                              toast.error('Failed to record decision');
                            }
                          }}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={10} className="text-[#8b949e]" />
                      <span className="text-[10px] text-[#8b949e]">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-8 w-8 text-[#30363d] mx-auto mb-2" />
                  <p className="text-xs text-[#8b949e]">No new notifications</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full text-[10px] text-[#58a6ff] hover:bg-[#1f2428]" onClick={() => setIsOpen(false)}>
                Archive all notifications
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
