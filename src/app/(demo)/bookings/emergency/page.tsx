"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, UserCheck, Search } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";

type EmergencyItem = {
  id: number;
  name: string;
  mobile: string;
  emirate: string;
  address: string;
  fullAddress: string;
  category: string;
  service: string;
  description: string;
  status: string;
  technician: string | null;
  date: string;
};

/* Mock Data (Replace with API Data) */
const mockEmergency = [
  {
    id: 1,
    name: "Ameer",
    mobile: "989898989",
    emirate: "Dubai",
    address: "Home",
    fullAddress: "7B Spice Road, Banjara Hills, Hyderabad",
    category: "Residential",
    service: "AC Repair",
    description: "AC stopped working",
    status: "Active",
    technician: null,
    date: "12-11-2025",
  },
  {
    id: 2,
    name: "Imran",
    mobile: "987654321",
    emirate: "Dubai",
    address: "Work",
    fullAddress: "Bur Dubai",
    category: "Commercial",
    service: "Electrical Repair",
    description: "Short circuit issue",
    status: "In Progress",
    technician: "James",
    date: "10-11-2025",
  },
];

export default function AdminEmergencyList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  /* FILTER */
  const filtered = mockEmergency.filter(
    (x) =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.service.toLowerCase().includes(search.toLowerCase())
  );

  /* PAGINATION */
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  /* TABLE COLUMNS */
 const columns = [
  {
    key: "name",
    header: "Customer",
    render: (i: EmergencyItem) => <p>{i.name}</p>,
  },
  {
    key: "service",
    header: "Service",
    render: (i: EmergencyItem) => <p>{i.service}</p>,
  },
  {
    key: "date",
    header: "Date",
    render: (i: EmergencyItem) => <p>{i.date}</p>,
  },
  {
    key: "status",
    header: "Status",
    render: (i: EmergencyItem) => (
      <Badge
        variant={
          i.status === "Active"
            ? "default"
            : i.status === "In Progress"
            ? "secondary"
            : "destructive"
        }
      >
        {i.status}
      </Badge>
    ),
  },
  {
    key: "technician",
    header: "Technician",
    render: (i: EmergencyItem) => (
      <p className="text-sm text-gray-600">{i.technician || "Not Assigned"}</p>
    ),
  },
];


  return (
    <ContentLayout title="Emergency Requests">
      {/* SUMMARY CARDS — EXACT LIKE SUBSCRIPTION UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <AlertTriangle className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Active</p>
            <p className="text-lg font-bold">
              {mockEmergency.filter((x) => x.status === "Active").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Clock className="text-orange-500 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-orange-500">In Progress</p>
            <p className="text-lg font-bold">
              {mockEmergency.filter((x) => x.status === "In Progress").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <CheckCircle className="text-green-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-green-600">Completed</p>
            <p className="text-lg font-bold">
              {mockEmergency.filter((x) => x.status === "Completed").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <UserCheck className="text-gray-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-gray-600">Total</p>
            <p className="text-lg font-bold">{mockEmergency.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR — EXACT LIKE SUBSCRIPTION */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by customer or service..."
            className="pl-9 pr-4 py-2 border rounded-md w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <ListComponent
        title="Emergency"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/bookings/emergency/view/${id}`}
        editRoute={(id) => `/bookings/emergency/edit/${id}`}
        deleteEndpoint={() => ""}
        /* REQUIRED FIELD – FIXES YOUR ERROR */
        statusField="status"
        showStatusToggle={false}
        /* PAGINATION */
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={filtered.length}
        /* SEARCH */
        searchQuery={search}
        setSearchQuery={setSearch}
      />
    </ContentLayout>
  );
}