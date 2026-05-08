'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
        socketRef.current?.emit('join', user._id);
      });

      socketRef.current.on('notification', (data) => {
        toast.info(data.content, {
          description: 'New notification received',
          action: {
            label: 'View',
            onClick: () => (window.location.href = '/requests'),
          },
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['requests'] });
        queryClient.invalidateQueries({ queryKey: ['myTeam'] });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return () => {
      // We don't necessarily want to disconnect on every re-render, 
      // but if the component unmounts for good, we might.
      // However, usually we want one socket per session.
    };
  }, [isAuthenticated, user, queryClient]);

  return socketRef.current;
};
