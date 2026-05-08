'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Clock, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationService } from '@/services/notification.service';
import { Button } from '@/components/ui/Button';
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
          <div className="absolute right-0 z-50 mt-2.5 w-80 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-slate-900/5 focus:outline-none overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <Badge variant="secondary" className="text-[10px]">{unreadCount} New</Badge>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications && notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={cn(
                      "group flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 transition-colors relative cursor-pointer",
                      !notification.isRead && "bg-indigo-50/50"
                    )}
                    onClick={() => {
                      if (!notification.isRead) markReadMutation.mutate(notification._id);
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-xs leading-relaxed",
                        notification.isRead ? "text-slate-600" : "text-slate-900 font-medium"
                      )}>
                        {notification.content}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <Bell className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">All caught up!</p>
                </div>
              )}
            </div>
            
            <div className="px-4 py-2 border-t border-slate-100">
              <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600" onClick={() => setIsOpen(false)}>
                View all activity
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      variant === 'secondary' ? "bg-slate-100 text-slate-600" : "bg-indigo-100 text-indigo-600",
      className
    )}>
      {children}
    </span>
  );
}
