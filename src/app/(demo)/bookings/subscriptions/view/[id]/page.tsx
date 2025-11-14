"use client";

import { useParams } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViewSubscriptionPage() {
  const { id } = useParams();

  const data = [
    {
      service: "Air Conditioning",
      scheduleDates: ["25-10-2025", "25-02-2026", "25-06-2026"],
      technician: "James Carter",
    },
    {
      service: "Plumbing",
      scheduleDates: ["01-11-2025", "01-03-2026", "01-07-2026"],
      technician: "Emily Davis",
    },
    {
      service: "Electrical Services",
      scheduleDates: ["08-11-2025", "08-03-2026", "08-07-2026"],
      technician: "",
    },
  ];

  return (
    <ContentLayout title={`View Subscription #${id}`}>
      {data.map((service, idx) => (
        <Card key={idx} className="mb-6 shadow-md border">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">
              {service.service}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-t">
              <thead>
                <tr className="text-left text-red-600 text-sm border-b">
                  <th className="py-2">Service Name</th>
                  <th className="py-2">Schedule Date</th>
                  <th className="py-2">Technician</th>
                </tr>
              </thead>
              <tbody>
                {service.scheduleDates.map((date, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 text-sm">{service.service}</td>
                    <td className="py-2 text-sm">{date}</td>
                    <td className="py-2 text-sm">
                      {service.technician ? (
                        <Badge className="bg-green-100 text-green-700">
                          {service.technician}
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
