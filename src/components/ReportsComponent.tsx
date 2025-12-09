'use client';

import React, { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
// import Loader from '../utils/Loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Loader from './utils/Loader';
import SearchComponent from './utils/SearchComponent';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface Pagination {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}


interface ReportsComponentProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading: boolean;
  downloadEndpoint: (id: string) => string;
  downloadAllEndpoint: string;
  onSearch: (query: string) => void;
  showStatusToggle?: boolean;
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  setItemsPerPage?: (items: number) => void; // Added to handle items per page change
  selectedRole?: string;
  setSelectedRole?: (value: string) => void;
  fromDate?: Date | null;
  toDate?: Date | null;
  onFromDateChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  // Passed from parent
  users?: { [key: string]: string };
  vendors?: { [key: string]: string };
  products?: { [key: string]: string };
  formatTimeToAmPm?: (time: string) => string;
  serviceTypeFilter?: string;
  setServiceTypeFilter?: (value: string) => void;
}

export default function ReportsComponent({
  title,
  data,
  columns,
  isLoading,
  downloadEndpoint,
  downloadAllEndpoint,
  onSearch,
  showStatusToggle = false,
  pagination,
  onPageChange,
  setItemsPerPage,
  selectedRole,
  setSelectedRole,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  users = {},
  vendors = {},
  products = {},
  formatTimeToAmPm = (t: string) => t,
  serviceTypeFilter,
  setServiceTypeFilter,
}: ReportsComponentProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  let titleSlug = title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')
  console.log(title, "ttttttttttttttttttttt")
  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);

      const response = await apiClient.get(downloadEndpoint(id), {
        responseType: 'blob',
        withCredentials: true
      });

      console.log(response, "from backkkkkkkkkkkkkkkkkkkkkkk")
      const contentDisposition = response.headers['content-disposition'];
      console.log(contentDisposition, "frommmmmmmmmmmmmmmmmmm contentDisposition")
      let filename = `${titleSlug}-${id}.xlsx`;
      console.log(filename, "frommmmmmmmmmmmmmmmmmmmmmmmm fileeeeeeeeeeeeeeee")
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${title} downloaded successfully`);
    } catch (error) {
      console.error(`❌ Error downloading ${title.toLowerCase()}:`, error);
      toast.error(`Failed to download ${title}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);

      const response = await apiClient.get(downloadAllEndpoint, {
        responseType: 'blob',
        withCredentials: true
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `All-${titleSlug}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`All ${title.toLowerCase()} downloaded successfully`);
    } catch (error) {
      console.error(`❌ Error downloading all ${title.toLowerCase()}:`, error);
      toast.error(`Failed to download all ${title.toLowerCase()}`);
    } finally {
      setDownloadingAll(false);
    }
  };


  const handleItemsPerPageChange = (value: string) => {
    console.log('Changing items per page to:', value);
    if (setItemsPerPage) {
      setItemsPerPage(Number(value));
      onPageChange?.(1);
    }
  };


  return (
    <TooltipProvider>
      <div className="pb-6 text-foreground">
        {isLoading && <div className="flex justify-center items-center h-screen"><Loader /></div>}
        {/* Header with Search and Download All */}
        <div className="flex items-center mb-4 mt-4 gap-4 w-full">
          {/* Left: Search bar */}
          <SearchComponent
            placeholder={`Search ${title.toLowerCase()}...`}
            onSearch={onSearch}
            className="w-full max-w-[288px] flex-shrink-0"
          />

          {title === "Technicians Report" && setServiceTypeFilter && (
            <Select value={serviceTypeFilter || "all"} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
          )}
          {/* Right: Role Filter + Download All */}
          <div className="flex gap-2 items-center w-full justify-between">
            {/* Only show role filter if passed from parent */}
            <div className='hidden md:block'>
              {title !== "Technicians Report" && selectedRole !== undefined && (
                <Select
                  value={selectedRole}
                  onValueChange={(value) => {
                    setSelectedRole?.(value);     // ✅ Safe call
                    onPageChange?.(1);            // ✅ Reset page
                  }}
                >
                  <SelectTrigger className=" border border-input w-28 flex-shrink-0">
                    <SelectValue placeholder="Filter by Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {/* Date Inputs */}
            {onFromDateChange && onToDateChange && (
              <div className="hidden md:flex w-full justify-around items-center">
                <div>
                  <label className="text-sm text-foreground mr-1">From:</label>

                  <input
                    type="date"
                    value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => onFromDateChange(e.target.value ? new Date(e.target.value) : null)}
                    className="w-32 border border-input rounded-md p-2 text-sm text-foreground bg-background focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground mr-1">To:</label>
                  <input
                    type="date"
                    value={toDate ? toDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => onToDateChange(e.target.value ? new Date(e.target.value) : null)}
                    className="w-32 border border-input rounded-md p-2 text-sm text-foreground bg-background focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll || isLoading || data.length === 0}
                  className="flex items-center text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {/* {downloadingAll ? 'Downloading...' : 'Download All Reports'} */}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download All</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white shadow-md overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="text-foreground text-sm font-medium hover:bg-secondary">
                <TableHead className='text-foreground text-sm font-medium'>S.No</TableHead>
                {columns.map((column) => (
                  <TableHead className='text-foreground text-sm font-medium whitespace-nowrap px-4' key={column.key}>{column.header}</TableHead>
                ))}
                <TableHead className='text-foreground text-sm font-medium'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-10 text-gray-600">
                    Loading {title.toLowerCase()}...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-10 text-gray-500">
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id || item._id} className="hover:bg-gray-50 transition-all">
                    <TableCell className="text-gray-700 whitespace-nowrap">
                      {(() => {
                        const page = pagination?.currentPage ?? 1;
                        const limit = pagination?.limit ?? 10;
                        return (page - 1) * limit + index + 1;
                      })()}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.key} className="text-gray-700 max-w-[200px] truncate  px-4">
                        {column.render ? column.render(item) : item[column.key] || '-'}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Eye Icon FIRST */}
                        {item.status === 'cancelled' && item.cancelled_by?.toLowerCase() === 'customer' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 "
                                onClick={() => setSelectedBooking(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Cancellation Details</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Download Button SECOND */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(item.id || item._id)}
                              disabled={downloadingId === (item.id || item._id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Download Report</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls (Styled like ListComponent) */}
        {pagination && pagination.totalPages > 0 && onPageChange && (
          <div className="flex justify-between items-center mt-4 text-foreground">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                {pagination.total} {title.toLowerCase()}
              </span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20 bg-background text-foreground border-input focus:ring-primary">
                  <SelectValue placeholder={pagination.limit} />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-input">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
            <div className="flex items-center gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >

                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Always show first page, last page, and 2 pages around current
                  return (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  );
                })
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {/* Add dots (...) if skipped pages */}
                    {index > 0 && arr[index - 1] !== page - 1 && <span className="px-2">...</span>}

                    <Button
                      variant={pagination.currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(page)}
                      className={
                        pagination.currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground border-foreground/20 hover:bg-muted'
                      }
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >
                Next
              </Button>

            </div>

          </div>
        )}

        {/* BEAUTIFUL CANCELLATION MODAL WITH SCROLLABLE REASON */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl font-bold">
                Cancellation Details — {selectedBooking?.booking_number}
              </DialogTitle>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* Customer & Vendor Info */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-semibold text-base mt-1">
                    {selectedBooking?.Customer?.fullname || users[selectedBooking?.user_id] || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vendor:</span>
                  <p className="font-semibold text-base mt-1">
                    {selectedBooking?.Vendor?.fullname || vendors[selectedBooking?.vendor_id] || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Service:</span>
                  <p className="font-medium mt-1">{products[selectedBooking?.product_id] || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Event:</span>
                  <p className="font-medium mt-1">
                    {selectedBooking?.event_date
                      ? new Date(selectedBooking.event_date).toLocaleDateString('en-IN')
                      : 'N/A'}{' '}
                    {formatTimeToAmPm(selectedBooking?.event_time || '')}
                  </p>
                </div>
              </div>

              {/* CANCELLATION REASON - SCROLLABLE LIKE YOUR SCREENSHOT */}
              <div>
                <h4 className="font-semibold text-red-700 mb-3">Cancellation Reason</h4>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-5 min-h-32 max-h-48 overflow-y-auto">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                    {selectedBooking?.cancellation_reason || 'No reason provided by customer.'}
                  </p>
                </div>
                <div className="mt-4 flex justify-start">
                  <Badge variant="destructive" className="text-sm px-4 py-2">
                    Cancelled by Customer
                  </Badge>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <span className="text-muted-foreground">Total Paid:</span>
                  <p className="text-2xl font-bold mt-1">₹{selectedBooking?.total?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vendor Share:</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    ₹{selectedBooking?.vendor_share_amount || '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider >
  );
}