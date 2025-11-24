"use client";
import { DriverSchedule, driverScheduleService } from "@/api/schedule_driver";
import { CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2 } from "lucide-react";
import { useMemo } from "react";

export default function ManagerDayRoutes() {
  const { user } = useAuth();
  const { data: schedule = [], isLoading } = useQuery({
    queryKey: ["driver-day-schedules", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return driverScheduleService.getTodaySchedule(Number(user?.id));
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });
  const sortedSchedules = useMemo(() => {
    return [...schedule].sort((a, b) => {
      const timeA = a.time;
      const timeB = b.time;
      return timeA.localeCompare(timeB);
    });
  }, [schedule]);
  const getStatusBadge = (status: DriverSchedule["status"]) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="rounded-xl bg-blue-500 text-white px-4 py-2 text-sm font-semibold">
            Đang lên lịch
          </span>
        );
      case "in_progress":
        return (
          <span className="rounded-xl bg-yellow-500 text-white px-4 py-2 text-sm font-semibold">
            Đang thực hiện
          </span>
        );
      case "completed":
        return (
          <span className="rounded-xl bg-green-600 text-white px-4 py-2 text-sm font-semibold">
            Hoàn thành
          </span>
        );
      default:
        return (
          <span className="rounded-xl bg-gray-400 text-white px-4 py-2 text-sm font-semibold">
            Không rõ
          </span>
        );
    }
  };
  const formatTime12h = (time24h: string) => {
    if (!time24h) return "N/A";
    try {
      const [hours, minutes] = time24h.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return time24h;
    }
  };
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (schedule.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 flex flex-col gap-6">
            <p className="text-xl font-semibold leading-none tracking-tight">
              Lịch trình trong ngày
            </p>
          </div>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">
                Không có lịch trình nào cho hôm nay
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm ">
        <div className="p-6 flex flex-col gap-6">
          <p className="text-xl font-semibold leading-none tracking-tight">
            Lịch trình trong ngày
          </p>
        </div>
        <CardContent className="flex flex-col gap-6">
          {sortedSchedules.map((schedule) => (
            <div
              className="flex flex-col bg-white p-4 rounded-lg shadow border border-gray-200"
              key={schedule.schedule_key}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex flex-row gap-4">
                  <div
                    className={`shadow-md rounded-lg p-4 ${
                      schedule.status === "in_progress"
                        ? "text-green-600 bg-green-50"
                        : schedule.status === "completed"
                        ? "text-gray-600 bg-gray-50"
                        : "text-blue-600 bg-blue-50"
                    }`}
                  >
                    <Clock />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-semibold mb-1">
                      {schedule.route_name || `Route ${schedule.route_id}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Bus: {schedule.bus_number || `Bus ${schedule.bus_id}`}
                    </p>
                    {/* {getStopsCount(schedule) !== "-" && (
                      <p className="text-sm text-gray-600">
                        Stops: {getStopsCount(schedule)}
                      </p>
                    )} */}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end gap-2">
                  <p className="text-lg font-semibold mr-3">
                    {formatTime12h(schedule.time)}
                  </p>
                  {getStatusBadge(schedule.status)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </div>
    </div>
  );
}
