import supabase from "../../config/supabaseClient.js";

// lấy danh sách driver (để admin chọn)
export async function getAllDrivers() {
  const { data: driver, error: driver_error } = await supabase
    .from("account")
    .select(`user_id , user_name , type_account (type_account_name)`)
    .eq("type_account_id", 2);
  if (driver_error) {
    throw new Error("Lỗi driver" + driver_error);
  }
  if (!driver) {
    return [];
  }
  return driver;
}

// Lấy danh sách routes (để admin chọn)
export async function getAllRoutes() {
  const { data: routes, error: router_error } = await supabase
    .from("routes")
    .select("*")
    .order("route_id", { ascending: false });
  if (router_error) {
    throw new Error("Lỗi Route" + router_error);
  }
  if (!routes) {
    return [];
  }
  return routes;
}

// Lấy danh sách buses (để admin chọn)
export async function getAllBuses() {
  const { data: bus, error: bus_error } = await supabase
    .from("bus")
    .select("*")
    .order("bus_id", { ascending: false });
  if (bus_error) {
    throw new Error("Lỗi Bus" + bus_error);
  }
  if (!bus) {
    return [];
  }
  return bus;
}

//Tạo schedule mới
function normalizeTime(timeStr: string): string {
  if (!timeStr) return timeStr;
  if (timeStr.split(":").length === 3) {
    return timeStr;
  }
  if (timeStr.split(":").length === 2) {
    return `${timeStr}:00`;
  }
  return timeStr;
}
export async function createSchedule(data: {
  bus_id: number;
  driver_id: number;
  route_id: number;
  schedule_date: string;
  start_time: string;
}) {
  if (
    !data.bus_id ||
    !data.driver_id ||
    !data.route_id ||
    !data.schedule_date ||
    !data.start_time
  ) {
    throw new Error("Thiếu dữ liệu trong create");
  }
  const normalizedTime = normalizeTime(data.start_time);
  const { data: exits } = await supabase
    .from("schedule")
    .select("*")
    .eq("driver_id", data.driver_id)
    .eq("route_id", data.route_id)
    .eq("schedule_date", data.schedule_date)
    .eq("bus_id", data.bus_id)
    .eq("start_time", normalizedTime)
    .eq("is_deleted", false)
    .single();
  if (exits) {
    throw new Error("Đã tồn tại dữ liệu này");
  }
  const { data: newSchedule, error: newSchedule_error } = await supabase
    .from("schedule")
    .insert([
      {
        driver_id: data.driver_id,
        bus_id: data.bus_id,
        schedule_date: data.schedule_date,
        route_id: data.route_id,
        start_time: normalizedTime,
        is_deleted: false,
      },
    ])
    .select()
    .single();
  if (newSchedule_error) {
    throw new Error(
      "Lỗi không thể insert new Schedule vào bảng " + newSchedule_error.message
    );
  }
  if (!newSchedule) {
    return [];
  }
  return newSchedule;
}

//Lấy tất cả schedules
function formatTime(timestamp: string): string {
  if (!timestamp) return "N/A";
  try {
    const timeMatch = timestamp.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const hours = timeMatch[1]?.padStart(2, "0");
      const minutes = timeMatch[2];
      return `${hours}:${minutes}`;
    }
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "N/A";
  } catch {
    return "N/A";
  }
}

async function hasTrackingInLast(
  busId: number,
  minute: number
): Promise<boolean> {
  const now = new Date();
  const limit = new Date(now);
  limit.setMinutes(limit.getSeconds() - minute);
  const { data, error } = await supabase
    .from("tracking_realtime")
    .select("timestamp")
    .eq("bus_id", busId)
    .gte("timestamp", limit.toISOString())
    .limit(1)
    .maybeSingle();
  if (error) {
    throw new Error("Loi kiem tra tracking realtime" + error);
  }
  return !!data;
}

