'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  MessageSquare, 
  Search, 
  GraduationCap,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Teams', href: '/teams', icon: Search },
  { name: 'Students', href: '/users', icon: Users },
  { name: 'My Profile', href: '/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-[#010409] px-4 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border mb-2">
          <GraduationCap className="h-6 w-6 text-[#c9d1d9]" />
          <span className="text-base font-semibold text-[#c9d1d9] tracking-tight">TeamUp FCIS</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "gh-nav-item",
                          isActive && "active"
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-[#c9d1d9]' : 'text-[#8b949e]',
                            'h-4 w-4 shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto pb-4">
              <Link
                href="/teams/new"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-[#c9d1d9] bg-[#238636] hover:bg-[#2ea043] transition-all shadow-sm"
              >
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                New Team
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
