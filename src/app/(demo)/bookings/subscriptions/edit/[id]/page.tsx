"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { addMonths, addWeeks, format } from "date-fns";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { mockTechnicians } from "@/data/mockTechnicians";

type Service = {
  name: string;
  role: string;
  scheduleDates: string[];
  technician?: string;
};

export default function EditSubscriptionPage() {
  const { id } = useParams();
  const [services, setServices] = useState<Service[]>([]);
  const [startDate] = useState(new Date());

  useEffect(() => {
    const baseServices: Omit<Service, "scheduleDates">[] = [
      { name: "Air Conditioning", role: "Air Conditioning" },
      { name: "Plumbing", role: "Plumbing" },
      { name: "Electrical Services", role: "Electrical Services" },
      { name: "Appliance Services", role: "Appliance Services" },
      { name: "Gardening Services", role: "Gardening Services" },
    ];

    const schedules = baseServices.map((service, idx) => {
      const offset = addWeeks(startDate, idx);
      const scheduleDates = [
        format(offset, "dd-MM-yyyy"),
        format(addMonths(offset, 4), "dd-MM-yyyy"),
        format(addMonths(offset, 8), "dd-MM-yyyy"),
      ];
      return { ...service, scheduleDates };
    });
    setServices(schedules);
  }, [startDate]);

  const handleAssign = (serviceIdx: number, dateIdx: number) => {
    const tech = services[serviceIdx].technician;
    if (!tech) return alert("Please select a technician first");
    alert(
      `Assigned ${tech} to ${services[serviceIdx].name} on ${services[serviceIdx].scheduleDates[dateIdx]}`
    );
  };

  const handleSelect = (serviceIdx: number, techName: string) => {
    setServices((prev) =>
      prev.map((s, i) =>
        i === serviceIdx ? { ...s, technician: techName } : s
      )
    );
  };

  return (
    <ContentLayout title={`Edit Subscription #${id}`}>
      {services.map((service, serviceIdx) => {
        const availableTechs = mockTechnicians.filter(
          (t) => t.role === service.role
        );

        return (
          <Card key={serviceIdx} className="mb-6 shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full border-t">
                <thead>
                  <tr className="text-left text-red-600 text-sm border-b">
                    <th className="py-2">Service Name</th>
                    <th className="py-2">Schedule Date</th>
                    <th className="py-2">Technician</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {service.scheduleDates.map((date, dateIdx) => (
                    <tr key={dateIdx} className="border-b">
                      <td className="py-2 text-sm">{service.name}</td>
                      <td className="py-2 text-sm">{date}</td>
                      <td className="py-2 text-sm w-[240px]">
                        <Select
                          onValueChange={(value) =>
                            handleSelect(serviceIdx, value)
                          }
                          value={service.technician || ""}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Technician" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTechs.map((tech) => (
                              <SelectItem key={tech.id} value={tech.name}>
                                {tech.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 text-center">
                        <Button
                          onClick={() => handleAssign(serviceIdx, dateIdx)}
                          size="sm"
                          className="bg-red-600 text-white"
                        >
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </ContentLayout>
  );
}
