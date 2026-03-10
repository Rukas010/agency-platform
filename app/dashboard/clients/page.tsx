'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, CreditCard as Edit, Trash2, Building2, Mail, Phone, Globe } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getReseller } from '@/lib/auth';
import type { Client } from '@/lib/supabase';

const businessTypes = [
  'Dentist',
  'Plumber',
  'Restaurant',
  'Law Firm',
  'Auto Repair',
  'Salon',
  'Real Estate',
  'Other',
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [resellerId, setResellerId] = useState<string>('');
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    google_review_link: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter(
        (client) =>
          client.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.business_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  async function loadClients() {
    try {
      const reseller = await getReseller();
      if (!reseller) return;

      setResellerId(reseller.id);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('reseller_id', reseller.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }

  function openAddDialog() {
    setEditingClient(null);
    setFormData({
      business_name: '',
      business_type: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      google_review_link: '',
    });
    setDialogOpen(true);
  }

  function openEditDialog(client: Client) {
    setEditingClient(client);
    setFormData({
      business_name: client.business_name,
      business_type: client.business_type,
      phone: client.phone || '',
      email: client.email || '',
      website: client.website || '',
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      google_review_link: client.google_review_link || '',
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([{ ...formData, reseller_id: resellerId }]);

        if (error) throw error;
      }

      setDialogOpen(false);
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) throw error;
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  }

  return (
    <div className="p-6 lg:p-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">Manage your client businesses</p>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 transition-colors duration-200 focus:border-gray-700"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <Skeleton className="h-5 w-40 bg-gray-800" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-24 bg-gray-800" />
                <Skeleton className="h-4 w-52 bg-gray-800" />
                <Skeleton className="h-4 w-40 bg-gray-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No clients yet</h3>
            <p className="text-gray-400 mb-6">
              No clients yet. Add your first client to get started.
            </p>
            <Button
              onClick={openAddDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="bg-gray-900 border-gray-800 transition-all duration-200 hover:border-gray-700 hover:-translate-y-0.5"
            >
              <CardHeader>
                <CardTitle className="text-white flex items-start justify-between">
                  <span className="flex-1">{client.business_name}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(client)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(client.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="inline-block px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-md">
                  {client.business_type}
                </div>
                {client.email && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                )}
                {client.website && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Globe className="h-4 w-4 mr-2" />
                    {client.website}
                  </div>
                )}
                {client.city && client.state && (
                  <div className="text-sm text-gray-400">
                    {client.city}, {client.state}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingClient
                ? 'Update client business information'
                : 'Add a new client business to your agency'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name" className="text-gray-300">
                  Business Name *
                </Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type" className="text-gray-300">
                  Business Type *
                </Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, business_type: value })
                  }
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {businessTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-gray-300">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-300">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-300">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_review_link" className="text-gray-300">
                Google Review Link
              </Label>
              <Input
                id="google_review_link"
                type="url"
                value={formData.google_review_link}
                onChange={(e) =>
                  setFormData({ ...formData, google_review_link: e.target.value })
                }
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="https://g.page/..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingClient ? 'Update Client' : 'Add Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
