"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { addMonths, addWeeks, format } from "date-fns";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { mockTechnicians } from "@/data/mockTechnicians";

type Service = {
  name: string;
  role: string;
  scheduleDates: string[];
  status: boolean[];
  technician?: string;
};

export default function EditSubscriptionPage() {
  const { id } = useParams();
  const [services, setServices] = useState<Service[]>([]);
  const [startDate] = useState(new Date());

  // ----------------------------------------------------------
  // AUTO GENERATE DATES + STATUS
  // ----------------------------------------------------------
  useEffect(() => {
    const baseServices: Omit<Service, "scheduleDates" | "status">[] = [
      { name: "Air Conditioning", role: "Air Conditioning" },
      { name: "Plumbing", role: "Plumbing" },
      { name: "Electrical Services", role: "Electrical Services" },
      { name: "Appliance Services", role: "Appliance Services" },
      { name: "Gardening Services", role: "Gardening Services" },
    ];

    const schedules = baseServices.map((service, idx) => {
      const offset = addWeeks(startDate, idx);

      const dates = [
        format(offset, "dd-MM-yyyy"),
        format(addMonths(offset, 4), "dd-MM-yyyy"),
        format(addMonths(offset, 8), "dd-MM-yyyy"),
      ];

      return {
        ...service,
        scheduleDates: dates,
        status: [false, false, false], // default not done
      };
    });

    setServices(schedules);
  }, [startDate]);

  // ----------------------------------------------------------
  // UPDATE HANDLERS
  // ----------------------------------------------------------
  const updateDate = (serviceIdx: number, dateIdx: number, newDate: string) => {
    setServices((prev) =>
      prev.map((s, i) =>
        i === serviceIdx
          ? {
              ...s,
              scheduleDates: s.scheduleDates.map((d, di) =>
                di === dateIdx ? newDate : d
              ),
            }
          : s
      )
    );
  };

  const toggleStatus = (serviceIdx: number, dateIdx: number) => {
    setServices((prev) =>
      prev.map((s, i) =>
        i === serviceIdx
          ? {
              ...s,
              status: s.status.map((st, si) =>
                si === dateIdx ? !st : st
              ),
            }
          : s
      )
    );
  };

  const handleSelectTech = (serviceIdx: number, tech: string) => {
    setServices((prev) =>
      prev.map((s, i) => (i === serviceIdx ? { ...s, technician: tech } : s))
    );
  };

  const handleAssign = (serviceIdx: number, dateIdx: number) => {
    const tech = services[serviceIdx].technician;
    if (!tech) return alert("Select technician first!");

    alert(
      `Assigned ${tech} for ${services[serviceIdx].name} on ${services[serviceIdx].scheduleDates[dateIdx]}`
    );
  };

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------
  return (
    <ContentLayout title={`Edit Subscription #${id}`}>
      {services.map((service, serviceIdx) => {
        const techList = mockTechnicians.filter(
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
                    <th className="py-2">Status</th>
                    <th className="py-2">Technician</th>
                    <th className="py-2 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {service.scheduleDates.map((date, dateIdx) => {
                    const formattedForInput = date.split("-").reverse().join("-");

                    return (
                      <tr key={dateIdx} className="border-b">
                        {/* Service Name */}
                        <td className="py-2 text-sm">{service.name}</td>

                        {/* Editable Date */}
                        <td className="py-2 text-sm">
                          <input
                            type="date"
                            className="border px-2 py-1 rounded w-[150px]"
                            value={formattedForInput}
                            onChange={(e) =>
                              updateDate(
                                serviceIdx,
                                dateIdx,
                                e.target.value.split("-").reverse().join("-")
                              )
                            }
                          />
                        </td>

                        {/* Status */}
                        <td className="py-2 text-center text-xl cursor-pointer">
                          <button
                            onClick={() => toggleStatus(serviceIdx, dateIdx)}
                            className={service.status[dateIdx]
                              ? "text-green-600"
                              : "text-red-500"}
                          >
                            {service.status[dateIdx] ? "✓" : "✕"}
                          </button>
                        </td>

                        {/* Technician Dropdown */}
                        <td className="py-2 w-[250px]">
                          <Select
                            value={service.technician || ""}
                            onValueChange={(v) =>
                              handleSelectTech(serviceIdx, v)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Technician" />
                            </SelectTrigger>

                            <SelectContent>
                              {techList.length > 0 ? (
                                techList.map((tech) => (
                                  <SelectItem
                                    key={tech.id}
                                    value={tech.name}
                                  >
                                    {tech.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem disabled value="none">
                                  No technicians for this service
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Assign button */}
                        <td className="py-2 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleAssign(serviceIdx, dateIdx)}
                            className="bg-red-600 text-white"
                          >
                            Assign
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}
    </ContentLayout>
  );
}
