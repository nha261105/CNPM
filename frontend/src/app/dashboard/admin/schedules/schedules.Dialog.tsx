"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  CreateSchedulePayload,
  UpdateSchedulePayload,
  Schedule,
  scheduleService,
} from "@/api/schedule_admin";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SchedulesDialogProps {
  open: boolean;
  mode: "add" | "edit";
  initData: Schedule | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function ScheduleDialog({
  open,
  mode,
  initData,
  onOpenChange,
  onSuccess,
}: SchedulesDialogProps) {
  const [fromData, setFromData] = useState<CreateSchedulePayload>({
    bus_id: 0,
    driver_id: 0,
    route_id: 0,
    schedule_date: "",
    start_time: "",
  });
  const normalizeTime = (timeStr: string): string => {
    if (!timeStr) return timeStr;
    // Nếu đã có format HH:MM:SS, giữ nguyên
    if (timeStr.split(":").length === 3) {
      return timeStr;
    }
    // Nếu là HH:MM, thêm :00
    if (timeStr.split(":").length === 2) {
      return `${timeStr}:00`;
    }
    return timeStr;
  };
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateSchedulePayload, string>>
  >({});
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["drives"],
    queryFn: () => scheduleService.getDrivers(),
    enabled: open,
  });
  const { data: buses = [], isLoading: busesLoading } = useQuery({
    queryKey: ["buses"],
    queryFn: () => scheduleService.getBuses(),
    enabled: open,
  });
  const { data: routesData, isLoading: routesLoading } = useQuery({
    queryKey: ["routes"],
    queryFn: () => scheduleService.getRoutes(),
    enabled: open,
  });

  const routes = routesData?.data || [];
  useEffect(() => {
    if (open) {
      if (mode === "add") {
        setFromData({
          driver_id: 0,
          bus_id: 0,
          route_id: 0,
          schedule_date: "",
          start_time: "",
        });
        setErrors({});
      } else if (mode === "edit" && initData) {
        const [driverId, busId, routeId, scheduleDate] =
          initData.schedule_key.split("-");
        setFromData({
          driver_id: Number(driverId),
          bus_id: Number(busId),
          route_id: Number(routeId),
          schedule_date: initData.schedule_date,
          start_time: initData.time,
        });
        setErrors({});
      }
    }
  }, [open, mode, initData]);
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateSchedulePayload, string>> = {};
    if (!fromData.driver_id || fromData.driver_id === 0) {
      newErrors.driver_id = "Vui lòng chọn tài xế";
    }
    if (!fromData.bus_id || fromData.bus_id === 0) {
      newErrors.bus_id = "Vui lòng chọn xe bus";
    }
    if (!fromData.route_id || fromData.route_id === 0) {
      newErrors.route_id = "Vui lòng chọn tuyến đường";
    }
    if (!fromData.schedule_date) {
      newErrors.schedule_date = "Vui lòng chọn ngày";
    }
    if (!fromData.start_time) {
      newErrors.start_time = "Vui lòng nhập giờ khởi hành";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      if (mode === "add") {
        const payload = {
          ...fromData,
          start_time: normalizeTime(fromData.start_time),
        };
        await scheduleService.createSchedule(payload);
      } else if (mode === "edit") {
        const parts = initData!.schedule_key.split("-");
        const driverId = Number(parts[0]);
        const busId = Number(parts[1]);
        const routeId = Number(parts[2]);

        const scheduleDate = parts.slice(3).join("-");
        const originalStartTime = normalizeTime(initData!.time);
        const old_data: CreateSchedulePayload = {
          driver_id: Number(driverId),
          bus_id: Number(busId),
          route_id: Number(routeId),
          schedule_date: scheduleDate,
          start_time: originalStartTime,
        };
        const new_data: Partial<CreateSchedulePayload> = {};
        if (fromData.driver_id !== old_data.driver_id) {
          new_data.driver_id = fromData.driver_id;
        }
        if (fromData.bus_id !== old_data.bus_id) {
          new_data.bus_id = fromData.bus_id;
        }
        if (fromData.route_id !== old_data.route_id) {
          new_data.route_id = fromData.route_id;
        }
        const normalizedNewTime = normalizeTime(fromData.start_time);
        if (normalizedNewTime !== originalStartTime) {
          new_data.start_time = normalizedNewTime;
        }
        if (fromData.schedule_date !== old_data.schedule_date) {
          new_data.schedule_date = fromData.schedule_date;
        }
        const updatePayload: UpdateSchedulePayload = {
          old_data,
          new_data: Object.keys(new_data).length > 0 ? new_data : {},
        };
        await scheduleService.updateSchedule(updatePayload);
      }
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (error: any) {
      alert(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu lịch trình"
      );
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Thêm lịch trình mới" : "Chỉnh sửa lịch trình"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-col gap-2">
            <Label>Tài xế *</Label>
            <Select
              value={fromData.driver_id.toString()}
              onValueChange={(value) =>
                setFromData({ ...fromData, driver_id: Number(value) })
              }
            >
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn tài xế" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                {driversLoading ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : (
                  drivers.map((driver: any) => (
                    <SelectItem
                      key={driver.user_id}
                      value={driver.user_id.toString()}
                    >
                      {driver.user_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.driver_id && (
              <p className="text-sm text-red-500">{errors.driver_id}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Xe bus *</Label>
            <Select
              value={fromData.bus_id.toString()}
              onValueChange={(value) =>
                setFromData({ ...fromData, bus_id: Number(value) })
              }
            >
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn xe bus" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                {busesLoading ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : (
                  buses.map((bus: any) => (
                    <SelectItem key={bus.bus_id} value={bus.bus_id.toString()}>
                      {bus.license_plate_number || `Bus ${bus.bus_id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.bus_id && (
              <p className="text-sm text-red-500">{errors.bus_id}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Tuyến đường *</Label>
            <Select
              value={fromData.route_id.toString()}
              onValueChange={(value) =>
                setFromData({ ...fromData, route_id: Number(value) })
              }
            >
              <SelectTrigger className="w-full bg-gray-50 border-gray-100 rounded-lg">
                <SelectValue placeholder="Chọn tuyến đường" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 bg-gray-50">
                {routesLoading ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : (
                  routes.map((route: any) => (
                    <SelectItem
                      key={route.route_id}
                      value={route.route_id.toString()}
                    >
                      {route.route_name || `Route ${route.route_id}`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.route_id && (
              <p className="text-sm text-red-500">{errors.route_id}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ngày *</Label>
            <Input
              type="date"
              value={fromData.schedule_date}
              onChange={(e) =>
                setFromData({ ...fromData, schedule_date: e.target.value })
              }
              className="bg-gray-50 border-gray-100 rounded-lg"
            />
            {errors.schedule_date && (
              <p className="text-sm text-red-500">{errors.schedule_date}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Giờ khởi hành * (HH:MM)</Label>
            <Input
              type="time"
              value={fromData.start_time}
              onChange={(e) =>
                setFromData({ ...fromData, start_time: e.target.value })
              }
              className="bg-gray-50 border-gray-100 rounded-lg"
            />
            {errors.start_time && (
              <p className="text-sm text-red-500">{errors.start_time}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="bg-red-500"
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600"
            disabled={driversLoading || busesLoading || routesLoading}
          >
            {driversLoading || busesLoading || routesLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang tải...
              </>
            ) : mode === "add" ? (
              "Thêm"
            ) : (
              "Lưu"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
