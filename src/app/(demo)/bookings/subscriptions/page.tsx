'use client';

import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, Calendar, UserCheck, Clock } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";

interface ScheduledVisit {
  subservice_id: string;
  address_id: string;
  scheduled_date: string;
  actual_date: string | null;
  status: string;
  visit_number: number;
}

interface ServiceVisit {
  service_name?: string;
  service_description?: string;
  visit_count: number;
  scheduled_visits: ScheduledVisit[];
}

interface Subscription {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  price_total: number;
  payment_option: string;
  payment_status: string;
  subscriptionType: "plan" | "custom";
  subscriptionPlanName?: string | null;
  subscriptionPlanDescription?: string | null;
  visits?: ServiceVisit[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    limit: number;
    offset: number;
    subscriptions: Subscription[];
  };
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await apiClient.get<ApiResponse>(
        `/booking/V1/get-all-subscription-booking?limit=${limit}&offset=${offset}&search=${encodeURIComponent(search)}`
      );

      if (response.data.success) {
        setSubscriptions(response.data.data.subscriptions || []);
        setTotal(response.data.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      alert("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [page, limit, search]);

  // Summary counts
  const activeCount = subscriptions.filter(s => s.status === "active").length;
  const pendingPaymentCount = subscriptions.filter(s => s.payment_status === "pending").length;
  const totalScheduledVisits = subscriptions.reduce((acc, sub) => {
    if (!sub.visits || !Array.isArray(sub.visits)) return acc;
    return acc + sub.visits.reduce((sum, v) => sum + (v.scheduled_visits?.length || 0), 0);
  }, 0);

  const totalServiceVisits = subscriptions.reduce((acc, sub) => {
    if (!sub.visits || !Array.isArray(sub.visits)) return acc;
    return acc + sub.visits.reduce((sum, v) => sum + v.visit_count, 0);
  }, 0);

  // Table columns
  const columns = [
    {
      key: "planName",
      header: "Plan Name",
      render: (item: Subscription) => (
        <p className="font-medium">
          {item.subscriptionType === "plan" 
            ? item.subscriptionPlanName || "Unnamed Plan"
            : "Custom Subscription"}
        </p>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (item: Subscription) => (
        <p className="font-semibold">AED {item.price_total}</p>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      render: (item: Subscription) => (
        <div>
          <p className="text-sm">{item.start_date} → {item.end_date}</p>
          <p className="text-xs text-gray-500 capitalize">{item.payment_option}</p>
        </div>
      ),
    },
    {
      key: "visits",
      header: "Visits",
      render: (item: Subscription) => {
        const count = item.visits?.reduce((acc, v) => acc + v.visit_count, 0) || 0;
        return <p className="font-medium">{count} scheduled</p>;
      },
    },
    {
      key: "status",
      header: "Status",
      render: (item: Subscription) => (
        <Badge variant={item.status === "active" ? "default" : "secondary"}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (item: Subscription) => (
        <Badge variant={item.payment_status === "paid" ? "default" : item.payment_status === "pending" ? "outline" : "destructive"}>
          {item.payment_status.charAt(0).toUpperCase() + item.payment_status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Subscription Bookings">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<CheckCircle className="w-8 h-8 text-green-600" />} label="Active" count={activeCount} />
        <SummaryCard icon={<Calendar className="w-8 h-8 text-blue-600" />} label="Total Subscriptions" count={total} />
        <SummaryCard icon={<UserCheck className="w-8 h-8 text-purple-600" />} label="Pending Payment" count={pendingPaymentCount} />
        <SummaryCard icon={<Clock className="w-8 h-8 text-orange-600" />} label="Total Visits" count={totalScheduledVisits} />
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md mb-6">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search by plan name or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <ListComponent
        title="Subscriptions"
        data={subscriptions}
        columns={columns}
        isLoading={loading}
        viewRoute={(id) => `/bookings/subscriptions/view/${id}`}
        editRoute={(id) => `/bookings/subscriptions/edit/${id}`}
        deleteEndpoint={() => ""}
        statusField="status"
        showStatusToggle={false}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={total}
        searchQuery={search}
        setSearchQuery={setSearch}
      />
    </ContentLayout>
  );
}

// Reusable Summary Card
function SummaryCard({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </div>
  );
}