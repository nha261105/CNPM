import {
  handleTracking,
  getCurrrentPosition,
  getAllCurrentPos,
  getStudentWithPosition,
} from "../tracking/tracking.service.js";
import supabase from "../../config/supabaseClient.js";

export async function createTrackingRecord(payload: {
  bus_id: number;
  latitude: number;
  longitude: number;
}) {
  await handleTracking(payload);
  return true;
}

export async function fetchCurrentPosition(busdId: number) {
  return await getCurrrentPosition(busdId);
}

export async function fetchAllCurrentPositions() {
  return await getAllCurrentPos();
}

export async function fetchAllStudentInRoute(busId: number) {
  return await getStudentWithPosition(busId);
}

/**
 *  Lấy schedules hôm nay kèm students & checkpoints (dùng chung logic với driver)
 */
export async function getTodaySchedulesForAdmin() {
  const today = new Date().toISOString().split("T")[0];

  // Query schedules hôm nay
  const { data: schedules, error } = await supabase
    .from("schedule")
    .select(
      `
      schedule_id,
      driver_id,
      bus_id,
      route_id,
      schedule_date,
      start_time,
      bus!inner (
        bus_id,
        license_plate_number
      ),
      routes!inner (
        route_id,
        route_name
      )
    `
    )
    .eq("schedule_date", today)
    .eq("is_deleted", false)
    .order("start_time", { ascending: true });

  if (error) {
    console.error(" Query schedules error:", error);
    throw new Error(error.message);
  }

  if (!schedules || schedules.length === 0) {
    console.log(" No schedules found for today");
    return [];
  }

  console.log(` Found ${schedules.length} schedules`);

  // Calculate status cho từng schedule
  const schedulesWithData = await Promise.all(
    schedules.map(async (s: any) => {
      try {
        // Query driver info riêng
        const { data: driverData } = await supabase
          .from("account")
          .select("user_id, user_name")
          .eq("user_id", s.driver_id)
          .single();

        // Calculate status
        const now = new Date();
        const threeMinutesAgo = new Date(now);
        threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3);

        const { data: tracking } = await supabase
          .from("tracking_realtime")
          .select("timestamp")
          .eq("bus_id", s.bus_id)
          .gte("timestamp", threeMinutesAgo.toISOString())
          .limit(1)
          .maybeSingle();

        let status: "scheduled" | "in_progress" | "completed" = "scheduled";
        if (tracking) {
          status = "in_progress";
        } else {
          const scheduleDateTime = new Date(
            `${s.schedule_date}T${s.start_time}`
          );
          if (scheduleDateTime < now) {
            status = "completed";
          }
        }

        // Query students cho bus này
        const { data: students } = await supabase
          .from("students")
          .select(
            `
            student_id,
            parent_id,
            student_name,
            pickup_point_id
          `
          )
          .eq("bus_id", s.bus_id);

        // Query pickup points cho students
        const studentsWithPickupPoints = await Promise.all(
          (students || []).map(async (student: any) => {
            if (!student.pickup_point_id) {
              return {
                ...student,
                pickup_point: null,
              };
            }

            const { data: pickupPoint } = await supabase
              .from("pickup_point")
              .select("pickup_point_id, latitude, longitude, description")
              .eq("pickup_point_id", student.pickup_point_id)
              .single();

            return {
              ...student,
              pickup_point: pickupPoint,
            };
          })
        );

        console.log(
          `✅ Schedule ${s.schedule_id}: ${studentsWithPickupPoints.length} students`
        );

        return {
          schedule_id: s.schedule_id,
          schedule_key: `${s.driver_id}-${s.bus_id}-${s.route_id}-${s.schedule_date}`,
          driver_id: s.driver_id,
          driver_name: driverData?.user_name || "N/A",
          bus_id: s.bus_id,
          bus_number: s.bus?.license_plate_number || "N/A",
          route_id: s.route_id,
          route_name: s.routes?.route_name || "N/A",
          schedule_date: s.schedule_date,
          time: formatTime(s.start_time),
          status,
          students: studentsWithPickupPoints,
        };
      } catch (err: any) {
        console.error(
          `❌ Error processing schedule ${s.schedule_id}:`,
          err.message
        );
        return null;
      }
    })
  );

  const filtered = schedulesWithData.filter((item) => item !== null);
  console.log(`✅ Total schedules: ${filtered.length}`);

  return filtered;
}

function formatTime(timestamp: string): string {
  if (!timestamp) return "N/A";
  try {
    const timeMatch = timestamp.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (timeMatch) {
      const hours = timeMatch[1]?.padStart(2, "0");
      const minutes = timeMatch[2];
      return `${hours}:${minutes}`;
    }
    return "N/A";
  } catch {
    return "N/A";
  }
}
