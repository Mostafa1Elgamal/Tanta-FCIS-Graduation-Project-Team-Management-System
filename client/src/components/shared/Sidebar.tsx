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
  { name: 'Requests', href: '/requests', icon: MessageSquare },
  { name: 'My Profile', href: '/profile', icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[var(--github-border)] bg-[var(--github-sidebar-bg)] px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <GraduationCap className="h-8 w-8 text-[var(--github-fg)]" />
          <span className="text-xl font-bold text-[var(--github-fg)] tracking-tight">TeamUp FCIS</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          isActive
                            ? 'bg-transparent text-[var(--github-fg)] border-l-2 border-[var(--github-orange)] rounded-none'
                            : 'text-[var(--github-fg)] opacity-70 hover:opacity-100 hover:bg-[var(--github-border)]/20',
                          'group flex gap-x-3 p-2 text-sm leading-6 font-semibold transition-all duration-200'
                        )}
                      >
                        <item.icon
                          className={cn(
                            isActive ? 'text-[var(--github-fg)]' : 'text-slate-400 group-hover:text-[var(--github-fg)]',
                            'h-6 w-6 shrink-0 transition-all duration-200'
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
            
            <li className="mt-auto">
              <Link
                href="/teams/new"
                className="group -mx-2 flex gap-x-3 rounded-[6px] p-2 text-sm font-semibold leading-6 text-[var(--github-green)] border border-[var(--github-border)] bg-[var(--github-card-bg)] hover:bg-[var(--github-green)] hover:text-white transition-all shadow-sm"
              >
                <PlusCircle className="h-6 w-6 shrink-0" aria-hidden="true" />
                Create New Team
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
