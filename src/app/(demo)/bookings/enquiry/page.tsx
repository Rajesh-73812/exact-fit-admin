"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ClipboardList, User } from "lucide-react";
import ListComponent from "@/components/ListComponent";

const mockEnquiries = [
  {
    id: 1,
    user: "Mark Taylor",
    title: "House Cleaning Enquiry",
    date: "12-11-2025",
    status: "Under Review",
  },
  {
    id: 2,
    user: "Emily Davis",
    title: "Gardening Service Enquiry",
    date: "11-11-2025",
    status: "In Progress",
  },
];

export default function AdminEnquiryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const filtered = mockEnquiries.filter(
    (item) =>
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const total = filtered.length;

  const columns = [
    { key: "user", header: "Customer", render: (item: any) => <p>{item.user}</p> },
    { key: "title", header: "Enquiry", render: (item: any) => <p>{item.title}</p> },
    { key: "date", header: "Date", render: (item: any) => <p>{item.date}</p> },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <Badge
          variant={
            item.status === "Under Review"
              ? "secondary"
              : item.status === "In Progress"
              ? "default"
              : "destructive"
          }
        >
          {item.status}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Enquiry Bookings">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <User className="text-blue-600 w-6 h-6" />
          <div>
            <p className="text-xs text-blue-600 font-semibold">Total Enquiries</p>
            <p className="text-lg font-bold">{mockEnquiries.length}</p>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <MessageSquare className="text-green-600 w-6 h-6" />
          <div>
            <p className="text-xs text-green-600 font-semibold">In Progress</p>
            <p className="text-lg font-bold">
              {mockEnquiries.filter((x) => x.status === "In Progress").length}
            </p>
          </div>
        </div>
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <ClipboardList className="text-purple-600 w-6 h-6" />
          <div>
            <p className="text-xs text-purple-600 font-semibold">Under Review</p>
            <p className="text-lg font-bold">
              {mockEnquiries.filter((x) => x.status === "Under Review").length}
            </p>
          </div>
        </div>
      </div>

      <ListComponent
        title="Enquiry"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/admin/bookings/enquiry/${id}`}
         editRoute={() => ""}              // 👈 add this (dummy placeholder)
  deleteEndpoint={() => ""}                 // 👈 add this (empty string)
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
