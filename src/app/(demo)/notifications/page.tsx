'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ContentLayout } from '@/components/admin-panel/content-layout';
import ListComponent from '@/components/ListComponent';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import CustomModal from '@/components/CustomModal';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Technician {
  id: string;
  fullname: string;
  mobile: string;
  service_type: 'general' | 'emergency' | null;
}

interface Customer {
  id: string;
  fullname: string | null;
  mobile: string;
  email: string | null;
}

interface SentNotification {
  id: string;
  title: string;
  message?: string;
  description?: string;
  recipient_type: 'technician' | 'customer';
  recipient_count: number;
  createdAt: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'technician' | 'customer'>('technician');

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  // Recipients Data (Server-side Pagination)
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [techTotal, setTechTotal] = useState(0);
  const [custTotal, setCustTotal] = useState(0);
  const [techPage, setTechPage] = useState(1);
  const [custPage, setCustPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [techFilter, setTechFilter] = useState<'all' | 'general' | 'emergency'>('all');

  // Selection
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);

  // History
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Fetch Technicians with pagination + filter
  const fetchTechnicians = async () => {
    try {
      const res = await apiClient.get('/technicians/V1/get-all', {
        params: {
          page: techPage,
          limit: itemsPerPage,
          service_type: techFilter === 'all' ? undefined : techFilter,
        },
      });
      setTechnicians(res.data.data.rows || []);
      setTechTotal(res.data.data.count || 0);
    } catch (err) {
      toast.error('Failed to load technicians');
    }
  };

