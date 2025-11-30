"use client";
import dynamic from "next/dynamic";
import { Navigation, TriangleAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
const DriverMap = dynamic(() => import("@/components/map/DriverMap"), {
  ssr: false,
});
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useMemo, useRef } from "react";
import CheckpointsCard from "./CheckpointsCard";
import { useAuth } from "@/hooks/useAuth";
import { driverScheduleService, DriverSchedule } from "@/api/schedule_driver";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import { MessageApi } from "@/api/messageApi";
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
  const [selectedScheduleKey, setSelectedScheduleKey] = useState<string | null>(
    null
  );
  const [isNavigating, setIsNavigating] = useState(false);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [progressUpdated, setProgressUpdated] = useState(false);
  const [navigationActionLoading, setNavigationActionLoading] = useState(false);
  const {
    data: schedules = [],
    isLoading: schedulesLoading,
    refetch: refetchSchedules,
  } = useQuery({
    queryKey: ["driver-schedules", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const data = await driverScheduleService.getTodaySchedule(
        Number(user.id)
      );
      console.log("thong tin lich trinh", data);
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 5000,
    staleTime: 0,
    gcTime: 0,
  });
  const visibleSchedules = useMemo(
    () => schedules.filter((s) => s.is_visible),
    [schedules]
  );
  const schedulePool = visibleSchedules;
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
    if (schedulePool.length === 0) {
      setSelectedScheduleKey(null);
      return;
    }

    if (!selectedScheduleKey) {
      const activeSchedule =
        schedulePool.find((s) => s.status === "in_progress") || schedulePool[0];
      setSelectedScheduleKey(activeSchedule.schedule_key);
      return;
    }

    const stillExists = schedulePool.some(
      (s) => s.schedule_key === selectedScheduleKey
    );
    if (!stillExists) {
      setSelectedScheduleKey(schedulePool[0].schedule_key);
    }
  }, [schedulePool, selectedScheduleKey]);

  const currentSchedule = useMemo(() => {
    if (schedulePool.length === 0) return null;
    if (selectedScheduleKey) {
      const found = schedulePool.find(
        (s) => s.schedule_key === selectedScheduleKey
      );
      if (found) return found;
    }
    return schedulePool[0];
  }, [schedulePool, selectedScheduleKey]);

  useEffect(() => {
    if (currentSchedule) {
      setIsNavigating(false);
      setSelectedId(null);
      setCheckpoints([]);
    }
  }, [currentSchedule?.schedule_key]);
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["schedule-students", currentSchedule?.bus_id],
    queryFn: async () => {
      if (!currentSchedule?.bus_id) return [];
      const res = await axiosClient.get(
        `/api/admin/realtime/${currentSchedule.bus_id}/students`
      );
      return res?.data?.data ?? [];
    },
    enabled: !!currentSchedule?.bus_id,
  });
  useEffect(() => {
    if (students.length === 0 || !currentSchedule) {
      return;
    }
    const startPoint: Checkpoint = {
      id: 1,
      mark: "Đại học sài gòn (Điểm xuất phát)",
      location: "",
      time: currentSchedule.time,
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
          time: currentSchedule.time,
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
      time: currentSchedule.time,
      student: 0,
      completed: false,
    };
    setCheckpoints([startPoint, ...sortedStudentCheckpoints, endPoint]);
    setTotalStudents(students.length);
  }, [students, currentSchedule]);

  const completeCurrentSchedule = async () => {
    if (!currentSchedule || completionTriggeredRef.current) return;
    completionTriggeredRef.current = true;
    try {
      await driverScheduleService.completeSchedule(currentSchedule.schedule_id);
      await refetchSchedules();
      setIsNavigating(false);
      setSelectedId(null);

      toast.success("Đã hoàn thành chuyến đi", {
        description: `Chuyến đi ${
          currentSchedule.route_name || `Route ${currentSchedule.route_id}`
        } đã được hoàn tất thành công.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Không thể hoàn tất chuyến đi", error);
      completionTriggeredRef.current = false;
      toast.error("Lỗi", {
        description: "Không thể hoàn tất chuyến đi. Vui lòng thử lại.",
      });
    }
  };

  const handleCheckpointComplete = async (
    checkpointId: number,
    parent_id?: number
  ) => {
    let allCompleted = false;
    setCheckpoints((prev) => {
      const updated = prev.map((cp) =>
        cp.id === checkpointId
          ? {
              ...cp,
              completed: true,
            }
          : cp
      );

      let endpoint = updated.find(
        (cp) =>
          cp.mark.includes("Điểm kết thúc") || cp.mark.includes("kết thúc")
      );
      if (!endpoint) {
        const maxId = Math.max(...updated.map((cp) => cp.id));
        endpoint = updated.find(
          (cp) => cp.id === maxId && cp.student === 0 && cp.id !== 1
        );
        if (endpoint) {
          console.log(`maxId: ${endpoint.id} - "${endpoint.mark}"`);
        }
      }

      const startpoint = updated.find((cp) => cp.id === 1);
      const studentCheckpoints = updated.filter(
        (cp) => cp.student_id && cp.id !== 1 && cp.id !== endpoint?.id
      );

      const completedCount = updated.filter((cp) => cp.completed).length;
      const totalCount = updated.length;
      const allStudentsCompleted = studentCheckpoints.every(
        (cp) => cp.completed
      );

      if (!endpoint) {
        // khong phai diem cuoi cung thi chua the complete
        allCompleted = false;
      } else {
        // endpoint -> complete
        const endpointCompleted = endpoint.completed === true;

        if (!endpointCompleted) {
          allCompleted = false;
        } else {
          // kiem tra them di duoc tat ca cac point chua
          const allCheckpointsCompleted = updated.every((cp) => {
            const isCompleted = cp.completed === true;
            return isCompleted;
          });

          allCompleted = endpointCompleted && allCheckpointsCompleted;

          if (allCompleted) {
            console.log(
              "[ALL COMPLETED] Tất cả checkpoints đã hoàn thành, bao gồm endpoint!"
            );
          } else {
            console.log(
              `[NOT READY] Endpoint: ${
                endpointCompleted ? "ok" : "khong ok"
              }, All checkpoints: ${
                allCheckpointsCompleted ? "ok" : "khong ok"
              }`
            );
          }
        }
      }

      return updated;
    });
    if (parent_id && currentSchedule) {
      const checkpoint = checkpoints.find((cp) => cp.id === checkpointId);
      if (
        parent_id &&
        currentSchedule &&
        checkpoint &&
        checkpoint.student_id &&
        checkpoint.mark
      ) {
        try {
          await MessageApi.sendMessageToParentByDriver(
            currentSchedule.driver_id,
            parent_id,
            checkpoint.mark
          );
          toast.success(
            `Đã gửi thông báo đến cho phụ huynh ${checkpoint.mark}`
          );
        } catch (error) {}
      }
    }

    setProgressUpdated(true);
    setTimeout(() => {
      setProgressUpdated(false);
    }, 600);
    if (allCompleted) {
      console.log(
        "[SCHEDULE COMPLETE] Tất cả checkpoints đã hoàn thành, bao gồm endpoint, đang kết thúc chuyến đi..."
      );
      completeCurrentSchedule();
    } else {
      console.log(
        "[CONTINUE] Vẫn còn checkpoints chưa hoàn thành, tiếp tục..."
      );
    }
  };

  const handleNavigationToggle = async () => {
    if (!currentSchedule) return;
    if (!vehicleCheckCompleted) {
      alert("Vui lòng kiểm tra xe trước khi tiến hành chạy");
      return;
    }

    if (!isNavigating) {
      setNavigationActionLoading(true);
      try {
        await driverScheduleService.startSchedule(currentSchedule.schedule_id);
        navigationUnlockedRef.current = true;
        await refetchSchedules();
        const startpoint = checkpoints.find((cp) => cp.id === 1);
        if (startpoint) {
          setSelectedId(startpoint.id);
        }
        setIsNavigating(true);
      } catch (error) {
        console.error("Không thể bắt đầu chuyến đi", error);
        alert("Không thể bắt đầu chuyến đi, vui lòng thử lại.");
      } finally {
        setNavigationActionLoading(false);
      }
      return;
    }

    setIsNavigating(false);
    setSelectedId(null);
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
  const navigationDisabled =
    !currentSchedule?.is_navigation_allowed ||
    currentSchedule?.status === "completed";
  const startTimeTimeoutRef = useRef<number | null>(null);
  const navigationUnlockedRef = useRef(false);
  const completionTriggeredRef = useRef(false);

  useEffect(() => {
    if (!currentSchedule) {
      navigationUnlockedRef.current = false;
      completionTriggeredRef.current = false;
      return;
    }
    navigationUnlockedRef.current = !!currentSchedule.navigation_unlocked_at;
    completionTriggeredRef.current = !!currentSchedule.manual_completed_at;
  }, [
    currentSchedule?.schedule_key,
    currentSchedule?.navigation_unlocked_at,
    currentSchedule?.manual_completed_at,
  ]);
  useEffect(() => {
    const timeoutId = startTimeTimeoutRef.current;
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      startTimeTimeoutRef.current = null;
    }
    if (!currentSchedule) return;

    if (currentSchedule.is_navigation_allowed) {
      navigationUnlockedRef.current = true;
    }

    const normalizedTime = currentSchedule.time.includes(":")
      ? currentSchedule.time.split(":").length === 2
        ? `${currentSchedule.time}:00`
        : currentSchedule.time
      : `${currentSchedule.time}:00`;
    const scheduleStartDateTime = new Date(
      `${currentSchedule.schedule_date}T${normalizedTime}`
    );
    if (navigationUnlockedRef.current) {
      return;
    }

    const diff = scheduleStartDateTime.getTime() - Date.now();

    if (currentSchedule.status !== "scheduled") {
      return;
    }

    if (diff <= 0) {
      refetchSchedules();
      navigationUnlockedRef.current = true;
      return;
    }

    const id = window.setTimeout(() => {
      refetchSchedules();
      navigationUnlockedRef.current = true;
      startTimeTimeoutRef.current = null;
    }, diff);
    startTimeTimeoutRef.current = id;
  }, [
    currentSchedule?.schedule_key,
    currentSchedule?.status,
    currentSchedule?.schedule_date,
    currentSchedule?.time,
    refetchSchedules,
  ]);
  if (schedulesLoading) {
    return (
      <section className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </section>
    );
  }
  if (schedulePool.length === 0) {
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
  if (!currentSchedule) {
    return null;
  }

  const navigationLabel =
    currentSchedule?.status === "completed"
      ? "Đã hoàn thành"
      : currentSchedule?.status === "in_progress"
      ? "Đang chạy"
      : "Chờ khởi hành";

  return (
    <section className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="space-y-6">
        {schedulePool.length > 1 && currentSchedule && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-sm font-medium mb-2 block">
              Chọn lịch trình:
            </label>
            <select
              value={currentSchedule.schedule_key}
              onChange={(e) => {
                setSelectedScheduleKey(e.target.value);
                setIsNavigating(false);
                setSelectedId(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {schedulePool.map((schedule) => (
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
                <Badge
                  variant={
                    currentSchedule.status === "in_progress"
                      ? "default"
                      : currentSchedule.status === "completed"
                      ? "secondary"
                      : "outline"
                  }
                  className="mt-2 w-fit"
                >
                  {/* {navigationLabel} */}
                </Badge>
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
                onClick={handleNavigationToggle}
                disabled={navigationDisabled || navigationActionLoading}
                className={`rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer ${
                  navigationDisabled || navigationActionLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : isNavigating
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                <Navigation size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white">
                  {navigationActionLoading
                    ? "Đang xử lý..."
                    : isNavigating
                    ? "Stop Navigation"
                    : "Start Navigation"}
                </p>
              </button>
              {navigationDisabled && (
                <p className="text-sm text-muted-foreground max-w-xs">
                  Chức năng điều hướng sẽ bật khi đến giờ khởi hành của chuyến.
                </p>
              )}
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
              busId={currentSchedule?.bus_id || 0}
              isNavigating={isNavigating}
              onCheckpointComplete={handleCheckpointComplete}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
