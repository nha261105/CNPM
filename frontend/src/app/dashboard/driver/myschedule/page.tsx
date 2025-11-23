"use client";
import dynamic from "next/dynamic";
import { Navigation, TriangleAlert,Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import CheckpointsCard from "./CheckpointsCard";
import { useAuth } from "@/hooks/useAuth";
import { driverScheduleService, DriverSchedule } from "@/api/schedule_driver";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { latLng } from "leaflet";
interface Checkpoint {
  id: number;
  mark: string;
  time: string;
  location: string;
  student: number;
  lat?: number;
  lng?: number;
}
export default function ManagerMySchedule() {
  const { user } = useAuth();
  const [selectedSchedule, setSelectedSchedule] =
    useState<DriverSchedule | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const { data: schedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ["driver-schedules", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return driverScheduleService.getTodaySchedule(Number(user.id));
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
  useEffect(() => {
    if (schedules.length > 0 && !selectedSchedule) {
      const activeSchedule = schedules.find((s) => s.status === "in_progress");
      setSelectedSchedule(activeSchedule || schedules[0]);
    }
  }, [schedules, selectedSchedule]);
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["schedule-students", selectedSchedule?.bus_id],
    queryFn: async () => {
      if (!selectedSchedule?.bus_id) return [];
      const res = await axiosClient.get(
        `/api/admin/realtime/${selectedSchedule.bus_id}/students`
      );
      return res?.data?.data ?? [];
    },
    enabled: !!selectedSchedule?.bus_id,
  });
  useEffect(() => {
    if (students.length === 0 || !selectedSchedule) {
      // setCheckpoints([]);
      return;
    }
    const schoolCheckPoints: Checkpoint = {
      id: 0,
      mark: "Đại học sài gòn",
      location: "",
      time: selectedSchedule.time,
      student: 0,
    };
    const studentCheckPoints: Checkpoint[] = students
      .map((s: any, index: number) => {
        const pp = s?.pickup_point;
        if (!pp) return null;
        return {
          id: index + 1,
          mark: s?.student_name,
          location: pp.description,
          time: selectedSchedule.time,
          student: 1,
          lat: Number(pp.latitude),
          lng: Number(pp.longitude),
        };
      })
      .filter(Boolean) as Checkpoint[];
    setCheckpoints([
      schoolCheckPoints,
      ...studentCheckPoints,
      schoolCheckPoints,
    ]);
    setTotalStudents(students.length);
  }, [students, selectedSchedule]);
  const totalStops = checkpoints.length;
  const completedStops = Math.floor((progress / 100) * totalStops);
  if (schedulesLoading) {
    return (
      <section className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </section>
    );
  }
  if (schedules.length === 0) {
    return (
      <section className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <p className="text-xl font-medium text-gray-600">
            Không có lịch trình nào cho hôm nay
          </p>
        </div>
      </section>
    );
  }
  const currentSchedule = selectedSchedule || schedules[0];

  return (
    <section className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="space-y-6">
        {/* Schedule Selector */}
        {schedules.length > 1 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-sm font-medium mb-2 block">
              Chọn lịch trình:
            </label>
            <select
              value={currentSchedule.schedule_key}
              onChange={(e) => {
                const schedule = schedules.find(
                  (s) => s.schedule_key === e.target.value
                );
                setSelectedSchedule(schedule || null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {schedules.map((schedule) => (
                <option
                  key={schedule.schedule_key}
                  value={schedule.schedule_key}
                >
                  {schedule.schedule_date} - {schedule.time} - Route{" "}
                  {schedule.route_id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-gray-300 border-l-5 border-l-green-600">
          <div className="flex flex-col gap-4 p-8">
            <div className="text-xl font-medium">Today's Route Progress</div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between gap-4">
                <p className="text-md font-medium">Route Completion</p>
                <p className="text-md font-medium">
                  {completedStops} / {totalStops} stops
                </p>
              </div>
              <Progress value={progress} className="bg-gray-300 h-2" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Route</p>
                <p className="font-normal text-xl">
                  {currentSchedule.route_name ||
                    `Route ${currentSchedule.route_id}`}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Bus Number</p>
                <p className="font-normal text-xl">
                  {currentSchedule.bus_number}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Time</p>
                <p className="font-normal text-xl">{currentSchedule.time}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Students</p>
                <p className="font-normal text-xl">
                  {students.length} passengers
                </p>
              </div>
            </div>
            <div className="flex flex-start gap-4 mt-4">
              <button className="bg-green-600 rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer">
                <Navigation size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white">
                  Start Navigation
                </p>
              </button>
              <button
                onClick={() => setOpenEmergency(true)}
                className="bg-red-700 rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer"
              >
                <TriangleAlert size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white">
                  Report Emergency
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Dialog - giữ nguyên code cũ */}
        <Dialog open={openEmergency} onOpenChange={setOpenEmergency}>
          {/* ... existing emergency dialog code ... */}
        </Dialog>

        <div className="grid grid-cols-2 gap-8">
          <div className="shadow-lg rounded-xl border border-gray-300 p-8 flex flex-col gap-4">
            <p className="text-xl font-medium">Route Checkpoints</p>
            {studentsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : checkpoints.length === 0 ? (
              <p className="text-gray-500 text-center">
                Không có checkpoint nào
              </p>
            ) : (
              checkpoints.map((checkpoint) => (
                <CheckpointsCard
                  key={checkpoint.id}
                  id={checkpoint.id}
                  mark={checkpoint.mark}
                  location={checkpoint.location}
                  time={checkpoint.time}
                  student={checkpoint.student}
                  selected={selectedId === checkpoint.id}
                  onSelect={() =>
                    setSelectedId((prev) =>
                      prev === checkpoint.id ? null : checkpoint.id
                    )
                  }
                />
              ))
            )}
          </div>
          <div className="shadow-lg rounded-xl border border-gray-300 p-8 flex flex-col gap-4">
            <p className="text-xl font-medium">Route Map</p>
            <MapClient />
          </div>
        </div>
      </div>
    </section>
  );
}
