"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* -----------------------------------------------------------------------
   MOCK DATA (Replace with API data later)
------------------------------------------------------------------------ */

const emergencyData = {
  id: 1,
  name: "Ameer",
  email: "ameer@gmail.com",
  mobile: "+971 98 9898 989",
  emirate: "Dubai",
  addressLabel: "Home",
  fullAddress: "7B Spice Road, Banjara Hills, Hyderabad",
  category: "Residential",
  service: "AC Repair",
  description: "AC not cooling, making loud noise intermittently.",
  date: "12-11-2025",
  status: "Active",
  technician: "James", // assigned technician name or null
  // Technician log (one per request as per requirement)
  technicianLog: {
    title: "Technician Assessment",
    technicianName: "James",
    logText:
      "Inspected indoor unit & compressor. Found refrigerant leak at elbow joint. Suggested replacement of elbow and recharge.",
    logImages: [
      // image URLs (use real URLs or public assets)
      "/images/sample1.jpg",
      "/images/sample2.jpg",
    ],
    summaryText:
      "Leak identified. Requires elbow replacement and gas recharge. Estimated 2 hours on-site.",
    summaryImages: ["/images/sample3.jpg"],
  },
};

const allTechnicians = [
  { id: 1, name: "James", role: "AC Repair" },
  { id: 2, name: "Ravi", role: "AC Repair" },
  { id: 3, name: "Karan", role: "Plumbing Leak" },
];

