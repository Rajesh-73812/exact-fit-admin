'use client';

import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '../components/ui/select';
import { Search, Plus, Trash2, Eye, Pencil, ChevronLeft, ChevronRight, X, Download, } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { toast } from 'react-toastify';
import { Tooltip, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { TooltipTrigger } from '@radix-ui/react-tooltip';

interface Column {
  key: string;
  header: string;
  render?: (item: any) => React.ReactNode;
}

interface CustomToggleConfig {
  path: string; // Path where the custom toggle should appear (e.g., '/vendors' or '/vendors/list')
  trueLabel: string; // Label for true state (e.g., 'Approved')
  falseLabel: string; // Label for false state (e.g., 'Rejected')
}

interface ListComponentProps {
  title: string;
  data: any[];
  columns: Column[];
  isLoading: boolean;
  addRoute?: string;
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
  const isContactUsPage = pathName === '/contactus' || pathName === '/contactus/list'
  const isReviewPage = pathName === '/reviews' || pathName === '/reviews/list'
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState<boolean>(false);
  let titleSlug = title.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')


  useEffect(() => {
    const handler = debounce((value: string) => {
      setSearchQuery(value);
    }, 500);

    handler(debouncedSearchQuery);

    return () => {
      handler.cancel();
    };
  }, [debouncedSearchQuery, setSearchQuery]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      //console.log('Navigating to page:', page, 'Total Pages:', totalPages);
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    //console.log('Changing items per page to:', value);
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

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
        if (onStatusToggle) {
          await onStatusToggle(id, 'refresh');
        }
      }
    } catch (error) {
      console.error(`Error deleting ${title.toLowerCase()}:`, error);
    } finally {
      setDeletingId(null);
    }
  };

  //console.log('ListComponent Render - pathName:', pathName, 'customToggleConfig:', customToggleConfig);


  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id)

      const response = await apiClient.get(`/v1/transcation/download/${id}`, { withCredentials: true, responseType: 'blob' });
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${titleSlug}-${id}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename=?([^"]+)"?/);
        if (match?.[1]) {
          filename = match[1]
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a')
      link.href = url;
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click();
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url);
      toast.success(`${title} downloaded sucessfully`)
    } catch (error) {
      console.error(`❌ Error downloading ${title.toLowerCase()}:`, error);
      toast.error(`Failed to download ${title}`);
    } finally {
      setDownloadingId(null)
    }

  }

  const handleDownloadAll = async () => {
    try {
      setDownloadingAll(true);

      const response = await apiClient.get(`/v1/transcation/download-all`, {
        withCredentials: true,
        responseType: 'blob',
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = `${titleSlug}-all.xlsx`;

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

  return (
    <TooltipProvider>
      <div className="pb-6 text-foreground">
        {addRoute && (
          <div className="flex justify-between items-center gap-3 mb-4 mt-4">
            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                value={debouncedSearchQuery}
                onChange={(e) => setDebouncedSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-input bg-background text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary"
              />
            </div>
            <Button
              onClick={() => router.push(addRoute)}
              className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {title}
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          {title === 'Transaction' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
              className="mb-4 mr-2"
              onClick={handleDownloadAll}
              disabled={downloadingAll}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
              </TooltipTrigger>
              <TooltipContent>Download All</TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow className="text-foreground text-sm font-medium hover:bg-secondary">
                <TableHead className="text-foreground whitespace-nowrap">S.No</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.key} className="  text-foreground whitespace-nowrap">
                    {col.header}
                  </TableHead>
                ))}
                {!isContactUsPage && showStatusToggle && (
                  <TableHead className="text-foreground whitespace-nowrap">Status</TableHead>
                )}

                {showApprovalToggle && customToggleConfig && (
                  <TableHead className="text-foreground whitespace-nowrap">Approval</TableHead>
                )}
                {/* {!isContactUsPage && (
                  <TableHead className="text-foreground whitespace-nowrap">Actions</TableHead>
                )} */}
                {(
                  <TableHead className="text-foreground whitespace-nowrap">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (!isContactUsPage && showStatusToggle ? 1 : 0) + (!isContactUsPage && showApprovalToggle ? 1 : 0) + 2}
                    className="text-center py-8 text-foreground"
                  >
                    Loading {title.toLowerCase()}...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (!isContactUsPage && showStatusToggle ? 1 : 0) + (!isContactUsPage && showApprovalToggle ? 1 : 0) + 2}
                    className="text-center py-8 text-foreground"
                  >
                    No {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow
                    key={item.id || item._id}
                    className="hover:bg-muted/20 dark:hover:bg-muted/50 transition-all"
                  >
                    <TableCell className="text-foreground">
                      {startIndex + index}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className="text-foreground">
                        {col.render ? col.render(item) : item[col.key] || '-'}
                      </TableCell>
                    ))}
                    {!isContactUsPage && showStatusToggle && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              item[statusField] === true ||
                              item[statusField] === 1 ||
                              item[statusField] === '1'
                            }
                            onCheckedChange={() =>
                              onStatusToggle?.(
                                item.id || item._id,
                                item[statusField] === true || item[statusField] === 1 || item[statusField] === '1' ? '0' : '1'
                              )
                            }
                            disabled={deletingId === (item.id || item._id) || !onStatusToggle}
                          />
                        </div>
                      </TableCell>
                    )}
                    {/* //this is for when click on pending it shown reject & approved */}
                    {/* {showApprovalToggle && customToggleConfig && isVendorsPage && customToggleConfig.path === pathName && (
                    <TableCell>
                      {item[approvalField] === 'pending' ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              className="inline-flex items-center rounded-full bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 cursor-pointer"
                            >
                              Pending
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-40">
                            <div className="grid gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onApprovalToggle?.(item.id || item._id, '1')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onApprovalToggle?.(item.id || item._id, '0')}
                              >
                                Reject
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span
                          className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-1 ${item[approvalField] === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}  `}  >
                          {item[approvalField] === 'approved'
                            ? customToggleConfig.trueLabel
                            : customToggleConfig.falseLabel}
                        </span>
                      )}
                    </TableCell>
                  )} */}

                    {showApprovalToggle && customToggleConfig && isVendorsPage && customToggleConfig.path === pathName && (
                      <TableCell>
                        {item[approvalField] === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              className="!bg-transparent !text-foreground !border border-foreground/20 hover:!bg-muted"
                              variant="default"
                              size="sm"
                              onClick={() => onApprovalToggle?.(item.id || item._id, '1')}
                              disabled={!onApprovalToggle || deletingId === (item.id || item._id)}
                              aria-label="Approve item"
                            >
                              Approve
                            </Button>
                            <Button
                              className="!bg-transparent !text-foreground !border border-foreground/20 hover:!bg-muted"
                              variant="destructive"
                              size="sm"
                              onClick={() => onApprovalToggle?.(item.id || item._id, '0')}
                              disabled={!onApprovalToggle || deletingId === (item.id || item._id)}
                              aria-label="Reject item"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full text-xs font-medium px-3 py-1 ${item[approvalField] === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : item[approvalField] === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                            aria-label={`${item[approvalField] === 'approved' ? 'Approved' : 'Rejected'} status`}
                          >
                            {item[approvalField] === 'approved'
                              ? customToggleConfig?.trueLabel || 'Approved'
                              : item[approvalField] === 'rejected'
                                ? customToggleConfig?.falseLabel || 'Rejected'
                                : 'Unknown'}
                          </span>
                        )}
                      </TableCell>
                    )}



                    {/* <TableCell>
                    <div className="flex items-center gap-2">
                      {title !== 'Transaction' && title !== 'Notifications' && viewRoute && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(viewRoute(item.id || item._id))}
                          className="text-foreground border-foreground/20 hover:bg-muted"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {title !== 'Transaction' &&
                        item.status !== 'cancelled' &&
                        item.status !== 'completed' &&
                        title !== 'Notifications' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(editRoute(item.id || item._id))}
                            className="text-foreground border-foreground/20 hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      {isBookingPage ? (
                        item.status !== 'cancelled' && item.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            title="Cancel Booking"
                            onClick={() => handleDelete(item.id || item._id)}
                            disabled={deletingId === (item.id || item._id)}
                            className="text-foreground border-foreground/20 hover:bg-muted"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )
                      ) : (
                        title !== 'Transaction' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id || item._id)}
                            disabled={deletingId === (item.id || item._id)}
                            className="text-foreground border-foreground/20 hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )
                      )}
                      {title === 'Transaction' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(item.id || item._id)}
                          disabled={downloadingId === (item.id || item._id)}
                          className="text-foreground border-foreground/20 hover:bg-muted"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell> */}
                    {
                       <TableCell>
                        <div className="flex items-center gap-2">
                          { title !== 'Transaction' && title !== 'Notifications' && viewRoute && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(viewRoute(item.id || item._id))}
                                  className="text-foreground border-foreground/20 hover:bg-muted"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                          )}
                          {!isReviewPage && !isContactUsPage && title !== 'Transaction' &&
                            item.status !== 'cancelled' &&
                            item.status !== 'completed' &&
                            title !== 'Notifications' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(editRoute(item.id || item._id))}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit</TooltipContent>
                              </Tooltip>
                            )}
                          {!isContactUsPage && isBookingPage ? (
                            item.status !== 'cancelled' && item.status !== 'completed' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(item.id || item._id)}
                                    disabled={deletingId === (item.id || item._id)}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel</TooltipContent>
                              </Tooltip>
                            )
                          ) : (
                            !isContactUsPage && title !== 'Transaction' && onDelete && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(item.id || item._id)}
                                    disabled={deletingId === (item.id || item._id)}
                                    className="text-foreground border-foreground/20 hover:bg-muted"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            )
                          )}
                          {title === 'Transaction' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(item.id || item._id)}
                              disabled={downloadingId === (item.id || item._id)}
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
                    }

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalItems > 0 && (
          <div className="flex justify-between items-center mt-4 text-foreground">
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-sm text-muted-foreground">
                Showing {startIndex} to {endIndex} of {totalItems}{' '}
                {title.toLowerCase()}
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20 bg-background text-foreground border-input focus:ring-primary">
                  <SelectValue placeholder={itemsPerPage} />
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
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className='hidden md:inline mr-1'>Previous</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {/* Insert "..." if skipped pages */}
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}

                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={
                        currentPage === page
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
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="text-foreground border-foreground/20 hover:bg-muted"
              >
                {/* Next */}
                <span className='hidden md:inline mr-1'>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}