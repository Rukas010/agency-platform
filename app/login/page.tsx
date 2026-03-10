'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building2, Loader as Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(147,51,234,0.18),transparent_55%),radial-gradient(circle_at_center,_rgba(15,23,42,0.9),rgba(15,23,42,1))]" />
      <Card className="relative w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl md:text-4xl text-center font-extrabold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-gray-400 text-sm">
            Manage your AI agency from one dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded-md text-xs font-medium text-gray-300"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@agency.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="inline-flex items-center bg-gray-800 px-2 py-0.5 rounded-md text-xs font-medium text-gray-300"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 transition-colors duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 h-11 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:text-blue-400">
              Create one
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