  // Fetch Customers with pagination
  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/auth/V1/get-all-customers', {
        params: { page: custPage, limit: itemsPerPage },
      });
      setCustomers(res.data.data.rows || []);
      setCustTotal(res.data.data.count || 0);
    } catch (err) {
      toast.error('Failed to load customers');
    }
  };

  // Fetch History
  const fetchSentNotifications = async () => {
    try {
      const res = await apiClient.get('/auth/V1/get-all-notification', {
        params: { page: historyPage, limit: 10, search: searchQuery || undefined },
      });
      setSentNotifications(res.data.data || []);
      setTotal(res.data.pagination?.totalItems || 0);
    } catch (err) {
      toast.error('Failed to load history');
    }
  };

  useEffect(() => {
    if (activeTab === 'technician') fetchTechnicians();
    if (activeTab === 'customer') fetchCustomers();
    fetchSentNotifications();
  }, [activeTab, techPage, custPage, techFilter, historyPage, searchQuery]);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Select All on current page (FIXED)
  const selectAllTechnicians = (checked: boolean) => {
    if (checked) {
      const allIds = technicians.map(t => t.id);
      setSelectedTechnicianIds(prev => [...new Set([...prev, ...allIds])]);
    } else {
      setSelectedTechnicianIds(prev => prev.filter(id => !technicians.some(t => t.id === id)));
    }
  };

  const selectAllCustomers = (checked: boolean) => {
    if (checked) {
      const allIds = customers.map(c => c.id);
      setSelectedCustomerIds(prev => [...new Set([...prev, ...allIds])]);
    } else {
      setSelectedCustomerIds(prev => prev.filter(id => !customers.some(c => c.id === id)));
    }
  };

  const handleSendNotification = async () => {
    
    if (!title.trim()) return toast.error('Title is required');
    if (message.trim().length < 5) return toast.error('Message must be at least 5 characters');
    alert(3)
    const recipientIds = activeTab === 'technician' ? selectedTechnicianIds : selectedCustomerIds;
    if (recipientIds.length === 0) return toast.error('Select at least one recipient');

    setSending(true);
    try {
      alert(1)
      await apiClient.post('/auth/V1/sent-notification', {
        title,
        message,
        schedule_start: scheduleDate || null,
        userIds: activeTab === 'customer' ? recipientIds : [],
        TechnicianIds: activeTab === 'technician' ? recipientIds : [],
      });
      toast.success('Sent successfully!');
      setTitle('');
      setMessage('');
      setScheduleDate('');
      setSelectedTechnicianIds([]);
      setSelectedCustomerIds([]);
      fetchSentNotifications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteId) return;
    try {
      await apiClient.delete(`/auth/V1/delete-notification/${deleteId}`);
      toast.success('Deleted');
      fetchSentNotifications();
    } catch {
      toast.error('Failed');
    } finally {
      setDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'title', header: 'Title', render: (n: any) => <span className="font-medium">{n.title}</span> },
    { key: 'description', header: 'Message', render: (n: any) => <span className="max-w-md truncate block">{n.description || n.message}</span> },
    // { key: 'recipient_type', header: 'Sent To', render: (n: any) => <span className="capitalize">{n.recipient_type}s ({n.recipient_count})</span> },
    { key: 'createdAt', header: 'Sent On', render: (n: any) => format(new Date(n.createdAt), 'dd MMM yyyy, hh:mm a') },
  ];

  return (
    <ContentLayout title="Send Notifications">
      <div className="space-y-8">

        <Card>
          <CardHeader><CardTitle>Send New Notification</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
                </div>
                <div>
                  <Label>Message * (min 5 chars)</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-2 resize-none" />
                  <p className={`text-xs mt-1 ${message.length < 5 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {message.length}/500
                  </p>
                </div>
                <div>
                  <Label>Schedule (Optional)</Label>
                  <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="mt-2" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Selected: <strong className="font-bold text-foreground">
                      {activeTab === 'technician' ? selectedTechnicianIds.length : selectedCustomerIds.length}
                    </strong> {activeTab}s
                  </p>
                  <Button onClick={handleSendNotification} disabled={sending || !title.trim() || message.length < 5}>
                    {sending ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending... </> : 'Send Notification'}
                  </Button>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="technician">Technicians ({techTotal})</TabsTrigger>
                    <TabsTrigger value="customer">Customers ({custTotal})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="technician" className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {(['all', 'general', 'emergency'] as const).map(f => (
                        <Button key={f} variant={techFilter === f ? 'default' : 'outline'} size="sm"
                          onClick={() => { setTechFilter(f); setTechPage(1); }}>
                          {f.charAt(0).toUpperCase() + f.slice(1)} (
                          {f === 'all' ? techTotal : technicians.filter(t => t.service_type === f).length})
                        </Button>
                      ))}
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={technicians.length > 0 && technicians.every(t => selectedTechnicianIds.includes(t.id))}
                                onCheckedChange={selectAllTechnicians}
                              />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {technicians.map(t => (
                            <TableRow key={t.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedTechnicianIds.includes(t.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTechnicianIds(prev => [...prev, t.id]);
                                    } else {
                                      setSelectedTechnicianIds(prev => prev.filter(id => id !== t.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{t.fullname || 'N/A'}</TableCell>
                              <TableCell>{t.mobile}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 text-xs rounded-full ${t.service_type === 'emergency' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {t.service_type || 'General'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {techTotal > itemsPerPage && (
                      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
                        <span className="text-muted-foreground">
                          Showing {(techPage - 1) * itemsPerPage + 1}–{Math.min(techPage * itemsPerPage, techTotal)} of {techTotal}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setTechPage(p => Math.max(1, p - 1))} disabled={techPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{techPage} / {Math.ceil(techTotal / itemsPerPage)}</span>
                          <Button variant="ghost" size="icon" onClick={() => setTechPage(p => p + 1)} disabled={techPage === Math.ceil(techTotal / itemsPerPage)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="customer" className="space-y-4">
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <Checkbox
                                checked={customers.length > 0 && customers.every(c => selectedCustomerIds.includes(c.id))}
                                onCheckedChange={selectAllCustomers}
                              />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map(c => (
                            <TableRow key={c.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedCustomerIds.includes(c.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCustomerIds(prev => [...prev, c.id]);
                                    } else {
                                      setSelectedCustomerIds(prev => prev.filter(id => id !== c.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{c.fullname || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div>{c.mobile}</div>
                                  <div className="text-muted-foreground">{c.email || '—'}</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {custTotal > itemsPerPage && (
                      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 text-sm">
                        <span className="text-muted-foreground">
                          Showing {(custPage - 1) * itemsPerPage + 1}–{Math.min(custPage * itemsPerPage, custTotal)} of {custTotal}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setCustPage(p => Math.max(1, p - 1))} disabled={custPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{custPage} / {Math.ceil(custTotal / itemsPerPage)}</span>
                          <Button variant="ghost" size="icon" onClick={() => setCustPage(p => p + 1)} disabled={custPage === Math.ceil(custTotal / itemsPerPage)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader><CardTitle>Sent Notifications History</CardTitle></CardHeader>
          <CardContent>
            <ListComponent
              title="Sent Notifications"
              data={sentNotifications}
              columns={columns}
              isLoading={loading}
              currentPage={historyPage}
              setCurrentPage={setHistoryPage}
              itemsPerPage={10}
              setItemsPerPage={() => {}}
              totalItems={total}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusField=""
              showStatusToggle={false}
              addRoute={undefined}
              editRoute={() => ""}
              viewRoute={() => ""}
              onDelete={async (id) => {
                setDeleteId(id);
                setDeleteDialog(true);
              }}
            />
          </CardContent>
        </Card>

        <CustomModal
          isOpen={deleteDialog}
          onRequestClose={() => setDeleteDialog(false)}
          title="Confirm Delete"
          description="Are you sure you want to delete this notification?"
          onConfirm={handleDeleteNotification}
          confirmText="Delete"
        />
      </div>
    </ContentLayout>
  );
}