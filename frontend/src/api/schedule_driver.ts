import axiosClient from "@/lib/axiosClient";

export interface DriverSchedule {
  schedule_key: string;
  schedule_id: number;
  driver_id: number;
  bus_id: number;
  bus_number: string;
  route_id: number;
  route_name?: string;
  schedule_date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed";
  is_active: boolean;
}

export const driverScheduleService = {
  getMySchedules: async (driverId: number, date?: string) => {
    const params = new URLSearchParams();
    params.append("driver_id", driverId.toString());
    if (date) params.append("date", date);
    const res = await axiosClient.get<{
      success: boolean;
      data: DriverSchedule[];
    }>(`api/schedule/driver/my-schedules?${params.toString()}`);
    return res.data.data;
  },

  getTodaySchedule: async (driverId: number) => {
    const today = new Date().toISOString().split("T")[0];
    return driverScheduleService.getMySchedules(driverId, today);
  },
};
