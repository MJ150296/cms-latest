"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  FlaskConical,
  PlusCircle,
  Search,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Edit,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/app/dashboard/layout/DashboardLayout";
import AddLabWorkForm from "@/app/components/doctor/AddLabWorkForm";
import { useAppDispatch, useAppSelector } from "@/app/redux/store/hooks";
import { deleteLabWork, fetchLabWorks } from "@/app/redux/slices/labWorkSlice";
import Modal from "@/app/components/Modal";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditLabWorkForm from "@/app/components/doctor/EditLabWorkForm";
import LabDashboardAnalytics from "@/app/components/doctor/LabDashboardAnalytics";

// Update interface to match actual data structure
interface LabWorkItem {
  id: string;
  patientName: string;
  orderType: string;
  labName: string;
  status: "Pending" | "Received" | "Fitted" | "Cancelled";
  expectedDeliveryDate?: Date | string | null;
  othersText?: string | null; // Add null here
  toothNumbers?: (string | number)[] | null; // Allow numbers too if needed
  shade?: string | null;
  material?: string | null;
  impressionsTakenOn?: Date | string | null;
  sentToLabOn?: Date | string | null;
  receivedFromLabOn?: Date | string | null;
  fittedOn?: Date | string | null;
  remarks?: string | null;
  attachments?: string[] | null;
}

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800",
  Received: "bg-green-100 text-green-800",
  Fitted: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

