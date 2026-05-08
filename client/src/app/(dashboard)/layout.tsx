'use client';

import React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useSocket } from '@/hooks/useSocket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useSocket();
  return (
    <ProtectedRoute>
      <div className="min-h-full">
        <Sidebar />
        <div className="lg:pl-64">
          <Navbar />
          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