export default function AdminEmergencyEditPage() {
  const { id } = useParams();

  const [status, setStatus] = useState<string>(emergencyData.status);
  const [selectedTech, setSelectedTech] = useState<string>(
    emergencyData.technician || ""
  );

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quoteDescription, setQuoteDescription] = useState("");
  const [quotePrice, setQuotePrice] = useState<string>("");

  /* Filter technicians by emergency service */
  const filteredTech = allTechnicians.filter(
    (t) => t.role === emergencyData.service
  );

  function handleAssign() {
    if (!selectedTech) {
      alert("Please select a technician before assigning.");
      return;
    }
    // Replace with API call: PATCH /admin/emergency/:id { technician: selectedTech }
    alert(
      `Assigned Technician: ${selectedTech}\nEmergency ID: ${id}\nService: ${emergencyData.service}`
    );
    // optimistic update
    // (In real integration update emergencyData.technician via state or refetch)
  }

  function handleSave() {
    // Replace with API call to save updated status & technician
    alert(
      `Saved Changes:\nStatus: ${status}\nTechnician: ${selectedTech || "Not Assigned"}`
    );
  }

  function handleReject() {
    // Replace with API call -> set status = Rejected
    setStatus("Rejected");
    alert(`Emergency Request #${id} has been Rejected.`);
  }

  function openQuotation() {
    setQuoteDescription("");
    setQuotePrice("");
    setShowQuotationModal(true);
  }

  function submitQuotation() {
    if (!quotePrice) {
      alert("Please enter a price for the quotation.");
      return;
    }

    // Build payload
    const payload = {
      emergencyId: id,
      customerName: emergencyData.name,
      customerMobile: emergencyData.mobile,
      customerEmail: emergencyData.email,
      service: emergencyData.service,
      technician: selectedTech || emergencyData.technician || null,
      technicianLog: emergencyData.technicianLog,
      description: quoteDescription,
      price: quotePrice,
      createdAt: new Date().toISOString(),
    };

    // Replace with POST /admin/emergency/:id/quotation API call
    console.log("Quotation payload:", payload);

    // update status to Quotation Sent as requested
    setStatus("Quotation Sent");
    setShowQuotationModal(false);

    alert("Quotation submitted and status updated to 'Quotation Sent'.");
  }

  /* -------------------------------------------------------------------------------- */

  return (
    <ContentLayout title={`Assign Technician — Emergency #${id}`}>
      {/* ---------------------- CUSTOMER DETAILS ---------------------- */}
      <div className="bg-white p-5 border rounded-xl mb-6 space-y-2 text-sm shadow-sm">
        <p>
          <span className="font-medium">Customer:</span> {emergencyData.name}
        </p>
        <p>
          <span className="font-medium">Email:</span> {emergencyData.email}
        </p>
        <p>
          <span className="font-medium">Mobile:</span> {emergencyData.mobile}
        </p>
        <p>
          <span className="font-medium">Emirate:</span> {emergencyData.emirate}
        </p>
        <p>
          <span className="font-medium">Address:</span>{" "}
          {emergencyData.fullAddress}
        </p>
        <p>
          <span className="font-medium">Category:</span>{" "}
          {emergencyData.category}
        </p>
        <p>
          <span className="font-medium">Service Requested:</span>{" "}
          {emergencyData.service}
        </p>

        <p className="font-medium mt-2">Description:</p>
        <p className="text-gray-600">{emergencyData.description}</p>
      </div>

      {/* ---------------------- TECHNICIAN LOGS (READ-ONLY) ---------------------- */}
      <div className="bg-white border rounded-xl p-5 mb-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold">Technician Logs</h3>

        <div className="text-sm space-y-2">
          <p className="font-medium">Title:</p>
          <p className="text-gray-700">{emergencyData.technicianLog.title}</p>

          <p className="font-medium mt-2">Technician:</p>
          <p className="text-gray-700">{emergencyData.technicianLog.technicianName}</p>

          <p className="font-medium mt-2">Log Details:</p>
          <p className="text-gray-700">{emergencyData.technicianLog.logText}</p>

          {emergencyData.technicianLog.logImages?.length > 0 && (
            <>
              <p className="font-medium mt-2">Images:</p>
              <div className="flex gap-2">
                {emergencyData.technicianLog.logImages.map((src, i) => (
                  <div key={i} className="w-[90px] h-[70px] overflow-hidden rounded-md border">
                    {/* Image component uses native <img> so it works in admin */}
                    <img src={src} alt={`log-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}

          <hr className="my-3" />

          <p className="font-medium">Summary:</p>
          <p className="text-gray-700">{emergencyData.technicianLog.summaryText}</p>

          {emergencyData.technicianLog.summaryImages?.length > 0 && (
            <>
              <p className="font-medium mt-2">Summary Images:</p>
              <div className="flex gap-2">
                {emergencyData.technicianLog.summaryImages.map((src, i) => (
                  <div key={i} className="w-[90px] h-[70px] overflow-hidden rounded-md border">
                    <img src={src} alt={`summary-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button className="bg-red-600 text-white" onClick={openQuotation}>
            Raise Quotation
          </Button>
        </div>
      </div>

      {/* ---------------------- ASSIGN TECHNICIAN CARD (table like subscription) ---------------------- */}
      <Card className="shadow-md border mb-6">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">{emergencyData.service}</CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border-t">
            <thead>
              <tr className="text-left text-red-600 text-sm border-b">
                <th className="py-2">Service Name</th>
                <th className="py-2">Requested Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Technician</th>
                <th className="py-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                {/* Service Name */}
                <td className="py-2 text-sm">{emergencyData.service}</td>

                {/* Requested Date */}
                <td className="py-2 text-sm">{emergencyData.date}</td>

                {/* Status */}
                <td className="py-2 text-sm">{status}</td>

                {/* Technician Dropdown */}
                <td className="py-2 w-[260px]">
                  <Select value={selectedTech} onValueChange={setSelectedTech}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Technician" />
                    </SelectTrigger>

                    <SelectContent>
                      {filteredTech.length > 0 ? (
                        filteredTech.map((tech) => (
                          <SelectItem key={tech.id} value={tech.name}>
                            {tech.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="none">
                          No technician found for this service
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </td>

                {/* Assign Button */}
                <td className="py-2 text-center">
                  <Button size="sm" onClick={handleAssign} className="bg-red-600 text-white">
                    Assign
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ---------------------- STATUS UPDATE SECTION ---------------------- */}
          <div className="mt-6">
            <label className="font-medium mb-2 block">Update Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded-lg w-60 text-sm"
            >
              <option>Active</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Quotation Sent</option>
              <option>Rejected</option>
            </select>
          </div>

          {/* ---------------------- ACTION BUTTONS ---------------------- */}
          <div className="flex gap-3 mt-6">
            <Button className="bg-black text-white" onClick={handleSave}>
              Save Changes
            </Button>

            <Button className="bg-red-600 text-white" onClick={handleReject}>
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------- QUOTATION MODAL (SCROLLABLE) ---------------------- */}
      {showQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-6">
            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Raise Quotation</h3>
              <button
                className="text-gray-500 text-sm"
                onClick={() => setShowQuotationModal(false)}
              >
                Close
              </button>
            </div>

            {/* Quotation content: show ALL details exactly as required */}
            <div className="space-y-4 text-sm">
              {/* Service / request meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Request ID</p>
                  <p className="font-medium">#{emergencyData.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Requested Date</p>
                  <p className="font-medium">{emergencyData.date}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-medium">{emergencyData.service}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium">{emergencyData.category}</p>
                </div>

                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="font-medium">{emergencyData.fullAddress}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="font-medium">{emergencyData.name}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Mobile</p>
                  <p className="font-medium">{emergencyData.mobile}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Assigned Technician</p>
                  <p className="font-medium">{selectedTech || emergencyData.technician || "Not Assigned"}</p>
                </div>
              </div>

              <hr />

              {/* Technician log details */}
              <div>
                <p className="text-xs text-gray-500">Technician Log</p>
                <p className="font-medium">{emergencyData.technicianLog.title}</p>
                <p className="text-gray-700 mt-2">{emergencyData.technicianLog.logText}</p>

                {emergencyData.technicianLog.logImages?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {emergencyData.technicianLog.logImages.map((src, i) => (
                      <div key={i} className="w-[120px] h-[90px] overflow-hidden rounded-md border">
                        <img src={src} alt={`log-${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr />

              {/* Summary */}
              <div>
                <p className="text-xs text-gray-500">Summary</p>
                <p className="text-gray-700 mt-1">{emergencyData.technicianLog.summaryText}</p>

                {emergencyData.technicianLog.summaryImages?.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {emergencyData.technicianLog.summaryImages.map((src, i) => (
                      <div key={i} className="w-[120px] h-[90px] overflow-hidden rounded-md border">
                        <img src={src} alt={`summary-${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr />

              {/* Admin input fields */}
              <div>
                <label className="block text-xs text-gray-500">Quotation Description</label>
                <textarea
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  className="w-full border rounded-md p-2 mt-1 text-sm min-h-[80px]"
                  placeholder="Enter quotation notes, terms, or description..."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500">Price (AED)</label>
                <input
                  type="text"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  className="w-40 border rounded-md p-2 mt-1 text-sm"
                  placeholder="e.g. 250.00"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button className="bg-gray-300" onClick={() => setShowQuotationModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-red-600 text-white" onClick={submitQuotation}>
                  Submit Quotation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ContentLayout>
  );
}
