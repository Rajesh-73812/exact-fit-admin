"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Wrench, Clock } from "lucide-react";
import ListComponent from "@/components/ListComponent";

const mockEmergency = [
  {
    id: 1,
    user: "David Warner",
    title: "AC Repair",
    date: "12-11-2025",
    status: "In Progress",
    description: "Air conditioner stopped working suddenly.",
  },
  {
    id: 2,
    user: "Lisa White",
    title: "Plumbing Leak",
    date: "10-11-2025",
    status: "Active",
    description: "Pipe burst in the kitchen.",
  },
];

export default function AdminEmergencyPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const filtered = mockEmergency.filter(
    (item) =>
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const total = filtered.length;

  const columns = [
    {
      key: "user",
      header: "Customer",
      render: (item: any) => <p>{item.user}</p>,
    },
    {
      key: "title",
      header: "Service",
      render: (item: any) => <p>{item.title}</p>,
    },
    { key: "date", header: "Date", render: (item: any) => <p>{item.date}</p> },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge
          variant={
            item.status === "Active"
              ? "default"
              : item.status === "In Progress"
              ? "secondary"
              : "destructive"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item: any) => (
        <p className="text-sm text-gray-500 truncate w-56">
          {item.description}
        </p>
      ),
    },
  ];

  return (
    <ContentLayout title="Emergency Bookings">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <AlertTriangle className="text-red-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-red-600">Active</p>
            <p className="text-lg font-bold">
              {mockEmergency.filter((x) => x.status === "Active").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Shield className="text-blue-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-blue-600">In Progress</p>
            <p className="text-lg font-bold">
              {mockEmergency.filter((x) => x.status === "In Progress").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Wrench className="text-green-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-green-600">Completed</p>
            <p className="text-lg font-bold">0</p>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Clock className="text-gray-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-gray-600">Total</p>
            <p className="text-lg font-bold">{mockEmergency.length}</p>
          </div>
        </div>
      </div>

      <ListComponent
        title="Emergency"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/admin/bookings/emergency/${id}`}
        editRoute={() => ""} // 👈 add this (dummy placeholder)
        deleteEndpoint={() => ""} // 👈 add this (empty string)
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
