"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewSubscriptionPage() {
  const { id } = useParams();

  // This should eventually come from backend or localStorage
  const data = [
    {
      service: "Air Conditioning",
      scheduleDates: ["25-10-2025", "25-02-2026", "25-06-2026"],
      status: [true, false, true],
      technician: "James Carter",
    },
    {
      service: "Plumbing",
      scheduleDates: ["01-11-2025", "01-03-2026", "01-07-2026"],
      status: [false, false, false],
      technician: "Emily Davis",
    },
    {
      service: "Electrical Services",
      scheduleDates: ["08-11-2025", "08-03-2026", "08-07-2026"],
      status: [false, true, false],
      technician: "",
    },
  ];

  return (
    <ContentLayout title={`View Subscription #${id}`}>
      {data.map((serviceBlock, idx) => (
        <Card key={idx} className="mb-6 shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">
              {serviceBlock.service}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <table className="w-full border-t">
              <thead>
                <tr className="text-left text-red-600 text-sm border-b">
                  <th className="py-2">Service Name</th>
                  <th className="py-2">Schedule Date</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2">Technician</th>
                </tr>
              </thead>

              <tbody>
                {serviceBlock.scheduleDates.map((date, i) => (
                  <tr key={i} className="border-b">
                    {/* Service Name */}
                    <td className="py-2 text-sm">{serviceBlock.service}</td>

                    {/* Schedule Date */}
                    <td className="py-2 text-sm">{date}</td>

                    {/* Status ✓ / ✕ */}
                    <td className="py-2 text-center text-xl">
                      {serviceBlock.status[i] ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </td>

                    {/* Technician */}
                    <td className="py-2 text-sm">
                      {serviceBlock.technician ? (
                        <Badge className="bg-green-100 text-green-700">
                          {serviceBlock.technician}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Not Assigned
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </ContentLayout>
  );
}