async function calculateStatus(
  busId: number,
  scheduleDate: string,
  startTime: string,
  duration: number
): Promise<"scheduled" | "in_progress" | "completed"> {
  const scheduleStart = new Date(`${scheduleDate}T${startTime}+07:00`);
  const scheduleEnd = new Date(scheduleStart.getTime() + duration * 60000);
  const now = new Date();
  const hasRecentTracking = await hasTrackingInLast(busId, 0);
  if (now < scheduleStart) {
    return "scheduled";
  } else if (now >= scheduleEnd) {
    return "completed";
  }
  return hasRecentTracking ? "in_progress" : "scheduled";
}
// lấy thông tin tất cả lịch trình
export async function getAllSchedule(filter?: {
  date?: string;
  driver_id?: number;
  bus_id?: number;
  route_id?: number;
}) {
  let q = supabase
    .from("schedule")
    .select(
      `schedule_id, driver_id, bus_id, route_id, schedule_date, start_time, is_deleted, navigation_unlocked_at, manual_completed_at, bus (
        bus_id,
        license_plate_number
      ),
      routes (
        route_id,
        route_name,
        duration
      )`
    )
    .eq("is_deleted", false)
    .order("schedule_date", { ascending: false });
  if (
    filter?.date !== undefined &&
    filter.date !== null &&
    filter.date !== ""
  ) {
    q = q.eq("schedule_date", filter.date);
  }
  if (filter?.driver_id !== undefined && filter.driver_id !== null) {
    q = q.eq("driver_id", filter.driver_id);
  }
  if (filter?.bus_id !== undefined && filter.bus_id !== null) {
    q = q.eq("bus_id", filter.bus_id);
  }
  if (filter?.route_id !== undefined && filter.route_id !== null) {
    q = q.eq("route_id", filter.route_id);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const scheduleWithStatus = await Promise.all(
    (data || []).map(async (schedule: any) => {
      try {
        const duration = schedule.routes?.duration ?? 5;
        const scheduleStart = new Date(
          `${schedule.schedule_date}T${schedule.start_time}+07:00`
        );
        const now = new Date();
        const hasManualStart = !!schedule.navigation_unlocked_at;
        const hasManualCompleted = !!schedule.manual_completed_at;

        // Chỉ tính status từ calculateStatus nếu chưa có manual start
        // Nếu đã có manual start, status sẽ được set thành in_progress
        let calculatedStatus: "scheduled" | "in_progress" | "completed";
        try {
          calculatedStatus = await calculateStatus(
            schedule.bus_id,
            schedule.schedule_date,
            schedule.start_time,
            duration
          );
        } catch (error: any) {
          console.error(
            `Error calculating status for schedule ${schedule.schedule_id}:`,
            error
          );
          calculatedStatus = "scheduled";
        }

        // QUAN TRỌNG: Status chỉ là in_progress khi:
        // 1. Có manual start (driver đã bấm Start) → luôn in_progress, HOẶC
        // 2. Có tracking thực sự VÀ đã qua start_time VÀ không có manual start
        // Nếu chưa có manual start và now >= start_time nhưng không có tracking, vẫn giữ scheduled để cho phép navigation
        const finalStatus = hasManualCompleted
          ? "completed"
          : calculatedStatus === "completed"
          ? "completed"
          : hasManualStart
          ? "in_progress" // Driver đã bấm Start → luôn in_progress
          : now >= scheduleStart &&
            calculatedStatus === "in_progress" &&
            !hasManualStart
          ? "in_progress" // Có tracking thực sự nhưng chưa có manual start → in_progress
          : "scheduled"; // Chưa start hoặc chưa có tracking → scheduled (cho phép navigation)

        // Cho phép navigation khi:
        // 1. Đã có manual start (driver đã bấm Start), HOẶC
        // 2. Đã đến giờ khởi hành (now >= scheduleStart) và chưa completed
        const canNavigate =
          finalStatus === "completed"
            ? false
            : hasManualStart || now >= scheduleStart;

        console.log(
          `[Schedule ${
            schedule.schedule_id
          }] calculatedStatus: ${calculatedStatus}, finalStatus: ${finalStatus}, hasManualStart: ${hasManualStart}, scheduleStart: ${scheduleStart.toISOString()}, now: ${now.toISOString()}, canNavigate: ${canNavigate}`
        );

        const result = {
          schedule_id: schedule.schedule_id,
          schedule_key: `${schedule.driver_id}-${schedule.bus_id}-${schedule.route_id}-${schedule.schedule_date}`,
          driver_id: schedule.driver_id,
          bus_id: schedule.bus_id,
          bus_number: schedule.bus?.license_plate_number,
          route_id: schedule.route_id,
          route_name: schedule.routes?.route_name,
          schedule_date: schedule.schedule_date,
          time: formatTime(schedule.start_time),
          duration: duration,
          status: finalStatus,
          is_active: finalStatus === "in_progress",
          is_navigation_allowed: canNavigate,
          is_visible: finalStatus !== "completed",
          navigation_unlocked_at: schedule.navigation_unlocked_at,
          manual_completed_at: schedule.manual_completed_at,
        };
        return result;
      } catch (error: any) {
        console.error(
          `Error processing schedule ${schedule.schedule_id}:`,
          error
        );
        return {
          schedule_id: schedule.schedule_id,
          schedule_key: `${schedule.driver_id}-${schedule.bus_id}-${schedule.route_id}-${schedule.schedule_date}`,
          driver_id: schedule.driver_id,
          bus_id: schedule.bus_id,
          bus_number: schedule.bus?.license_plate_number || "",
          route_id: schedule.route_id,
          route_name: schedule.routes?.route_name,
          schedule_date: schedule.schedule_date,
          time: formatTime(schedule.start_time),
          duration: schedule.routes?.duration ?? 5,
          status: "scheduled" as const,
          is_active: false,
          is_navigation_allowed: false,
          is_visible: true,
          navigation_unlocked_at: schedule.navigation_unlocked_at,
          manual_completed_at: schedule.manual_completed_at,
        };
      }
    })
  );
  return scheduleWithStatus;
}

export async function unlockScheduleNavigation(
  scheduleId: number,
  driverId: number
) {
  if (!scheduleId || !driverId) {
    throw new Error("Thiếu thông tin schedule hoặc driver");
  }

  const { data: schedule, error } = await supabase
    .from("schedule")
    .select(
      "schedule_id, driver_id, navigation_unlocked_at, schedule_date, start_time"
    )
    .eq("schedule_id", scheduleId)
    .eq("driver_id", driverId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    throw new Error("Lỗi tìm lịch trình: " + error.message);
  }
  if (!schedule) {
    throw new Error("Không tìm thấy lịch trình cần cập nhật");
  }
  if (schedule.navigation_unlocked_at) {
    return schedule;
  }

  const { data: updated, error: updateError } = await supabase
    .from("schedule")
    .update({
      navigation_unlocked_at: new Date().toISOString(),
    })
    .eq("schedule_id", scheduleId)
    .eq("driver_id", driverId)
    .eq("is_deleted", false)
    .select(
      "schedule_id, driver_id, navigation_unlocked_at, schedule_date, start_time"
    )
    .maybeSingle();

  if (updateError) {
    throw new Error("Lỗi cập nhật navigation: " + updateError.message);
  }
  if (!updated) {
    throw new Error("Không thể cập nhật navigation cho lịch trình");
  }
  return updated;
}

export async function completeScheduleManually(
  scheduleId: number,
  driverId: number
) {
  if (!scheduleId || !driverId) {
    throw new Error("Thiếu thông tin schedule hoặc driver");
  }
  const { data: schedule, error } = await supabase
    .from("schedule")
    .select(
      "schedule_id, driver_id, navigation_unlocked_at, manual_completed_at"
    )
    .eq("schedule_id", scheduleId)
    .eq("driver_id", driverId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) {
    throw new Error("Lỗi tìm lịch trình: " + error.message);
  }
  if (!schedule) {
    throw new Error("Không tìm thấy lịch trình cần cập nhật");
  }

  if (schedule.manual_completed_at) {
    return schedule;
  }

  const { data: updated, error: updateError } = await supabase
    .from("schedule")
    .update({
      manual_completed_at: new Date().toISOString(),
    })
    .eq("schedule_id", scheduleId)
    .eq("driver_id", driverId)
    .eq("is_deleted", false)
    .select(
      "schedule_id, driver_id, navigation_unlocked_at, manual_completed_at"
    )
    .maybeSingle();

  if (updateError) {
    throw new Error("Lỗi cập nhật hoàn tất lịch trình: " + updateError.message);
  }
  if (!updated) {
    throw new Error("Không thể cập nhật hoàn tất lịch trình");
  }
  return updated;
}

// Xóa schedule
export async function deleteSchedule(
  driverId: number,
  busId: number,
  routeId: number,
  scheduleDate: string,
  startTime: string
) {
  const normalizedTime = normalizeTime(startTime);
  const { error } = await supabase
    .from("schedule")
    .update({ is_deleted: true })
    .eq("driver_id", driverId)
    .eq("bus_id", busId)
    .eq("route_id", routeId)
    .eq("schedule_date", scheduleDate)
    .eq("start_time", normalizedTime)
    .eq("is_deleted", false);
  if (error) {
    throw new Error("Lỗi xóa lịch trình: " + error.message);
  }
  return { success: true };
}

// Cập nhật lịch trình
//todo cần phải xử lí làm sao để cho thời gian mới không được < thời gian đi + thời gian đến khi đang ở trong lịch trình
export async function updateSchedule(
  old_data: {
    bus_id: number;
    driver_id: number;
    route_id: number;
    schedule_date: string;
    start_time: string;
  },
  new_data: {
    driver_id?: number;
    bus_id?: number;
    route_id?: number;
    schedule_date?: string;
    start_time?: string;
  }
) {
  const normalizedOldTime = normalizeTime(old_data.start_time);
  const normalizedNewTime = new_data.start_time
    ? normalizeTime(new_data.start_time)
    : normalizedOldTime;

  const finalDriverId = new_data.driver_id ?? old_data.driver_id;
  const finalBusId = new_data.bus_id ?? old_data.bus_id;
  const finalRouteId = new_data.route_id ?? old_data.route_id;
  const finalScheduleDate = new_data.schedule_date ?? old_data.schedule_date;
  const finalStartTime = normalizedNewTime;

  const isSameKey =
    finalDriverId === old_data.driver_id &&
    finalBusId === old_data.bus_id &&
    finalRouteId === old_data.route_id &&
    finalScheduleDate === old_data.schedule_date &&
    finalStartTime === normalizedOldTime;

  if (isSameKey) {
    return { message: "Không có thay đổi nào" };
  }

  const { data: oldRecord, error: findError } = await supabase
    .from("schedule")
    .select("*")
    .eq("driver_id", old_data.driver_id)
    .eq("bus_id", old_data.bus_id)
    .eq("route_id", old_data.route_id)
    .eq("schedule_date", old_data.schedule_date)
    .eq("start_time", normalizedOldTime)
    .eq("is_deleted", false)
    .maybeSingle();
  if (findError || !oldRecord) {
    throw new Error("Không tìm thấy lịch trình cần cập nhật");
  }
  const { data: existing } = await supabase
    .from("schedule")
    .select("*")
    .eq("driver_id", finalDriverId)
    .eq("bus_id", finalBusId)
    .eq("route_id", finalRouteId)
    .eq("schedule_date", finalScheduleDate)
    .eq("start_time", finalStartTime)
    .eq("is_deleted", false)
    .maybeSingle();

  if (existing) {
    const isSameRecord =
      existing.driver_id === old_data.driver_id &&
      existing.bus_id === old_data.bus_id &&
      existing.route_id === old_data.route_id &&
      existing.schedule_date === old_data.schedule_date &&
      existing.start_time === normalizedOldTime;

    if (!isSameRecord) {
      throw new Error("Lịch trình đã tồn tại");
    }
  }

  const { data: updatedSchedule, error: updateError } = await supabase
    .from("schedule")
    .update({
      driver_id: finalDriverId,
      bus_id: finalBusId,
      route_id: finalRouteId,
      schedule_date: finalScheduleDate,
      start_time: finalStartTime,
    })
    .eq("driver_id", old_data.driver_id)
    .eq("bus_id", old_data.bus_id)
    .eq("route_id", old_data.route_id)
    .eq("schedule_date", old_data.schedule_date)
    .eq("start_time", normalizedOldTime)
    .eq("is_deleted", false)
    .select()
    .maybeSingle();

  if (updateError) {
    throw new Error("Lỗi cập nhật lịch trình: " + updateError.message);
  }

  if (!updatedSchedule) {
    throw new Error("Không thể cập nhật lịch trình");
  }

  return updatedSchedule;
}
