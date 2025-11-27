import axiosClient from "@/lib/axiosClient";

export interface Schedule {
  schedule_key: string;
  schedule_date: string;
  time: string;
  bus_id: number;
  bus_number: string;
  route_id: number;
  driver_id: number;
  status: "scheduled" | "in_progress" | "completed";
  is_active: boolean;
}

export interface CreateSchedulePayload {
  bus_id: number;
  driver_id: number;
  route_id: number;
  schedule_date: string;
  start_time: string;
}

export interface UpdateSchedulePayload {
  old_data: CreateSchedulePayload;
  new_data: Partial<CreateSchedulePayload>;
}

export interface AdminScheduleWithStudents {
  schedule_id: number;
  schedule_key: string;
  driver_id: number;
  driver_name: string;
  bus_id: number;
  bus_number: string;
  route_id: number;
  route_name: string;
  schedule_date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed";
  students: Array<{
    student_id: number;
    parent_id: number;
    student_name: string;
    pickup_point: {
      pickup_point_id: number;
      latitude: string;
      longitude: string;
      description: string;
    };
  }>;
}

export const scheduleService = {
  getSchedules: async (filter?: {
    date?: string;
    driver_id?: number;
    bus_id?: number;
    route_id?: number;
  }) => {
    const params = new URLSearchParams();
    if (filter?.date) params.append("date", filter.date);
    if (filter?.driver_id)
      params.append("driver_id", filter.driver_id.toString());
    if (filter?.bus_id) params.append("bus_id", filter.bus_id.toString());
    if (filter?.route_id) params.append("route_id", filter.route_id.toString());
    const queryString = params.toString();
    const res = await axiosClient.get<{ success: boolean; data: Schedule[] }>(
      `api/schedule/admin/all${queryString ? `?${queryString}` : ""}`
    );
    return res.data.data;
  },

  getDrivers: async () => {
    const res = await axiosClient.get<{ success: boolean; data: any[] }>(
      `api/schedule/admin/drivers`
    );
    return res.data.data;
  },
  getBuses: async () => {
    const res = await axiosClient.get<{ success: boolean; data: any[] }>(
      `api/schedule/admin/buses`
    );
    return res.data.data;
  },
  getRoutes: async () => {
    const res = await axiosClient.get<{ success: boolean; data: any[] }>(
      `api/schedule/admin/routes`
    );
    return res.data;
  },
  createSchedule: async (payload: CreateSchedulePayload) => {
    const res = await axiosClient.post<{ success: boolean; data: Schedule }>(
      `api/schedule/admin`,
      payload
    );
    return res.data.data;
  },
  updateSchedule: async (data: UpdateSchedulePayload) => {
    const res = await axiosClient.put<{ success: boolean; data: Schedule }>(
      `api/schedule/admin`,
      data
    );
    return res.data.data;
  },
  deleteSchedule: async (data: CreateSchedulePayload) => {
    const params = new URLSearchParams({
      driver_id: data.driver_id.toString(),
      bus_id: data.bus_id.toString(),
      route_id: data.route_id.toString(),
      schedule_date: data.schedule_date,
      start_time: data.start_time,
    });

    const res = await axiosClient.delete<{ success: boolean; message: string }>(
      `api/schedule/admin?${params.toString()}`
    );
    return res.data;
  },

  /**
   *  Lấy schedules hôm nay kèm students (cho realtime map)
   */
  getTodaySchedulesWithStudents: async (): Promise<AdminScheduleWithStudents[]> => {
    const res = await axiosClient.get("/api/admin/realtime/schedules");
    return res.data.data;
  },
};
