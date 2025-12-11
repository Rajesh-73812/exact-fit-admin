'use client';

import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-toastify';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface CustomToggleConfig {
  path: string;
  trueLabel: string;
  falseLabel: string;
}

/* --------------------------------------------------------------
   Helper – pick the identifier from the row (id OR slug)
   -------------------------------------------------------------- */
const getRowId = (item: any): string => {
  // 1. explicit `id` (string/number)
  if (item.id != null) return String(item.id);
  // 3. slug
  if (item.service_slug != null) return String(item.service_slug);
  if (item.slug != null) return String(item.slug);
  // 4. fallback – title (rare)
  if (item.title != null) return String(item.title);
  return '';
};

interface ListComponentProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading: boolean;
  addRoute?: string;

  /** (slug or id) → URL string */
  editRoute: (id: string) => string;
  viewRoute?: (id: string) => string;
  deleteEndpoint: (id: string) => string;
  statusToggleEndpoint?: (id: string) => string;
  onStatusToggle?: (id: string, status: string) => Promise<void>;

  approvalToggleEndpoint?: (id: string) => string;
  onApprovalToggle?: (id: string, status: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;

  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  totalItems: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusField: string;
  approvalField?: string;
  showStatusToggle?: boolean;
  showApprovalToggle?: boolean;
  customToggleConfig?: CustomToggleConfig;
}

/* --------------------------------------------------------------
   ListComponent
   -------------------------------------------------------------- */
