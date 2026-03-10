'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Star, Send, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getReseller } from '@/lib/auth';

type Stats = {
  totalClients: number;
  reviewsSent: number;
  reviewsReceived: number;
  activeChatbots: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    reviewsSent: 0,
    reviewsReceived: 0,
    activeChatbots: 0,
  });
  const [agencyName, setAgencyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setError(null);

        const reseller = await getReseller();
        if (!reseller) {
          setError('You must be signed in to view your dashboard.');
          return;
        }

        setAgencyName(reseller.agency_name);

        const { data: clientsData, count: clientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('reseller_id', reseller.id);

        if (clientsError) throw clientsError;

        const clientIds = (clientsData || []).map((c) => c.id);

        let totalSent = 0;
        let totalReviews = 0;
        let activeChatbots = 0;

        if (clientIds.length > 0) {
          const { data: campaignsData, error: campaignsError } = await supabase
            .from('review_campaigns')
            .select('total_sent, total_reviews')
            .in('client_id', clientIds);

          if (campaignsError) throw campaignsError;

          totalSent =
            campaignsData?.reduce((sum, c) => sum + (c.total_sent || 0), 0) ?? 0;
          totalReviews =
            campaignsData?.reduce((sum, c) => sum + (c.total_reviews || 0), 0) ??
            0;

          const { count: chatbotsCount, error: chatbotsError } = await supabase
            .from('chatbot_configs')
            .select('id', { count: 'exact' })
            .eq('is_active', true)
            .in('client_id', clientIds);

          if (chatbotsError) throw chatbotsError;
          activeChatbots = chatbotsCount ?? 0;
        }

        setStats({
          totalClients: clientsCount ?? 0,
          reviewsSent: totalSent,
          reviewsReceived: totalReviews,
          activeChatbots,
        });
      } catch (err: any) {
        console.error('Error loading stats:', err);
        setError(err.message || 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Reviews Sent',
      value: stats.reviewsSent,
      icon: Send,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Reviews Received',
      value: stats.reviewsReceived,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Active Chatbots',
      value: stats.activeChatbots,
      icon: MessageSquare,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ] as const;

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {agencyName ? `Welcome back, ${agencyName}` : 'Dashboard Overview'}
        </h1>
        <p className="text-gray-400">
          Here&apos;s what&apos;s happening across your clients.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-gray-800 bg-gray-900">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-4 w-28 bg-gray-800" />
                <Skeleton className="h-8 w-16 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="/dashboard/clients"
              className="block rounded-lg bg-gray-800 p-4 transition-colors duration-200 hover:bg-gray-750"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium text-white">Add New Client</div>
                  <div className="text-sm text-gray-400">
                    Onboard a new business
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/reviews"
              className="block rounded-lg bg-gray-800 p-4 transition-colors duration-200 hover:bg-gray-750"
            >
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="font-medium text-white">
                    Create Review Campaign
                  </div>
                  <div className="text-sm text-gray-400">
                    Start collecting reviews
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/chatbots"
              className="block rounded-lg bg-gray-800 p-4 transition-colors duration-200 hover:bg-gray-750"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div>
                  <div className="font-medium text-white">Setup Chatbot</div>
                  <div className="text-sm text-gray-400">
                    Configure AI assistant
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                  1
                </div>
                <div>
                  <div className="font-medium text-white">
                    Add your first client
                  </div>
                  <div className="text-sm text-gray-400">
                    Start by adding a local business
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                  2
                </div>
                <div>
                  <div className="font-medium text-white">
                    Create a review campaign
                  </div>
                  <div className="text-sm text-gray-400">
                    Set up automated review requests
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
                  3
                </div>
                <div>
                  <div className="font-medium text-white">
                    Configure AI chatbot
                  </div>
                  <div className="text-sm text-gray-400">
                    Deploy intelligent customer support
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
