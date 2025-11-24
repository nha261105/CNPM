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
import { useState, useEffect, useMemo } from "react";
import CheckpointsCard from "./CheckpointsCard";
import { useAuth } from "@/hooks/useAuth";
import { driverScheduleService, DriverSchedule } from "@/api/schedule_driver";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { latLng } from "leaflet";
import DriverMap from "@/components/map/DriverMap";
interface Checkpoint {
  id: number;
  mark: string;
  time: string;
  location: string;
  student: number;
  lat?: number;
  lng?: number;
  student_id?: number;
  parent_id?: number;
  completed?: boolean;
}
export default function ManagerMySchedule() {
  const VEHICLE_CHECK_KEY = "vehicle_check_completed";
  const { user } = useAuth();
  const [vehicleCheckCompleted, setVehicleCheckCompleted] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<DriverSchedule | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [progressUpdated, setProgressUpdated] = useState(false);
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
    const CheckVehicleStatus = () => {
      const saved = localStorage.getItem(VEHICLE_CHECK_KEY);
      if (saved) {
        try {
          const savedData = JSON.parse(saved);
          setVehicleCheckCompleted(savedData.completed === true);
        } catch (error) {
          setVehicleCheckCompleted(false);
        }
      } else setVehicleCheckCompleted(false);
    };
    CheckVehicleStatus();
  }, []);
  const school_toado = { lat: 10.76006, lng: 106.68229 };
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371000; // Bán kính Trái Đất (mét)
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
  useEffect(() => {
    if (schedules.length > 0 && !selectedSchedule) {
      const activeSchedule = schedules.find((s) => s.status === "in_progress");
      setSelectedSchedule(activeSchedule || schedules[0]);
    }
  }, [schedules, selectedSchedule]);

  useEffect(() => {
    if (selectedSchedule) {
      setIsNavigating(false);
      setSelectedId(null);
      setCheckpoints([]);
    }
  }, [selectedSchedule?.schedule_key]);
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
    const startPoint: Checkpoint = {
      id: 1,
      mark: "Đại học sài gòn (Điểm xuất phát)",
      location: "",
      time: selectedSchedule.time,
      student: 0,
      lat: school_toado.lat,
      lng: school_toado.lng,
      completed: false,
    };
    const studentCheckPoints: Checkpoint[] = students
      .map((s: any, index: number) => {
        const pp = s?.pickup_point;
        if (!pp) return null;
        return {
          id: index + 2,
          mark: s?.student_name,
          location: pp.description,
          time: selectedSchedule.time,
          student: 1,
          lat: Number(pp.latitude),
          lng: Number(pp.longitude),
          student_id: s?.student_id,
          parent_id: s?.parent_id,
          completed: false,
        };
      })
      .filter(Boolean) as Checkpoint[];
    const sortedStudentCheckpoints = [...studentCheckPoints].sort((a, b) => {
      if (!a.lat || !a.lng || !b.lat || !b.lng) return 0;
      const distA = calculateDistance(
        school_toado.lat,
        school_toado.lng,
        a.lat,
        a.lng
      );
      const distB = calculateDistance(
        school_toado.lat,
        school_toado.lng,
        b.lat,
        b.lng
      );
      return distA - distB;
    });
    sortedStudentCheckpoints.forEach((cp, index) => {
      cp.id = index + 2;
    });
    const endPoint: Checkpoint = {
      id: sortedStudentCheckpoints.length + 2,
      mark: "Đại học sài gòn (Điểm kết thúc)",
      location: "",
      lat: school_toado.lat,
      lng: school_toado.lng,
      time: selectedSchedule.time,
      student: 0,
    };
    setCheckpoints([startPoint, ...sortedStudentCheckpoints, endPoint]);
    setTotalStudents(students.length);
  }, [students, selectedSchedule]);

  const handleCheckpointComplete = (checkpointId: number) => {
    setCheckpoints((prev) => {
      const updated = prev.map((cp) =>
        cp.id === checkpointId
          ? {
              ...cp,
              completed: true,
            }
          : cp
      );
      const completedCount = updated.filter((cp) => cp.completed).length;
      return updated;
    });

    setProgressUpdated(true);
    setTimeout(() => {
      setProgressUpdated(false);
    }, 600);
  };

  const progress = useMemo(() => {
    if (checkpoints.length === 0) return 0;
    const completedCount = checkpoints.filter((cp) => cp.completed).length;
    const progressValue = Math.round(
      (completedCount / checkpoints.length) * 100
    );
    return progressValue;
  }, [checkpoints]);

  const totalStops = checkpoints.length;
  const completedStops = useMemo(() => {
    return checkpoints.filter((cp) => cp.completed).length;
  }, [checkpoints]);
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
                if (schedule) {
                  setSelectedSchedule(schedule);
                  setIsNavigating(false);
                  setSelectedId(null);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {schedules.map((schedule) => (
                <option
                  key={schedule.schedule_key}
                  value={schedule.schedule_key}
                >
                  {schedule.schedule_date} - {schedule.time} - Route{" "}
                  {schedule.route_id} ({schedule.status})
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
              <div className="relative">
                <Progress
                  key={`progress-${progress}-${completedStops}`}
                  value={progress}
                  className={`bg-gray-300 h-3 transition-all duration-300 ${
                    progressUpdated ? "animate-pulse scale-[1.02]" : "scale-100"
                  }`}
                  max={100}
                />
                {progressUpdated && (
                  <div className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
                )}
              </div>
              {/* Debug - để xem progress có cập nhật không */}
              <p className="text-xs text-gray-400">
                {progress}% ({completedStops}/{totalStops} stops completed)
              </p>
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
              <button
                onClick={() => {
                  if (!vehicleCheckCompleted) {
                    alert("vui lòng kiểm tra xe trước khi tiến hành chạy");
                    return;
                  }
                  if (!isNavigating) {
                    const startpoint = checkpoints.find((cp) => cp.id === 1);
                    if (startpoint) {
                      setSelectedId(startpoint.id);
                    }
                  }
                  setIsNavigating(!isNavigating);
                }}
                className={`rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer ${
                  isNavigating ? "bg-red-600" : "bg-green-600"
                }`}
              >
                <Navigation size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white">
                  {isNavigating ? "Stop Navigation" : "Start Navigation"}
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

        <Dialog open={openEmergency} onOpenChange={setOpenEmergency}></Dialog>

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
              checkpoints.map((checkpoint, index) => (
                <CheckpointsCard
                  key={index}
                  id={checkpoint.id}
                  mark={checkpoint.mark}
                  location={checkpoint.location}
                  time={checkpoint.time}
                  student={checkpoint.student}
                  completed={checkpoint.completed}
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
            <DriverMap
              checkpoints={checkpoints}
              busId={selectedSchedule?.bus_id || 0}
              isNavigating={isNavigating}
              onCheckpointComplete={handleCheckpointComplete}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
