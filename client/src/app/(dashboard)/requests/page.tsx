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

  const receivedRequests = requests?.filter(r => {
    const isReceiver = (typeof r.receiverId === 'object' ? (r.receiverId as any)._id : r.receiverId) === user?._id;
    const isTeamLeader = typeof r.teamId === 'object' && (r.teamId as any).leaderId === user?._id;
    // For applications, the team leader is the implicit receiver
    return isReceiver || (r.type === 'APPLICATION' && isTeamLeader);
  }) || [];

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold text-[#c9d1d9]">Collaboration Requests</h1>
        <p className="text-sm text-[#8b949e]">Manage incoming invitations and outgoing applications.</p>
      </div>

      <div className="flex border-b border-border">
        <button
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'received' ? 'text-[#c9d1d9] border-b-2 border-[#f78166]' : 'text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
          onClick={() => setActiveTab('received')}
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft size={16} />
            Received
            {receivedRequests.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[#c9d1d9] text-[10px]">
                {receivedRequests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === 'sent' ? 'text-[#c9d1d9] border-b-2 border-[#f78166]' : 'text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} />
            Sent
          </div>
        </button>
      </div>

      <div className="border border-border rounded-md bg-[#0d1117] overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#161b22] animate-pulse" />)}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(activeTab === 'received' ? receivedRequests : sentRequests).length > 0 ? (
              (activeTab === 'received' ? receivedRequests : sentRequests).map((req: any) => (
                <div key={req._id} className="p-4 hover:bg-[#161b22] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {req.status === 'PENDING' ? (
                        <Clock size={16} className="text-[#d29922]" />
                      ) : req.status === 'ACCEPTED' ? (
                        <Check size={16} className="text-[#238636]" />
                      ) : (
                        <X size={16} className="text-[#da3633]" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#c9d1d9]">
                          {activeTab === 'sent' 
                            ? (typeof req.receiverId === 'object' ? req.receiverId.name : 'Recipient')
                            : (typeof req.senderId === 'object' ? req.senderId.name : 'Sender')
                          }
                        </span>
                        <Badge variant="outline" className="text-[9px] border-border text-[#8b949e]">
                          {req.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#8b949e]">
                        {activeTab === 'sent' ? 'Sent request to join ' : 'Requested to join '}
                        <span className="text-[#58a6ff]">
                          {typeof req.teamId === 'object' ? req.teamId.title : 'Project Team'}
                        </span>
                      </p>
                      {req.message && (
                        <p className="text-xs text-[#8b949e] italic mt-1 pl-2 border-l border-border">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge 
                        variant={
                          req.status === 'ACCEPTED' ? 'success' : 
                          req.status === 'REJECTED' ? 'error' : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {req.status}
                      </Badge>
                      <p className="text-[10px] text-[#8b949e] mt-1">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {activeTab === 'received' && req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="primary"
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={() => acceptMutation.mutate(req._id)}
                          isLoading={acceptMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="secondary"
                          size="sm" 
                          className="h-8 px-3 text-xs text-[#da3633] border-[#da3633]/30 hover:border-[#da3633]"
                          onClick={() => rejectMutation.mutate(req._id)}
                          isLoading={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <MessageSquare size={48} className="mx-auto text-[#30363d] mb-4" />
                <p className="text-sm text-[#8b949e]">No {activeTab} requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
