"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, UserCheck, Search } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";

const mockSubscriptions = [
  {
    id: 1,
    user: "John Doe",
    plan: "Basic Plan",
    price: "1670 AED",
    status: "Active",
    start_date: "12-11-2025",
    end_date: "12-11-2026",
  },
  {
    id: 2,
    user: "Sarah Lee",
    plan: "Standard Plan",
    price: "2500 AED",
    status: "Completed",
    start_date: "01-01-2025",
    end_date: "01-01-2026",
  },
];

export default function AdminSubscriptionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const filtered = mockSubscriptions.filter(
    (item) =>
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.plan.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const total = filtered.length;

  const columns = [
    { key: "user", header: "Customer", render: (item: any) => <p>{item.user}</p> },
    { key: "plan", header: "Plan Name", render: (item: any) => <p>{item.plan}</p> },
    { key: "price", header: "Price", render: (item: any) => <p>{item.price}</p> },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge variant={item.status === "Active" ? "default" : "secondary"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "period",
      header: "Duration",
      render: (item: any) => (
        <p className="text-sm text-gray-500">
          {item.start_date} → {item.end_date}
        </p>
      ),
    },
  ];

  return (
    <ContentLayout title="Subscription Bookings">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <CheckCircle className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Active Plans</p>
            <p className="text-lg font-bold">
              {mockSubscriptions.filter((x) => x.status === "Active").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Calendar className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Completed</p>
            <p className="text-lg font-bold">
              {mockSubscriptions.filter((x) => x.status === "Completed").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <UserCheck className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Total Customers</p>
            <p className="text-lg font-bold">{mockSubscriptions.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Clock className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Expiring Soon</p>
            <p className="text-lg font-bold">2</p>
          </div>
        </div>
      </div>

      {/* 🔍 Search bar */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by customer or plan..."
            className="pl-9 pr-4 py-2 border rounded-md w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <ListComponent
        title="Subscription"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/bookings/subscriptions/view/${id}`}
        editRoute={(id) => `/bookings/subscriptions/edit/${id}`}
        deleteEndpoint={(id) => ``}
        statusField="status"
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={total}
        searchQuery={search}
        setSearchQuery={setSearch}
        showStatusToggle={false}
      />
    </ContentLayout>
  );
}