const LabWork: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 items per page for grid of 3x2

  const [selectedLabWork, setSelectedLabWork] = useState<LabWorkItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  // Get actual data from Redux store
  const { data: labWorks } = useAppSelector((state) => state.labWork);

  // Update handleDelete
  const handleDelete = () => {
    setShowConfirm(true);
  };

  // Transform and filter data
  const filteredData = useMemo(() => {
    return labWorks
      .map((work) => ({
        id: work._id.toString(), // Convert ObjectId to string
        patientName: work.patientId.fullName,
        orderType: work.orderType,
        labName: work.labName,
        status: work.status as LabWorkItem["status"],
        expectedDeliveryDate: work.expectedDeliveryDate,
        othersText: work?.othersText,
        toothNumbers: work?.toothNumbers,
        shade: work?.shade,
        material: work?.material,
        impressionsTakenOn: work?.impressionsTakenOn,
        sentToLabOn: work?.sentToLabOn,
        receivedFromLabOn: work?.receivedFromLabOn,
        fittedOn: work?.fittedOn,
        remarks: work?.remarks,
        attachments: work?.attachments,
      }))
      .filter((item) =>
        item.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((item) => statusFilter === "All" || item.status === statusFilter);
  }, [labWorks, searchTerm, statusFilter]);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Get current items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filteredData, itemsPerPage]);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchLabWorks());
  }, [dispatch]);

  // Handle page change
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleCardClick = (item: LabWorkItem) => {
    setSelectedLabWork(item);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleConfirm = () => {
    if (!selectedLabWork) return;

    try {
      dispatch(deleteLabWork(selectedLabWork.id)).unwrap();
      setIsModalOpen(false);
      setShowConfirm(false);
      // Optional: Show success notification
    } catch (error) {
      console.error("Error deleting lab work:", error);
      // Optional: Show error notification
    }
  };

  // Loading and error states
  // if (loading) return <div>Loading lab works...</div>;
  // if (error) return <div>Error: {error}</div>;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-semibold text-primary">
            <FlaskConical className="text-primary" />
            Lab Work Orders
          </div>
          <Button
            className="hidden md:flex gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={18} />
            Add New Lab Work
          </Button>
          <Button
            className="flex md:hidden gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <PlusCircle size={18} />
          </Button>
          <Modal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Add New Lab Work</h2>
              <AddLabWorkForm
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                  dispatch(fetchLabWorks());
                  setIsAddModalOpen(false);
                }}
              />
            </div>
          </Modal>
        </div>

        {/* Search Bar */}
        <div className="w-full px-5 md:px-0 flex flex-col space-y-2 md:space-y-0 md:flex-row items-start md:items-center justify-between">
          <div className="w-full md:w-1/2 flex gap-2 items-center">
            <Search size={18} />
            <Input
              placeholder="Search by patient name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Fitted">Fitted</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <Label>Items per page:</Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Lab Work Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentItems.map((item) => (
            <Card
              key={item.id}
              className="shadow-sm hover:shadow-md transition cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-lg">
                    {item.patientName}
                  </div>
                  <Badge
                    className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      statusColor[item.status]
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  <FileText className="inline-block mr-1" size={16} />
                  {item.orderType} — {item.labName}
                </div>

                <div className="flex justify-between items-center text-xs mt-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar size={14} />
                    Expected:{" "}
                    <span className="font-medium text-gray-700">
                      {item.expectedDeliveryDate
                        ? new Date(
                            item.expectedDeliveryDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="text-gray-400">#{item.id.slice(-6)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min(currentItems.length, itemsPerPage)} of{" "}
              {totalItems} items
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>

              {getPageNumbers().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredData.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-8">
            {searchTerm
              ? `No lab work found for "${searchTerm}"`
              : "No lab work orders available"}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setSelectedLabWork(null);
        }}
      >
        <div className="bg-white p-2 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          {isEditMode ? (
            <EditLabWorkForm
              labWork={selectedLabWork}
              onCancel={() => setIsEditMode(false)}
              onSuccess={() => {
                dispatch(fetchLabWorks());
                setIsEditMode(false);
                setIsModalOpen(false);
                setSelectedLabWork(null);
              }}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Lab Work Details</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedLabWork && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Patient Name
                    </h4>
                    <p>{selectedLabWork.patientName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Status
                    </h4>
                    <Badge className={cn(statusColor[selectedLabWork.status])}>
                      {selectedLabWork.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Order Type
                    </h4>
                    <p>{selectedLabWork.orderType}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Lab Name
                    </h4>
                    <p>{selectedLabWork.labName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Expected Delivery
                    </h4>
                    <p>
                      {selectedLabWork.expectedDeliveryDate
                        ? new Date(
                            selectedLabWork.expectedDeliveryDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Work ID
                    </h4>
                    <p>#{selectedLabWork.id.slice(-6)}</p>
                  </div>

                  {/* Dental Details */}
                  <div className="md:col-span-2 mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Dental Details</h3>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Tooth Numbers
                    </h4>
                    <p>
                      {selectedLabWork.toothNumbers &&
                      selectedLabWork.toothNumbers.length > 0
                        ? selectedLabWork.toothNumbers.join(", ")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Shade
                    </h4>
                    <p>{selectedLabWork.shade || "N/A"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Material
                    </h4>
                    <p>{selectedLabWork.material || "N/A"}</p>
                  </div>
                  {selectedLabWork.orderType === "Others" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Other Details
                      </h4>
                      <p>{selectedLabWork.othersText || "N/A"}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="md:col-span-2 mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">Timeline</h3>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Impressions Taken On
                    </h4>
                    <p>
                      {selectedLabWork.impressionsTakenOn
                        ? new Date(
                            selectedLabWork.impressionsTakenOn
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Sent To Lab On
                    </h4>
                    <p>
                      {selectedLabWork.sentToLabOn
                        ? new Date(
                            selectedLabWork.sentToLabOn
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Received From Lab On
                    </h4>
                    <p>
                      {selectedLabWork.receivedFromLabOn
                        ? new Date(
                            selectedLabWork.receivedFromLabOn
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Fitted On
                    </h4>
                    <p>
                      {selectedLabWork.fittedOn
                        ? new Date(
                            selectedLabWork.fittedOn
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* Additional Information */}
                  <div className="md:col-span-2 mt-4 pt-4 border-t">
                    <h3 className="font-semibold mb-2">
                      Additional Information
                    </h3>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Remarks
                    </h4>
                    <p>{selectedLabWork.remarks || "N/A"}</p>
                  </div>
                  {selectedLabWork.attachments &&
                    selectedLabWork.attachments.length > 0 && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Attachments
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedLabWork.attachments.map(
                            (attachment, index) => (
                              <a
                                key={index}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                Attachment {index + 1}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
          <p>Are you sure you want to delete this lab work?</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <LabDashboardAnalytics />
    </DashboardLayout>
  );
};

export default LabWork;
