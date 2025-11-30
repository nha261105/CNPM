import axiosClient from "@/lib/axiosClient";

export interface DriverSchedule {
  schedule_id: number;
  schedule_key: string;
  driver_id: number;
  bus_id: number;
  bus_number: string;
  route_id: number;
  route_name?: string;
  schedule_date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed";
  is_active: boolean;
  is_navigation_allowed: boolean;
  is_visible: boolean;
  navigation_unlocked_at?: string | null;
  manual_completed_at?: string | null;
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
    const now = new Date();
    const localISODate = new Date().toLocaleDateString("en-CA");
    return driverScheduleService.getMySchedules(driverId, localISODate);
  },

  startSchedule: async (scheduleId: number) => {
    await axiosClient.post(`/api/schedule/driver/${scheduleId}/start`);
  },

  completeSchedule: async (scheduleId: number) => {
    await axiosClient.post(`/api/schedule/driver/${scheduleId}/complete`);
  },
};
