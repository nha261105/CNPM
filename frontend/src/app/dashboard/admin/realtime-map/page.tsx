"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { scheduleService, AdminScheduleWithStudents } from "@/api/schedule_admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Eye, Loader2 } from "lucide-react";

const DriverMap = dynamic(() => import("@/components/map/DriverMap"), {
  ssr: false,
});

interface Checkpoint {
  id: number;
  mark: string;
  location: string;
  time: string;
  student: number;
  lat?: number;
  lng?: number;
  student_id?: number;
  parent_id?: number;
  completed?: boolean;
}

export default function RealTimeMap() {
  const [selectedSchedule, setSelectedSchedule] = useState<AdminScheduleWithStudents | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);

  const school_toado = { lat: 10.76006, lng: 106.68229 };

  //  Query schedules
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["today-schedules"],
    queryFn: () => scheduleService.getTodaySchedulesWithStudents(),
    refetchInterval: 10000,
  });

  //  Build checkpoints khi chọn schedule (giống logic driver)
  useEffect(() => {
    if (!selectedSchedule || selectedSchedule.students.length === 0) {
      setCheckpoints([]);
      return;
    }

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const startPoint: Checkpoint = {
      id: 1,
      mark: "Đại học Sài Gòn (Điểm xuất phát)",
      location: "",
      time: selectedSchedule.time,
      student: 0,
      lat: school_toado.lat,
      lng: school_toado.lng,
      completed: selectedSchedule.status === "in_progress" || selectedSchedule.status === "completed",
    };

    const studentCheckpoints: Checkpoint[] = selectedSchedule.students
      .map((s: any) => {
        const pp = s?.pickup_point;
        if (!pp) return null;
        return {
          id: 0, // Sẽ gán lại sau khi sort
          mark: s.student_name,
          location: pp.description,
          time: selectedSchedule.time,
          student: 1,
          lat: Number(pp.latitude),
          lng: Number(pp.longitude),
          student_id: s.student_id,
          parent_id: s.parent_id,
          completed: false,
        };
      })
      .filter(Boolean) as Checkpoint[];

    // Sort theo khoảng cách
    const sortedStudentCheckpoints = [...studentCheckpoints].sort((a, b) => {
      if (!a.lat || !a.lng || !b.lat || !b.lng) return 0;
      const distA = calculateDistance(school_toado.lat, school_toado.lng, a.lat, a.lng);
      const distB = calculateDistance(school_toado.lat, school_toado.lng, b.lat, b.lng);
      return distA - distB;
    });

    sortedStudentCheckpoints.forEach((cp, index) => {
      cp.id = index + 2;
    });

    const endPoint: Checkpoint = {
      id: sortedStudentCheckpoints.length + 2,
      mark: "Đại học Sài Gòn (Điểm kết thúc)",
      location: "",
      time: selectedSchedule.time,
      student: 0,
      lat: school_toado.lat,
      lng: school_toado.lng,
      completed: selectedSchedule.status === "completed",
    };

    setCheckpoints([startPoint, ...sortedStudentCheckpoints, endPoint]);
  }, [selectedSchedule]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="space-y-6">
        {/* Map */}
        {selectedSchedule && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {selectedSchedule.bus_number} - {selectedSchedule.route_name}
                </CardTitle>
                <Button variant="outline" onClick={() => setSelectedSchedule(null)}>
                  Đóng
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Driver: {selectedSchedule.driver_name} | {selectedSchedule.schedule_date} - {selectedSchedule.time} |{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedSchedule.status === "in_progress"
                      ? "bg-green-100 text-green-700"
                      : selectedSchedule.status === "completed"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedSchedule.status}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              {/*  Dùng chung DriverMap với driver */}
              <DriverMap
                checkpoints={checkpoints}
                busId={selectedSchedule.bus_id}
                isNavigating={selectedSchedule.status === "in_progress"}
              />
            </CardContent>
          </Card>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch trình hôm nay ({schedules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có lịch trình nào</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div
                    key={`${schedule.schedule_id}-${schedule.schedule_key}`}
                    className="flex justify-between items-center border p-5 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex gap-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <Bus className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">
                          {schedule.bus_number} - {schedule.route_name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600">Driver: {schedule.driver_name}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              schedule.status === "in_progress"
                                ? "bg-green-100 text-green-700"
                                : schedule.status === "completed"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {schedule.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {schedule.schedule_date} - {schedule.time} | {schedule.students.length} students
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedSchedule(schedule)}>
                      <Eye className="mr-2" size={16} />
                      Xem
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
