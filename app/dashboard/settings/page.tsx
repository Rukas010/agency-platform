'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase, type Reseller } from '@/lib/supabase';
import { getReseller } from '@/lib/auth';
import { Loader2, Upload } from 'lucide-react';

type SettingsFormState = {
  agency_name: string;
  primary_color: string;
  plan: Reseller['plan'];
  logoFile?: File | null;
  accountEmail: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsFormState>({
    agency_name: '',
    primary_color: '#2563eb',
    plan: 'free',
    logoFile: null,
    accountEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setError(null);
        const reseller = await getReseller();
        if (!reseller) {
          setError('You must be signed in to manage account settings.');
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        setForm((prev) => ({
          ...prev,
          agency_name: reseller.agency_name,
          primary_color: reseller.primary_color || '#2563eb',
          plan: reseller.plan,
          accountEmail: user?.email || '',
        }));
      } catch (err: any) {
        console.error('Error loading settings:', err);
        setError(err.message || 'Failed to load settings.');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const reseller = await getReseller();
      if (!reseller) throw new Error('No reseller profile found.');

      const { error: updateError } = await supabase
        .from('resellers')
        .update({
          agency_name: form.agency_name,
          primary_color: form.primary_color || '#2563eb',
        })
        .eq('id', reseller.id);

      if (updateError) throw updateError;

      setSuccess('Settings saved successfully.');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  const planLabelMap: Record<Reseller['plan'], string> = {
    free: 'Free',
    starter: 'Starter',
    growth: 'Growth',
    scale: 'Scale',
  };

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400">
          Manage your agency branding and account details.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5">
            <CardHeader>
              <Skeleton className="h-6 w-28 bg-gray-800" />
              <Skeleton className="mt-2 h-4 w-72 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 bg-gray-800" />
                <Skeleton className="h-20 w-full bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-10 w-60 bg-gray-800" />
              </div>
              <Skeleton className="h-10 w-40 bg-gray-800" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5">
              <CardHeader>
                <Skeleton className="h-6 w-36 bg-gray-800" />
                <Skeleton className="mt-2 h-4 w-72 bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-40 bg-gray-800" />
              </CardContent>
            </Card>
            <Card className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-gray-800" />
                <Skeleton className="mt-2 h-4 w-60 bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-9 w-full bg-gray-800" />
                <Skeleton className="h-4 w-72 bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Branding</CardTitle>
              <CardDescription className="text-gray-400">
                Update how your white-label dashboard appears to clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agency_name" className="text-gray-300">
                    Agency Name
                  </Label>
                  <Input
                    id="agency_name"
                    value={form.agency_name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        agency_name: e.target.value,
                      }))
                    }
                    required
                    className="bg-gray-800 text-white border-gray-700 transition-colors duration-200 focus:border-gray-600"
                    placeholder="Your agency name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Logo</Label>
                  <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-700 bg-gray-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Upload logo
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG or SVG, up to 2MB. This is stored locally for now;
                        connect storage to persist uploads.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {form.logoFile && (
                        <span className="max-w-[160px] truncate text-xs text-gray-300">
                          {form.logoFile.name}
                        </span>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-gray-800 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors duration-200">
                        <Upload className="h-4 w-4" />
                        <span>Choose file</span>
                        <input
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setForm((prev) => ({ ...prev, logoFile: file }));
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Brand Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primary_color}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          primary_color: e.target.value,
                        }))
                      }
                      className="h-9 w-9 cursor-pointer rounded border border-gray-700 bg-gray-800"
                    />
                    <Input
                      value={form.primary_color}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          primary_color: e.target.value,
                        }))
                      }
                      className="bg-gray-800 text-white border-gray-700 transition-colors duration-200 focus:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Plan & Billing</CardTitle>
                <CardDescription className="text-gray-400">
                  View your current subscription and upgrade when you&apos;re
                  ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Current Plan</p>
                    <p className="text-xl font-semibold text-white">
                      {planLabelMap[form.plan]}
                    </p>
                  </div>
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-200">
                    Upgrade Plan
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Upgrading unlocks more client accounts, advanced automation,
                  and priority support. Connect your billing provider here.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Your login details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-400">Email</p>
                  <p className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-300">
                    {form.accountEmail || 'Not available'}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  To change your account email or password, build a dedicated
                  profile settings page or connect your authentication provider&apos;s
                  hosted UI.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

