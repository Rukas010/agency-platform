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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase, type Client, type ChatbotConfig } from '@/lib/supabase';
import { getReseller } from '@/lib/auth';
import { Loader2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INDUSTRY_TEMPLATES = [
  'Dental',
  'Plumbing',
  'Restaurant',
  'Legal',
  'Auto Repair',
  'Salon',
  'Real Estate',
  'General',
] as const;

type IndustryTemplate = (typeof INDUSTRY_TEMPLATES)[number];

type ChatbotFormState = {
  welcome_message: string;
  business_context: string;
  industry_template: IndustryTemplate | '';
  is_active: boolean;
  primary_color: string;
};

export default function ChatbotsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [config, setConfig] = useState<ChatbotConfig | null>(null);
  const [form, setForm] = useState<ChatbotFormState>({
    welcome_message: 'Hi! How can I help you today?',
    business_context: '',
    industry_template: '',
    is_active: false,
    primary_color: '#2563eb',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function initialize() {
      try {
        setError(null);
        const reseller = await getReseller();
        if (!reseller) {
          setError('You must be signed in to configure chatbots.');
          return;
        }

        const { data, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('reseller_id', reseller.id)
          .order('created_at', { ascending: false });

        if (clientsError) throw clientsError;

        const clientList = data ?? [];
        setClients(clientList);

        if (clientList.length > 0) {
          const firstId = clientList[0].id;
          setSelectedClientId(firstId);
          await loadConfig(firstId);
        }
      } catch (err: any) {
        console.error('Error loading chatbot config:', err);
        setError(err.message || 'Failed to load chatbot configuration.');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  async function loadConfig(clientId: string) {
    try {
      setConfigLoading(true);
      setError(null);

      const { data, error: cfgError } = await supabase
        .from('chatbot_configs')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (cfgError) throw cfgError;

      setConfig(data as ChatbotConfig | null);

      if (data) {
        setForm({
          welcome_message:
            data.welcome_message || 'Hi! How can I help you today?',
          business_context: data.business_context || '',
          industry_template:
            (data.industry_template as IndustryTemplate | null) || '',
          is_active: data.is_active,
          primary_color: data.primary_color || '#2563eb',
        });
      } else {
        setForm({
          welcome_message: 'Hi! How can I help you today?',
          business_context: '',
          industry_template: '',
          is_active: false,
          primary_color: '#2563eb',
        });
      }
    } catch (err: any) {
      console.error('Error loading chatbot config:', err);
      setError(err.message || 'Failed to load chatbot configuration.');
    } finally {
      setConfigLoading(false);
    }
  }

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    loadConfig(clientId);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        client_id: selectedClientId,
        welcome_message: form.welcome_message,
        business_context: form.business_context || null,
        industry_template: form.industry_template || null,
        is_active: form.is_active,
        primary_color: form.primary_color || '#2563eb',
      };

      const { data, error: upsertError } = await supabase
        .from('chatbot_configs')
        .upsert(payload, { onConflict: 'client_id' })
        .select()
        .maybeSingle();

      if (upsertError) throw upsertError;
      setConfig(data as ChatbotConfig);
      toast({
        title: 'Chatbot configuration saved',
        description: 'Your chatbot settings have been updated.',
      });
    } catch (err: any) {
      console.error('Error saving chatbot config:', err);
      setError(err.message || 'Failed to save chatbot configuration.');
      toast({
        title: 'Failed to save chatbot',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) || null;

  const embedCode = `<script>
  (function() {
    var w = window;
    w.agencyKitChatbotConfig = {
      clientId: '${selectedClientId || '<CLIENT_ID>'}',
      primaryColor: '${form.primary_color}',
    };
    var s = document.createElement('script');
    s.src = 'https://example.com/chat-widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">AI Chatbots</h1>
          <p className="text-gray-400">
            Configure AI chat widgets for each client website.
          </p>
        </div>
        <div className="min-w-[220px]">
          <Label className="mb-1 block text-gray-300">Client Business</Label>
          <Select
            value={selectedClientId}
            onValueChange={handleClientChange}
            disabled={loading || clients.length === 0}
          >
            <SelectTrigger className="border-gray-800 bg-gray-900 text-white">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent className="border-gray-800 bg-gray-900">
              {clients.map((client) => (
                <SelectItem
                  key={client.id}
                  value={client.id}
                  className="text-white"
                >
                  {client.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <Skeleton className="h-6 w-40 bg-gray-800" />
              <Skeleton className="mt-2 h-4 w-72 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-14 w-full bg-gray-800" />
              <Skeleton className="h-10 w-full bg-gray-800" />
              <Skeleton className="h-28 w-full bg-gray-800" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-10 w-full bg-gray-800" />
                <Skeleton className="h-10 w-full bg-gray-800" />
              </div>
              <Skeleton className="h-10 w-40 bg-gray-800" />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5">
              <CardHeader>
                <Skeleton className="h-6 w-48 bg-gray-800" />
                <Skeleton className="mt-2 h-4 w-64 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full bg-gray-800" />
              </CardContent>
            </Card>
            <Card className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5">
              <CardHeader>
                <Skeleton className="h-6 w-36 bg-gray-800" />
                <Skeleton className="mt-2 h-4 w-72 bg-gray-800" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-36 w-full bg-gray-800" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : !selectedClient ? (
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="py-12 text-center text-gray-400">
            No clients yet. Add your first client to get started with chatbots.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Configuration</CardTitle>
              <CardDescription className="text-gray-400">
                Customize how the chatbot greets visitors and understands the
                business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading client configuration...
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="flex items-center justify-between gap-4 rounded-md border border-gray-800 bg-gray-950 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Chatbot Status
                      </p>
                      <p className="text-xs text-gray-400">
                        Toggle to enable or disable the widget on the client
                        site.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={form.is_active}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, is_active: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcome_message" className="text-gray-300">
                      Welcome Message
                    </Label>
                    <Input
                      id="welcome_message"
                      value={form.welcome_message}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          welcome_message: e.target.value,
                        }))
                      }
                      className="bg-gray-800 text-white border-gray-700 transition-colors duration-200 focus:border-gray-600"
                      placeholder="Hi! How can I help you today?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_context" className="text-gray-300">
                      Business Context
                    </Label>
                    <Textarea
                      id="business_context"
                      value={form.business_context}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          business_context: e.target.value,
                        }))
                      }
                      className="min-h-[120px] bg-gray-800 text-white border-gray-700 transition-colors duration-200 focus:border-gray-600"
                      placeholder="Describe the services, pricing, and FAQs for this business so the chatbot can answer accurately."
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Industry Template
                      </Label>
                      <Select
                        value={form.industry_template}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            industry_template: value as IndustryTemplate,
                          }))
                        }
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800">
                          {INDUSTRY_TEMPLATES.map((template) => (
                            <SelectItem
                              key={template}
                              value={template}
                              className="text-white"
                            >
                              {template}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        'Save Configuration'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Chat Widget Preview</CardTitle>
                <CardDescription className="text-gray-400">
                  See how the widget will look on your client&apos;s website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-80 items-end justify-end rounded-lg border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-4">
                  <div className="w-72 rounded-xl bg-white text-gray-900 shadow-xl">
                    <div
                      className="flex items-center justify-between rounded-t-xl px-4 py-3 text-sm font-semibold text-white"
                      style={{ backgroundColor: form.primary_color }}
                    >
                      <span>
                        {selectedClient?.business_name || 'Your Business'}
                      </span>
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="space-y-3 px-4 py-3 text-sm">
                      <div className="rounded-lg bg-gray-100 px-3 py-2 text-gray-800">
                        {form.welcome_message}
                      </div>
                      <div className="text-xs text-gray-500">
                        Powered by your white-label AI agency
                      </div>
                    </div>
                    <div className="border-t px-3 py-2">
                      <div className="h-8 rounded-md border border-gray-300 bg-gray-50 px-2 text-xs text-gray-500 flex items-center">
                        Type your message...
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Embed Code</CardTitle>
                <CardDescription className="text-gray-400">
                  Paste this snippet before the closing{' '}
                  <code className="rounded bg-gray-800 px-1 py-0.5 text-xs">
                    &lt;/body&gt;
                  </code>{' '}
                  tag on the client&apos;s site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Textarea
                    readOnly
                    value={embedCode}
                    className="min-h-[140px] bg-gray-950 font-mono text-xs text-gray-200 border-gray-800"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="absolute right-3 top-3 bg-gray-800 text-xs text-white hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(embedCode)
                        .catch(() => undefined);
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  The widget automatically uses the configuration you set here
                  based on the client ID.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

