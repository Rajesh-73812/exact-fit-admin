"use client";

import { useState, useEffect } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle, UserCheck, Search } from "lucide-react";
import ListComponent from "@/components/ListComponent";
import { Input } from "@/components/ui/input";
import apiClient from "@/lib/apiClient";

type EmergencyItem = {
  id: string;
  fullname: string;
  mobile: string;
  description: string;
  status: string;
  technician_id: string | null;
  createdAt: string;
  // We'll populate service name later if needed
  service?: string;
};

export default function AdminEmergencyList() {
  const [data, setData] = useState<EmergencyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/booking/V1/get-all-emergency-booking", {
        params: {
          page,
          limit,
          search: search || undefined,
        },
      });
      console.log(res,"jjjjjjjjjjjjjjj")
      const rows = res.data?.data?.rows || [];
      const totalCount = res.data?.data?.totalCount || 0;

      // Transform data to match your table
      const transformed: EmergencyItem[] = rows.map((item: any) => ({
        id: item.id,
        fullname: item.fullname || "Unknown",
        mobile: item.mobile,
        description: item.description || "—",
        status: item.status === "pending" ? "Active" : 
                item.status === "in-progress" ? "In Progress" : 
                item.status === "completed" ? "Completed" : "Active",
        technician_id: item.technician_id,
        createdAt: item.createdAt,
      }));

      setData(transformed);
      setTotal(totalCount);
    } catch (err) {
      console.error("Failed to fetch emergency bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // Summary counts
  const activeCount = data.filter((x) => x.status === "Active").length;
  const inProgressCount = data.filter((x) => x.status === "In Progress").length;
  const completedCount = data.filter((x) => x.status === "Completed").length;

  const columns = [
    {
      key: "fullname",
      header: "Customer",
      render: (i: EmergencyItem) => <p className="font-medium">{i.fullname}</p>,
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (i: EmergencyItem) => <p>{i.mobile}</p>,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (i: EmergencyItem) => (
        <p>{new Date(i.createdAt).toLocaleDateString("en-GB")}</p>
      ),
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
              : "outline"
          }
          className={
            i.status === "Completed" ? "bg-green-100 text-green-800" : ""
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
        <p className="text-sm text-gray-600">
          {i.technician_id ? "Assigned" : "Not Assigned"}
        </p>
      ),
    },
  ];

  return (
    <ContentLayout title="Emergency Requests">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <AlertTriangle className="text-primary w-6 h-6" />
          <div>
            <p className="text-xs text-primary font-semibold">Active</p>
            <p className="text-lg font-bold">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <Clock className="text-orange-500 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-orange-500">In Progress</p>
            <p className="text-lg font-bold">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <CheckCircle className="text-green-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-green-600">Completed</p>
            <p className="text-lg font-bold">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow-sm flex gap-2 items-center">
          <UserCheck className="text-gray-600 w-6 h-6" />
          <div>
            <p className="text-xs font-semibold text-gray-600">Total</p>
            <p className="text-lg font-bold">{data.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by customer or mobile..."
            className="pl-9 pr-4 py-2 border rounded-md w-full"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page on search
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <ListComponent
        title="Emergency"
        data={data}
        columns={columns}
        isLoading={isLoading}
        viewRoute={(id) => `/bookings/emergency/view/${id}`}
        editRoute={(id) => `/bookings/emergency/edit/${id}`}
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