export default function ListComponent({
  title,
  data,
  columns,
  isLoading,
  addRoute,
  editRoute,
  viewRoute,
  deleteEndpoint,
  statusToggleEndpoint,
  onStatusToggle,
  approvalToggleEndpoint,
  onApprovalToggle,
  onDelete,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  searchQuery,
  setSearchQuery,
  statusField,
  approvalField = 'is_active',
  showStatusToggle = true,
  showApprovalToggle = false,
  customToggleConfig,
}: ListComponentProps) {
  const router = useRouter();
  const pathName = usePathname();

  const isBookingPage = pathName === '/bookings/list';
  const isVendorsPage = pathName === '/vendors' || pathName === '/vendors/list';
  const isContactUsPage = pathName === '/contactus' || pathName === '/contactus/list';
  const isPlanPage = pathName === '/plans' || pathName === '/plans/list';
  const isCustomers = pathName === '/customers' || pathName === '/customers/list';
  const isNotifications = pathName === '/notifications' || pathName === '/notifications/list';
  const isTickets = pathName === '/tickets' || pathName === '/tickets/list';
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const titleSlug = title
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');

  /* ---------- Debounced search ---------- */
  useEffect(() => {
    const handler = debounce((v: string) => setSearchQuery(v), 500);
    handler(debouncedSearchQuery);
    return () => handler.cancel();
  }, [debouncedSearchQuery, setSearchQuery]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  const handleItemsPerPageChange = (v: string) => {
    // alert('Items per page changed to ' + v);
    setItemsPerPage(Number(v));
    setCurrentPage(1);
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id: string) => {
  
    try {
      setDeletingId(id);
      if (onDelete) {
        await onDelete(id);
      } else {
        if (isBookingPage) {
          await apiClient.put(deleteEndpoint(id), { withCredentials: true });
        } else {
          await apiClient.delete(deleteEndpoint(id), { withCredentials: true });
        }
        // refresh list after delete
        if (onStatusToggle) await onStatusToggle(id, 'refresh');
      }
    } catch (e) {
      console.error(`Error deleting ${title.toLowerCase()}:`, e);
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- Download single ---------- */
  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      const resp = await apiClient.get(`/v1/transcation/download/${id}`, {
        withCredentials: true,
        responseType: 'blob',
      });

      const blob = new Blob([resp.data], { type: resp.headers['content-type'] });
      let filename = `${titleSlug}-${id}.xlsx`;
      const cd = resp.headers['content-disposition'];
      if (cd) {
        const m = cd.match(/filename="?([^"]+)"?/);
        if (m?.[1]) filename = m[1];
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${title} downloaded`);
    } catch (e) {
      console.error(`Download error:`, e);
      toast.error(`Failed to download ${title}`);
    } finally {
      setDownloadingId(null);
    }
  };

  /* ---------- Download all ---------- */
  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);
      const resp = await apiClient.get(`/v1/transcation/download-all`, {
        withCredentials: true,
        responseType: 'blob',
      });

      let filename = `${titleSlug}-all.xlsx`;
      const cd = resp.headers['content-disposition'];
      if (cd) {
        const m = cd.match(/filename="?([^"]+)"?/);
        if (m?.[1]) filename = m[1];
      }

      const blob = new Blob([resp.data], { type: resp.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`All ${title.toLowerCase()} downloaded`);
    } catch (e) {
      console.error(`Download-all error:`, e);
      toast.error(`Failed to download all`);
    } finally {
      setDownloadingAll(false);
    }
  };

  /* ---------- Render ---------- */
  return (
    <TooltipProvider>
      <div className="pb-6 text-foreground">
        {/* ----- Header (search + add) ----- */}
        {addRoute && (
          <div className="flex justify-between items-center gap-3 mb-4 mt-4">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={debouncedSearchQuery}
                onChange={(e) => setDebouncedSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary"
              />
            </div>

            {
              addRoute && !isCustomers && (
                <Button
              onClick={() => router.push(addRoute)}
              className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {title}
            </Button>
              )
            }
          </div>
        )}

        {/* ----- Download All (Transactions) ----- */}
        {title === 'Transaction' && (
          <div className="flex justify-end mb-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="mr-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download All</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* ----- Table ----- */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow className="text-foreground text-sm font-medium hover:bg-secondary">
                <TableHead className="text-foreground whitespace-nowrap">S.No</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.key} className="text-foreground whitespace-nowrap">
                    {c.header}
                  </TableHead>
                ))}

                {/* Status toggle column */}
                {!isContactUsPage && showStatusToggle && (
                  <TableHead className="text-foreground whitespace-nowrap">Status</TableHead>
                )}

                {/* Approval column */}
                {showApprovalToggle && customToggleConfig && (
                  <TableHead className="text-foreground whitespace-nowrap">Approval</TableHead>
                )}

                <TableHead className="text-foreground whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (!isContactUsPage && showStatusToggle ? 1 : 0) +
                      (showApprovalToggle ? 1 : 0) +
                      2
                    }
                    className="text-center py-8 text-foreground"
                  >
                    Loading {title.toLowerCase()}...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (!isContactUsPage && showStatusToggle ? 1 : 0) +
                      (showApprovalToggle ? 1 : 0) +
                      2
                    }
                    className="text-center py-8 text-foreground"
                  >
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, idx) => {
                  const rowId = getRowId(item);               // <-- dynamic id/slug
                  const isDeleting = deletingId === rowId;
                  const isDownloading = downloadingId === rowId;

                  return (
                    <TableRow
                      key={rowId}                               // <-- React key
                      className="hover:bg-muted/20 dark:hover:bg-muted/50 transition-all"
                    >
                      <TableCell className="text-foreground">{startIndex + idx}</TableCell>

                      {/* Columns */}
                      {columns.map((c) => (
                        <TableCell key={c.key} className="text-foreground">
                          {c.render ? c.render(item) : item[c.key] ?? '-'}
                        </TableCell>
                      ))}

                      {/* ---------- Status Toggle ---------- */}
                      {!isContactUsPage && showStatusToggle && (
                        <TableCell>
                          <Switch
                            checked={
                              item[statusField] === true ||
                              item[statusField] === 1 ||
                              item[statusField] === '1' ||
                              item[statusField] === 'active'
                            }
                            onCheckedChange={() =>
                              onStatusToggle?.(
                                rowId,
                                item[statusField] === true ||
                                  item[statusField] === 1 ||
                                  item[statusField] === '1'
                                  ? '0'
                                  : '1'
                              )
                            }
                            disabled={isDeleting || !onStatusToggle}
                          />
                        </TableCell>
                      )}

                      {/* ---------- Approval Toggle (vendors) ---------- */}
                      {showApprovalToggle &&
                        customToggleConfig &&
                        isVendorsPage &&
                        customToggleConfig.path === pathName && (
                          <TableCell>
                            {item[approvalField] === 'pending' ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => onApprovalToggle?.(rowId, '1')}
                                  disabled={isDeleting || !onApprovalToggle}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => onApprovalToggle?.(rowId, '0')}
                                  disabled={isDeleting || !onApprovalToggle}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span
                                className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-1 ${item[approvalField] === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}
                              >
                                {item[approvalField] === 'approved'
                                  ? customToggleConfig.trueLabel
                                  : customToggleConfig.falseLabel}
                              </span>
                            )}
                          </TableCell>
                        )}

                      {/* ---------- Actions ---------- */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View */}
                          {title !== 'Transaction' &&
                            title !== 'Notifications' &&
                            viewRoute && !isPlanPage && !isNotifications &&(
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(viewRoute(rowId))}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View</TooltipContent>
                              </Tooltip>
                            )}

                          {/* Edit */}
                          {!isCustomers &&
                            !isContactUsPage && !isContactUsPage && !isTickets &&
                            title !== 'Transaction' &&
                            item.status !== 'cancelled' &&
                            item.status !== 'completed' &&
                            title !== 'Sent Notifications' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(editRoute(rowId))}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            )}

                          {/* Delete / Cancel */}
                          {isBookingPage ? (
                            item.status !== 'cancelled' &&
                            item.status !== 'completed' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(rowId)}
                                    disabled={isDeleting}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel</TooltipContent>
                              </Tooltip>
                            )
                          ) : (
                            title !== 'Transaction' && !isContactUsPage && !isTickets && 
                            onDelete && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(rowId)}
                                    disabled={isDeleting}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            )
                          )}

                          {/* Download (Transaction) */}

                          {title === 'Transaction' &&  'Sent Notifications' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownload(rowId)}
                                  disabled={isDownloading}
                                  className="text-foreground border-foreground/20 hover:bg-muted"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Download</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------- Pagination ---------- */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-4 text-foreground">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {totalItems} {title.toLowerCase()}
              </span>

              <Select value={itemsPerPage.toString()} onValueChange={(v)=>handleItemsPerPageChange(v)}>
                <SelectTrigger className="w-20 bg-background text-foreground border-input focus:ring-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground border-input">
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">per page</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden md:inline mr-1">Previous</span>
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)
                )
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && <span className="px-2">...</span>}
                    <Button
                      variant={currentPage === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(p)}
                      className={
                        currentPage === p
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground border-foreground/20 hover:bg-muted'
                      }
                    >
                      {p}
                    </Button>
                  </React.Fragment>
                ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >
                <span className="hidden md:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}