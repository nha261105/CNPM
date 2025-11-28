"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Trash, PenBoxIcon, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  CreateSchedulePayload,
  Schedule,
  scheduleService,
} from "@/api/schedule_admin";
import ScheduleDialog from "./schedules.Dialog";

export default function ManagerSchedule() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      try {
        console.log("Fetching schedules...");
        const res = await scheduleService.getSchedules();
        console.log("Schedules fetched:", res);
        return res;
      } catch (err: any) {
        console.error("Error fetching schedules:", err);
        if (err.response?.status === 401) {
          throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
        }
        throw err;
      }
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const deleteMutation = useMutation({
    mutationFn: async (data: CreateSchedulePayload) => {
      const res = await scheduleService.deleteSchedule(data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error) => {
      console.error("lỗi khi xóa lịch trình:", error);
    },
  });

  const handleDelete = (schedule: Schedule) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch trình này?")) return;
    const parts = schedule.schedule_key.split("-");
    const driverId = Number(parts[0]);
    const busId = Number(parts[1]);
    const routeId = Number(parts[2]);
    const scheduleDate = parts.slice(3).join("-");

    deleteMutation.mutate({
      driver_id: Number(driverId),
      bus_id: Number(busId),
      route_id: Number(routeId),
      schedule_date: scheduleDate,
      start_time: schedule.time,
    });
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSchedule(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["schedules"] });
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === "in_progress" || isActive) {
      return (
        <Badge
          variant={"secondary"}
          className={cn(
            "text-white cursor-pointer",
            "bg-yellow-500 hover:bg-yellow-600"
          )}
        >
          In Progress
        </Badge>
      );
    }
    if (status === "completed") {
      return (
        <Badge
          variant={"secondary"}
          className={cn(
            "text-white cursor-pointer",
            "bg-green-500 hover:bg-green-600"
          )}
        >
          Completed
        </Badge>
      );
    }
    return (
      <Badge
        variant={"secondary"}
        className={cn(
          "text-white cursor-pointer",
          "bg-blue-500 hover:bg-blue-600"
        )}
      >
        Scheduled
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg font-medium ml-4">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <div className="text-red-500">Lỗi: {(error as any).message}</div>
        <Button
          type="button"
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["schedules"] })
          }
          className="mt-4"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="space-y-6">
          <Card className="rounded-xl border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Schedules</CardTitle>
                <Button
                  type="button"
                  variant={"secondary"}
                  className="bg-blue-500 hover:bg-blue-700 hover:text-white"
                  onClick={handleAddNew}
                >
                  <Calendar />
                  Add new Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có lịch trình nào
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Route ID</TableHead>
                      <TableHead>Driver ID</TableHead>
                      <TableHead>Bus</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={`${schedule.schedule_id}-${schedule.schedule_key}`}>
                        <TableCell>{schedule.schedule_date}</TableCell>
                        <TableCell>{schedule.route_id}</TableCell>
                        <TableCell>{schedule.driver_id}</TableCell>
                        <TableCell>
                          {schedule.bus_number || `Bus ${schedule.bus_id}`}
                        </TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>
                          {getStatusBadge(schedule.status, schedule.is_active)}
                        </TableCell>

                        <TableCell className="flex gap-2">
                          <Button
                            type="button"
                            variant={"secondary"}
                            className="hover:bg-orange-400 border border-gray-300"
                            onClick={() => handleEdit(schedule)}
                          >
                            <PenBoxIcon />
                          </Button>

                          <Button
                            type="button"
                            variant={"secondary"}
                            className="hover:bg-red-500 border border-gray-300"
                            onClick={() => handleDelete(schedule)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleDialog
        open={dialogOpen}
        mode={dialogMode}
        initData={selectedSchedule}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
