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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase, type Client, type ReviewCampaign, type Contact } from '@/lib/supabase';
import { getReseller } from '@/lib/auth';
import {
  Plus,
  Loader2,
  Mail,
  Phone,
  User,
  Sparkles,
  Send,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CampaignFormState = {
  campaign_name: string;
  message_template: string;
  follow_up_template: string;
  follow_up_days: number;
};

type ContactFormState = {
  name: string;
  phone: string;
  email: string;
};

type CampaignContactWithContact = {
  id: string;
  campaign_id: string;
  contact_id: string;
  added_at: string;
  contact: Contact;
};

export default function ReviewsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<ReviewCampaign[]>([]);
  const [campaignContactsByCampaign, setCampaignContactsByCampaign] = useState<
    Record<string, CampaignContactWithContact[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CampaignFormState>({
    campaign_name: '',
    message_template:
      'Hi {name}, this is {business_name}. Would you mind leaving us a quick review? {review_link}',
    follow_up_template:
      'Hi {name}, just a friendly reminder from {business_name} to leave a quick review when you have a moment. {review_link}',
    follow_up_days: 3,
  });
  const [contactFormByCampaign, setContactFormByCampaign] = useState<
    Record<string, ContactFormState>
  >({});
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function initialize() {
      try {
        setError(null);
        const reseller = await getReseller();
        if (!reseller) {
          setError('You must be signed in to manage review campaigns.');
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
          await loadCampaigns(firstId);
        }
      } catch (err: any) {
        console.error('Error initializing review campaigns:', err);
        setError(err.message || 'Failed to load review campaigns.');
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  async function loadCampaigns(clientId: string) {
    try {
      setCampaignsLoading(true);
      setError(null);

      const { data, error: campaignsError } = await supabase
        .from('review_campaigns')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;
      const list = data ?? [];
      setCampaigns(list);

      const campaignIds = list.map((c) => c.id);
      await loadCampaignContacts(campaignIds);
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns.');
    } finally {
      setCampaignsLoading(false);
    }
  }

  async function loadCampaignContacts(campaignIds: string[]) {
    if (!campaignIds.length) {
      setCampaignContactsByCampaign({});
      return;
    }
    try {
      setContactsLoading(true);
      setError(null);

      const { data, error: contactsError } = await supabase
        .from('campaign_contacts')
        .select('id, campaign_id, contact_id, added_at, contacts(*)')
        .in('campaign_id', campaignIds)
        .order('added_at', { ascending: false });

      if (contactsError) throw contactsError;

      const byCampaign: Record<string, CampaignContactWithContact[]> = {};

      (data ?? []).forEach((row: any) => {
        if (!row.contacts) return;
        const cc: CampaignContactWithContact = {
          id: row.id,
          campaign_id: row.campaign_id,
          contact_id: row.contact_id,
          added_at: row.added_at,
          contact: row.contacts as Contact,
        };
        if (!byCampaign[cc.campaign_id]) {
          byCampaign[cc.campaign_id] = [];
        }
        byCampaign[cc.campaign_id].push(cc);
      });

      setCampaignContactsByCampaign(byCampaign);
    } catch (err: any) {
      console.error('Error loading campaign contacts:', err);
      setError(err.message || 'Failed to load contacts.');
    } finally {
      setContactsLoading(false);
    }
  }

  function handleClientChange(clientId: string) {
    setSelectedClientId(clientId);
    loadCampaigns(clientId);
  }

  function openCampaignDialog() {
    setCampaignForm({
      campaign_name: '',
      message_template:
        'Hi {name}, this is {business_name}. Would you mind leaving us a quick review? {review_link}',
      follow_up_template:
        'Hi {name}, just a friendly reminder from {business_name} to leave a quick review when you have a moment. {review_link}',
      follow_up_days: 3,
    });
    setCampaignDialogOpen(true);
  }

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClientId) return;

    try {
      setCreatingCampaign(true);
      setError(null);

      const { error: insertError } = await supabase.from('review_campaigns').insert([
        {
          client_id: selectedClientId,
          campaign_name: campaignForm.campaign_name,
          message_template: campaignForm.message_template,
          follow_up_template: campaignForm.follow_up_template,
          follow_up_days: campaignForm.follow_up_days,
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      setCampaignDialogOpen(false);
      await loadCampaigns(selectedClientId);
      toast({
        title: 'Campaign created',
        description: 'Your review campaign has been created successfully.',
      });
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign.');
      toast({
        title: 'Failed to create campaign',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingCampaign(false);
    }
  }

  function getContactForm(campaignId: string): ContactFormState {
    return (
      contactFormByCampaign[campaignId] || {
        name: '',
        phone: '',
        email: '',
      }
    );
  }

  function updateContactForm(campaignId: string, updates: Partial<ContactFormState>) {
    setContactFormByCampaign((prev) => ({
      ...prev,
      [campaignId]: { ...getContactForm(campaignId), ...updates },
    }));
  }

  async function handleAddContact(
    e: React.FormEvent,
    campaign: ReviewCampaign
  ) {
    e.preventDefault();
    const form = getContactForm(campaign.id);
    if (!form.name || (!form.email && !form.phone)) return;

    try {
      setError(null);
      const { data: existingContacts, error: findError } = await supabase
        .from('contacts')
        .select('*')
        .eq('client_id', campaign.client_id)
        .or(
          [
            form.phone ? `phone.eq.${form.phone}` : '',
            form.email ? `email.eq.${form.email}` : '',
          ]
            .filter(Boolean)
            .join(',')
        );

      if (findError) throw findError;

      let contactId: string | null = null;

      if (existingContacts && existingContacts.length > 0) {
        contactId = existingContacts[0].id;
      } else {
        const { data: insertedContacts, error: insertError } = await supabase
          .from('contacts')
          .insert([
            {
              client_id: campaign.client_id,
              name: form.name,
              phone: form.phone || null,
              email: form.email || null,
            },
          ])
          .select('*');

        if (insertError || !insertedContacts || !insertedContacts.length) {
          throw insertError || new Error('Failed to insert contact');
        }

        contactId = insertedContacts[0].id;
      }

      if (!contactId) {
        throw new Error('No contact ID resolved when adding contact');
      }

      const { error: linkError } = await supabase
        .from('campaign_contacts')
        .insert([
          {
            campaign_id: campaign.id,
            contact_id: contactId,
          },
        ]);

      if (linkError) throw linkError;

      updateContactForm(campaign.id, { name: '', phone: '', email: '' });
      await loadCampaignContacts([campaign.id]);
    } catch (err: any) {
      console.error('Error adding contact:', err);
      setError(err.message || 'Failed to add contact.');
      toast({
        title: 'Failed to add contact',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function handleSendRequests(campaign: ReviewCampaign) {
    const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

    if (!selectedClient?.google_review_link) {
      toast({
        title: 'Missing review link',
        description:
          "This client doesn't have a Google Review link configured. Update it on the Clients page first.",
        variant: 'destructive',
      });
      return;
    }

    const campaignContacts = campaignContactsByCampaign[campaign.id] ?? [];

    const eligibleContacts = campaignContacts.filter(
      (cc) =>
        !cc.contact.review_requested &&
        cc.contact.phone &&
        cc.contact.phone.trim() !== ''
    );

    if (eligibleContacts.length === 0) {
      toast({
        title: 'No new contacts',
        description: 'No new contacts to send to. Add contacts with phone numbers first.',
        variant: 'destructive',
      });
      return;
    }

    const confirmed = window.confirm(
      `Send review requests to ${eligibleContacts.length} contact${eligibleContacts.length > 1 ? 's' : ''} in "${campaign.campaign_name}" via SMS?`
    );
    if (!confirmed) return;

    try {
      setSendingCampaignId(campaign.id);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        toast({
          title: 'Unable to send requests',
          description: 'You must be signed in to send review requests.',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/send-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          campaignId: campaign.id,
          contactIds: eligibleContacts.map((cc) => cc.contact_id),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast({
          title: 'Failed to send review requests',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Review requests sent!',
        description: `${result.sent} review request${result.sent > 1 ? 's' : ''} sent successfully.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`,
      });

      await loadCampaigns(selectedClientId);
    } catch (err: any) {
      console.error('Unexpected error in handleSendRequests:', err);
      toast({
        title: 'Failed to send review requests',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSendingCampaignId(null);
    }
  }

  function getCampaignContactCount(campaignId: string): number {
    return (campaignContactsByCampaign[campaignId] ?? []).length;
  }

  function getCampaignEligibleCount(campaignId: string): number {
    return (campaignContactsByCampaign[campaignId] ?? []).filter(
      (cc) =>
        !cc.contact.review_requested &&
        cc.contact.phone &&
        cc.contact.phone.trim() !== ''
    ).length;
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Review Campaigns</h1>
          <p className="text-gray-400">
            Automate Google review requests for your client businesses.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-[220px]">
            <Label className="mb-1 block text-gray-300">Client Business</Label>
            <Select
              value={selectedClientId}
              onValueChange={handleClientChange}
              disabled={loading || clients.length === 0}
            >
              <SelectTrigger className="bg-gray-900 text-white border-gray-800">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
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
          <Button
            onClick={openCampaignDialog}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={!selectedClientId}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <Skeleton className="h-6 w-48 bg-gray-800" />
              <Skeleton className="mt-2 h-4 w-64 bg-gray-800" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-800 bg-gray-950 p-4"
                >
                  <Skeleton className="h-5 w-56 bg-gray-800" />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                    <Skeleton className="h-4 w-full bg-gray-800" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <Skeleton className="h-6 w-44 bg-gray-800" />
              <Skeleton className="mt-2 h-4 w-72 bg-gray-800" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                  <Skeleton className="mt-2 h-8 w-16 bg-gray-800" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : !selectedClient ? (
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="py-12 text-center text-gray-400">
            No clients yet. Add your first client to get started with review campaigns.
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedClient && !selectedClient.google_review_link && (
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
              <span className="text-lg leading-none">⚠️</span>
              <div className="text-xs text-amber-300">
                This client doesn&apos;t have a Google Review link configured. Go to the
                Clients page to add one before sending requests.
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-gray-400">
              Campaigns for{' '}
              <span className="font-semibold text-white">
                {selectedClient.business_name}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Campaign list */}
            <div className="space-y-4">
              {campaignsLoading ? (
                <Card className="border-gray-800 bg-gray-900">
                  <CardContent className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-gray-800 bg-gray-950 p-4"
                      >
                        <Skeleton className="h-5 w-56 bg-gray-800" />
                        <Skeleton className="mt-3 h-4 w-40 bg-gray-800" />
                        <Skeleton className="mt-3 h-20 w-full bg-gray-800" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : campaigns.length === 0 ? (
                <Card className="border-gray-800 bg-gray-900">
                  <CardContent className="py-10 text-center">
                    <p className="mb-3 text-white">
                      No campaigns for this client yet.
                    </p>
                    <p className="mb-6 text-sm text-gray-400">
                      Create your first campaign to start sending review requests.
                    </p>
                    <Button
                      onClick={openCampaignDialog}
                      className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Campaign
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => {
                  const contactCount = getCampaignContactCount(campaign.id);
                  const eligibleCount = getCampaignEligibleCount(campaign.id);
                  const isSending = sendingCampaignId === campaign.id;

                  return (
                    <Card
                      key={campaign.id}
                      className="border-gray-800 bg-gray-900 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5"
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0">
                        <div>
                          <CardTitle className="text-white">
                            {campaign.campaign_name}
                          </CardTitle>
                          <CardDescription className="mt-1 flex items-center gap-2 text-gray-400">
                            {campaign.is_active ? (
                              <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-gray-700/40 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                                Inactive
                              </span>
                            )}
                            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                              {contactCount} contact{contactCount !== 1 ? 's' : ''}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="text-right text-xs text-gray-400">
                          <div>Sent: {campaign.total_sent}</div>
                          <div>Clicked: {campaign.total_clicked}</div>
                          <div>Reviewed: {campaign.total_reviews}</div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-md border border-gray-800 bg-gray-950 p-3 text-xs text-gray-300">
                          <div className="mb-1 font-semibold text-gray-200">
                            Initial Message
                          </div>
                          <p className="whitespace-pre-wrap">
                            {campaign.message_template}
                          </p>
                        </div>
                        {campaign.follow_up_template && (
                          <div className="rounded-md border border-gray-800 bg-gray-950 p-3 text-xs text-gray-300">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="font-semibold text-gray-200">
                                Follow-up ({campaign.follow_up_days} days)
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">
                              {campaign.follow_up_template}
                            </p>
                          </div>
                        )}

                        {/* Send button for this campaign */}
                        <Button
                          onClick={() => handleSendRequests(campaign)}
                          disabled={isSending || eligibleCount === 0 || !selectedClient?.google_review_link}
                          className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 transition-colors duration-200"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : eligibleCount === 0 ? (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              No new contacts to send
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Send to {eligibleCount} contact{eligibleCount > 1 ? 's' : ''}
                            </>
                          )}
                        </Button>

                        <div className="pt-2">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Contacts
                          </p>
                          {contactsLoading ? (
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="rounded-md border border-gray-800 bg-gray-950 px-3 py-2"
                                >
                                  <Skeleton className="h-4 w-40 bg-gray-800" />
                                </div>
                              ))}
                            </div>
                          ) : (campaignContactsByCampaign[campaign.id] ?? []).length === 0 ? (
                            <p className="text-sm text-gray-400">
                              No contacts yet. Add your first contact below.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(campaignContactsByCampaign[campaign.id] ?? [])
                                .slice(0, 5)
                                .map((cc) => {
                                  const contact = cc.contact;
                                  return (
                                    <div
                                      key={cc.id}
                                      className="flex items-center justify-between rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-white">
                                          {contact.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-gray-400">
                                        {contact.email && (
                                          <span className="flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {contact.email}
                                          </span>
                                        )}
                                        {contact.phone && (
                                          <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {contact.phone}
                                          </span>
                                        )}
                                        {contact.review_requested && !contact.review_completed && (
                                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                                            Sent
                                          </span>
                                        )}
                                        {contact.review_completed && (
                                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                                            Reviewed
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              {(campaignContactsByCampaign[campaign.id] ?? []).length >
                                5 && (
                                <p className="text-xs text-gray-500">
                                  Showing 5 of{' '}
                                  {(campaignContactsByCampaign[campaign.id] ?? []).length}{' '}
                                  contacts.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <form
                          className="mt-4 space-y-3 rounded-md border border-dashed border-gray-800 bg-gray-950 p-3"
                          onSubmit={(e) => handleAddContact(e, campaign)}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Add Contact
                          </p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-300">
                                Name
                              </Label>
                              <Input
                                value={getContactForm(campaign.id).name}
                                onChange={(e) =>
                                  updateContactForm(campaign.id, {
                                    name: e.target.value,
                                  })
                                }
                                required
                                className="h-8 bg-gray-900 text-white border-gray-800 text-xs"
                                placeholder="Customer name"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-300">
                                Email
                              </Label>
                              <Input
                                type="email"
                                value={getContactForm(campaign.id).email}
                                onChange={(e) =>
                                  updateContactForm(campaign.id, {
                                    email: e.target.value,
                                  })
                                }
                                className="h-8 bg-gray-900 text-white border-gray-800 text-xs"
                                placeholder="name@example.com"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-300">
                                Phone
                              </Label>
                              <Input
                                value={getContactForm(campaign.id).phone}
                                onChange={(e) =>
                                  updateContactForm(campaign.id, {
                                    phone: e.target.value,
                                  })
                                }
                                className="h-8 bg-gray-900 text-white border-gray-800 text-xs"
                                placeholder="+44 7XXX XXXXXX"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                            >
                              Add Contact
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">
                    Campaign Performance
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    High-level metrics across all campaigns for this client.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Campaigns</p>
                    <p className="text-2xl font-semibold text-white">
                      {campaigns.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Contacts</p>
                    <p className="text-2xl font-semibold text-white">
                      {Object.values(campaignContactsByCampaign).reduce(
                        (sum, list) => sum + list.length,
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Sent</p>
                    <p className="text-2xl font-semibold text-white">
                      {campaigns.reduce(
                        (sum, c) => sum + (c.total_sent || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Reviews</p>
                    <p className="text-2xl font-semibold text-white">
                      {campaigns.reduce(
                        (sum, c) => sum + (c.total_reviews || 0),
                        0
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">
                    Template Variables
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-400">
                  <p>
                    Use these in your message templates:
                  </p>
                  <div className="space-y-2 rounded-md border border-gray-800 bg-gray-950 p-3 text-xs font-mono">
                    <p><code className="text-blue-400">{'{name}'}</code> — Customer&apos;s name</p>
                    <p><code className="text-blue-400">{'{customer_name}'}</code> — Same as above</p>
                    <p><code className="text-blue-400">{'{business_name}'}</code> — Client&apos;s business name</p>
                    <p><code className="text-blue-400">{'{review_link}'}</code> — Tracked review link</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="text-white">
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-400">
                  <p>
                    • Keep your message short, friendly, and personalized with
                    variables like <code className="text-blue-400">{'{name}'}</code> and{' '}
                    <code className="text-blue-400">{'{business_name}'}</code>.
                  </p>
                  <p>
                    • Send follow-ups 3–7 days after the initial request for
                    best conversion rates.
                  </p>
                  <p>
                    • Add both phone numbers and emails so you can reach
                    customers on their preferred channel.
                  </p>
                  <p>
                    • Each campaign has its own contact list — use separate
                    campaigns for different promotions or time periods.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}

      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-gray-800 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Create Review Campaign</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure the messaging and follow-up timing for this review
              campaign.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign_name" className="text-gray-300">
                Campaign Name
              </Label>
              <Input
                id="campaign_name"
                value={campaignForm.campaign_name}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    campaign_name: e.target.value,
                  }))
                }
                required
                className="bg-gray-800 text-white border-gray-700"
                placeholder="Google Review Invite"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message_template" className="text-gray-300">
                Message Template
              </Label>
              <Textarea
                id="message_template"
                value={campaignForm.message_template}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    message_template: e.target.value,
                  }))
                }
                required
                className="min-h-[120px] bg-gray-800 text-white border-gray-700"
              />
              <p className="text-xs text-gray-500">
                Use variables: <code className="text-blue-400">{'{name}'}</code>,{' '}
                <code className="text-blue-400">{'{business_name}'}</code>, and{' '}
                <code className="text-blue-400">{'{review_link}'}</code>.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow_up_template" className="text-gray-300">
                Follow-up Template
              </Label>
              <Textarea
                id="follow_up_template"
                value={campaignForm.follow_up_template}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    follow_up_template: e.target.value,
                  }))
                }
                className="min-h-[100px] bg-gray-800 text-white border-gray-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow_up_days" className="text-gray-300">
                Follow-up Days
              </Label>
              <Input
                id="follow_up_days"
                type="number"
                min={1}
                max={30}
                value={campaignForm.follow_up_days}
                onChange={(e) =>
                  setCampaignForm((prev) => ({
                    ...prev,
                    follow_up_days: Number(e.target.value) || 1,
                  }))
                }
                className="w-32 bg-gray-800 text-white border-gray-700"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="text-gray-400 hover:text-white"
                onClick={() => setCampaignDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={creatingCampaign}
              >
                {creatingCampaign ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}