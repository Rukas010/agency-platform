'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, getReseller } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  Building2,
  LayoutDashboard,
  Users,
  Star,
  Bot,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import type { Reseller } from '@/lib/supabase';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Building2 },
  { name: 'Reviews', href: '/dashboard/reviews', icon: Star },
  { name: 'Chatbots', href: '/dashboard/chatbots', icon: Bot },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getReseller();
        if (!data) {
          router.push('/login');
        } else {
          setReseller(data);
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(147,51,234,0.1),transparent_55%)]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/40 via-blue-600/20 to-purple-500/30 p-[2px] shadow-lg shadow-blue-500/20">
                <div className="h-full w-full rounded-[0.65rem] bg-gray-950 flex items-center justify-center overflow-hidden border border-gray-900/70">
                  {reseller?.agency_logo_url ? (
                    <img
                      src={reseller.agency_logo_url}
                      alt={reseller.agency_name || 'Agency logo'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-white">
                      {reseller?.agency_name
                        ? reseller.agency_name.charAt(0).toUpperCase()
                        : <Building2 className="h-4 w-4 text-white" />}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-white truncate">
                  {reseller?.agency_name}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full capitalize">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400/80" />
                  <span>{reseller?.plan} plan</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item, idx) => {
              const isActive = pathname === item.href;
              const isFirstGroupEnd = idx === 3;
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/40'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border border-transparent'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? 'bg-blue-400' : 'bg-gray-700/70 group-hover:bg-gray-500'
                      }`}
                    />
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                  {isFirstGroupEnd && (
                    <div className="my-3 h-px bg-gray-800/60 mx-1" />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="p-3 border-t border-gray-800/60 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-300 rounded-xl"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
            <div className="pt-1 border-t border-gray-800 text-[10px] text-gray-500 text-center">
              Powered by <span className="font-semibold text-gray-300">AgencyKit</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
          <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-gray-900/80 backdrop-blur-md border-b border-gray-800/60 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500/40 via-blue-600/20 to-purple-500/30 p-[1px]">
                <div className="h-full w-full rounded-[0.55rem] bg-gray-950 flex items-center justify-center overflow-hidden border border-gray-900/70">
                {reseller?.agency_logo_url ? (
                  <img
                    src={reseller.agency_logo_url}
                    alt={reseller.agency_name || 'Agency logo'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {reseller?.agency_name
                      ? reseller.agency_name.charAt(0).toUpperCase()
                      : <Building2 className="h-4 w-4 text-white" />}
                  </span>
                )}
                </div>
              </div>
              <span className="text-sm font-semibold text-white">
                {reseller?.agency_name}
              </span>
            </div>
            <div className="w-6" />
          </div>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
