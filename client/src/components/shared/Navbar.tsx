'use client';

import React from 'react';
import { GraduationCap, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-[#010409] px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-2 lg:hidden">
          <GraduationCap className="h-6 w-6 text-[#c9d1d9]" />
          <span className="text-lg font-bold text-[#c9d1d9]">TeamUp</span>
        </div>
        
        <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
          <NotificationDropdown />

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#161b22] border border-border flex items-center justify-center text-[#c9d1d9] font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold leading-6 text-[#c9d1d9]" aria-hidden="true">
                  {user?.name}
                </span>
              </span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout} className="text-[#8b949e] hover:text-[#c9d1d9]">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
