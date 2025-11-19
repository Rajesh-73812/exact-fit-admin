"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Clock, CheckCircle, ListChecks } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";

// TYPE
type EnquiryItem = {
  id: number;
  fullName: string;
  service: string;
  date: string;
  status: string;
};

const mockEnquiries: EnquiryItem[] = [
  { id: 1, fullName: "Akhil", service: "AC Service", date: "12-11-2025", status: "Pending" },
  { id: 2, fullName: "Rohit", service: "House Cleaning", date: "13-11-2025", status: "Under Review" },
  { id: 3, fullName: "Ramesh", service: "Painting Work", date: "15-11-2025", status: "In Progress" },
];

export default function AdminEnquiryList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = mockEnquiries.filter(
    (x) =>
      x.fullName.toLowerCase().includes(search.toLowerCase()) ||
      x.service.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const columns = [
    { key: "fullName", header: "Customer", render: (i: EnquiryItem) => <p>{i.fullName}</p> },
    { key: "service", header: "Service", render: (i: EnquiryItem) => <p>{i.service}</p> },
    { key: "date", header: "Requested Date", render: (i: EnquiryItem) => <p>{i.date}</p> },
    {
      key: "status",
      header: "Status",
      render: (i: EnquiryItem) => (
        <Badge
          variant={
            i.status === "Pending"
              ? "secondary"
              : i.status === "Under Review"
              ? "outline"
              : i.status === "In Progress"
              ? "default"
              : "destructive"
          }
        >
          {i.status}
        </Badge>
      ),
    },
  ];

  return (
    <ContentLayout title="Enquiries">
      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard icon={<ClipboardList className="text-primary" />} label="Pending" count={mockEnquiries.filter(x => x.status === "Pending").length} />
        <SummaryCard icon={<Clock className="text-orange-500" />} label="Under Review" count={mockEnquiries.filter(x => x.status === "Under Review").length} />
        <SummaryCard icon={<CheckCircle className="text-green-600" />} label="In Progress" count={mockEnquiries.filter(x => x.status === "In Progress").length} />
        <SummaryCard icon={<ListChecks className="text-gray-600" />} label="Total" count={mockEnquiries.length} />
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by customer or service..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <ListComponent
        title="Enquiries"
        data={paginated}
        columns={columns}
        isLoading={false}
        viewRoute={(id) => `/bookings/enquiry/view/${id}`}
        editRoute={(id) => `/bookings/enquiry/edit/${id}`}
        deleteEndpoint={() => ""}
        statusField="status"
        showStatusToggle={false}
        currentPage={page}
        setCurrentPage={setPage}
        itemsPerPage={limit}
        setItemsPerPage={setLimit}
        totalItems={filtered.length}
        searchQuery={search}
        setSearchQuery={setSearch}
      />
    </ContentLayout>
  );
}

// Summary Card Component
function SummaryCard({ icon, label, count }: any) {
  return (
    <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-3 items-center">
      {icon}
      <div>
        <p className="text-xs font-semibold text-gray-600">{label}</p>
        <p className="text-lg font-bold">{count}</p>
      </div>
    </div>
  );
}
