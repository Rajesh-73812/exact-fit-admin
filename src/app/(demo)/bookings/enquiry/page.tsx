"use client";

import { useState, useEffect } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { Search, ClipboardList, Clock, CheckCircle, ListChecks } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";

type EnquiryItem = {
  id: string;
  fullname: string;
  scope_of_work: string | null;
  createdAt: string;
  status: string;
};

export default function AdminEnquiryList() {
  const [data, setData] = useState<EnquiryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit,setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/booking/V1/get-all-enquiry-booking", {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });

      const rows = res.data?.data?.rows || [];
      const totalCount = res.data?.data?.totalCount || 0;

      const transformed: EnquiryItem[] = rows.map((item: any) => ({
        id: item.id,
        fullname: item.fullname || "Unknown",
        scope_of_work: item.scope_of_work || "General Enquiry",
        createdAt: item.createdAt,
        status: item.status === "pending" ? "Pending" :
                item.status === "under-review" ? "Under Review" :
                item.status === "in-progress" ? "In Progress" :
                item.status === "completed" ? "Completed" : "Pending",
      }));

      setData(transformed);
      setTotal(totalCount);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // Summary counts from real data
  const pendingCount = data.filter(x => x.status === "Pending").length;
  const underReviewCount = data.filter(x => x.status === "Under Review").length;
  const inProgressCount = data.filter(x => x.status === "In Progress").length;

  const columns = [
    {
      key: "fullname",
      header: "Customer",
      render: (i: EnquiryItem) => <p className="font-medium">{i.fullname}</p>,
    },
    {
      key: "scope_of_work",
      header: "Service / Scope",
      render: (i: EnquiryItem) => <p>{i.scope_of_work || "—"}</p>,
    },
    {
      key: "createdAt",
      header: "Requested Date",
      render: (i: EnquiryItem) => (
        <p>{new Date(i.createdAt).toLocaleDateString("en-GB")}</p>
      ),
    },
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
        <SummaryCard icon={<ClipboardList className="text-primary w-6 h-6" />} label="Pending" count={pendingCount} />
        <SummaryCard icon={<Clock className="text-orange-500 w-6 h-6" />} label="Under Review" count={underReviewCount} />
        <SummaryCard icon={<CheckCircle className="text-green-600 w-6 h-6" />} label="In Progress" count={inProgressCount} />
        <SummaryCard icon={<ListChecks className="text-gray-600 w-6 h-6" />} label="Total" count={data.length} />
      </div>

      {/* SEARCH */}
      <div className="relative w-full max-w-sm mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by customer or service..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset page on new search
          }}
        />
      </div>

      {/* TABLE */}
      <ListComponent
        title="Enquiries"
        data={data}
        columns={columns}
        isLoading={isLoading}
        viewRoute={(id) => `/bookings/enquiry/view/${id}`}
        editRoute={(id) => `/bookings/enquiry/edit/${id}`}
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

// Summary Card Component (unchanged)
function SummaryCard({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
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