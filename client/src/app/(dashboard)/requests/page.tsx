'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Check, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  TeamIcons, 
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { requestService } from '@/services/request.service';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type TabType = 'received' | 'sent';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: requestService.getRequests,
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => requestService.acceptRequest(id),
    onSuccess: () => {
      toast.success('Request accepted!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['myTeam'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => requestService.rejectRequest(id),
    onSuccess: () => {
      toast.success('Request rejected');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  const receivedRequests = requests?.filter(r => 
    (typeof r.receiverId === 'object' ? (r.receiverId as any)._id : r.receiverId) === user?._id
  ) || [];

  const sentRequests = requests?.filter(r => 
    (typeof r.senderId === 'object' ? (r.senderId as any)._id : r.senderId) === user?._id
  ) || [];

  const renderRequestList = (list: any[], isSent: boolean) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <MessageSquare size={32} />
          </div>
          <p className="text-slate-500">No {isSent ? 'sent' : 'received'} requests found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {list.map((req) => (
          <Card key={req._id} className="overflow-hidden border-slate-100 shadow-none ring-1 ring-slate-100 hover:ring-indigo-200 transition-all">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-stretch">
                <div className={`w-2 ${isSent ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {isSent 
                        ? (typeof req.receiverId === 'object' ? req.receiverId.name.charAt(0) : 'U')
                        : (typeof req.senderId === 'object' ? req.senderId.name.charAt(0) : 'U')
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900">
                          {isSent 
                            ? (typeof req.receiverId === 'object' ? req.receiverId.name : 'Recipient')
                            : (typeof req.senderId === 'object' ? req.senderId.name : 'Sender')
                          }
                        </h4>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {req.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {isSent ? 'Sent to: ' : 'From: '} 
                        <span className="font-semibold text-indigo-600">
                          {typeof req.teamId === 'object' ? req.teamId.title : 'Project Team'}
                        </span>
                      </p>
                      {req.message && (
                        <p className="mt-2 text-sm text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={
                          req.status === 'ACCEPTED' ? 'success' : 
                          req.status === 'REJECTED' ? 'error' : 'warning'
                        }
                      >
                        {req.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!isSent && req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9 p-0"
                          onClick={() => acceptMutation.mutate(req._id)}
                          isLoading={acceptMutation.isPending}
                        >
                          <Check size={18} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          className="h-9 w-9 p-0"
                          onClick={() => rejectMutation.mutate(req._id)}
                          isLoading={rejectMutation.isPending}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Requests & Invitations</h1>
        <p className="text-slate-500">Manage your incoming and outgoing requests.</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'received' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('received')}
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft size={18} />
            Received
            {receivedRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                {receivedRequests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </div>
          {activeTab === 'received' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          className={`px-6 py-3 text-sm font-semibold transition-all relative ${
            activeTab === 'sent' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight size={18} />
            Sent
          </div>
          {activeTab === 'sent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      <div className="pt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : activeTab === 'received' ? (
          renderRequestList(receivedRequests, false)
        ) : (
          renderRequestList(sentRequests, true)
        )}
      </div>
    </div>
  );
}
