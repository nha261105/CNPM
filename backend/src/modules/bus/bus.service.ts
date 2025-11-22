// Lấy vị trí bus động theo parent_id
export const getBusLocationByParentIdService = async (parent_id: number) => {
  // 1. Lấy student theo parent_id
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("bus_id")
    .eq("parent_id", parent_id)
    .limit(1)
    .single();
  if (studentsError || !students) return null;
  const bus_id = students.bus_id;
  if (!bus_id) return null;

  // 2. Lấy thông tin bus
  const { data: bus, error: busError } = await supabase
    .from("bus")
    .select("bus_id, license_plate_number, number_of_seats, status")
    .eq("bus_id", bus_id)
    .single();
  if (busError || !bus) return null;

  // 3. Lấy vị trí realtime
  const { data: tracking, error: trackingError } = await supabase
    .from("tracking_realtime")
    .select("latitude, longitude")
    .eq("bus_id", bus_id)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  if (trackingError || !tracking) return null;

  // 4. Lấy tài xế (driver) từ schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from("schedule")
    .select("driver_id")
    .eq("bus_id", bus_id)
    .order("schedule_date", { ascending: false })
    .limit(1)
    .single();
  let driver_name = "";
  if (schedule && schedule.driver_id) {
    const { data: driver, error: driverError } = await supabase
      .from("user")
      .select("name")
      .eq("user_id", schedule.driver_id)
      .single();
    if (!driverError && driver) driver_name = driver.name;
  }

  // 5. Tính ETA giả lập (có thể cải tiến sau)
  const eta = "3 minutes";

  return {
    bus_id,
    license_plate_number: bus.license_plate_number,
    number_of_seats: bus.number_of_seats,
    status: bus.status,
    latitude: tracking.latitude,
    longitude: tracking.longitude,
    driver_name,
    eta,
  };
};
import supabase from "../../config/supabaseClient.js";

export const getAllBus = async () => {
  const { data: buses, error: busesError } = await supabase.from("schedule")
    .select(`
            *, 
            bus (
                bus_id,
                license_plate_number,
                number_of_seats,
                status
            ),
            user (
                user_id,
                name,
                phone_number
            )
        `);
  if (busesError) {
    throw new Error(`Error fetching bus: ${busesError.message}`);
  }

  return buses;
};

export const updateBus = async (
  bus_id: number,
  updateData: Partial<{
    license_plate_number: string;
    number_of_seats: number;
    bus_status: string;
  }>
) => {
  const { data, error } = await supabase
    .from("bus")
    .update(updateData)
    .eq("bus_id", bus_id);
  if (error) {
    throw new Error(`Error updating bus: ${error.message}`);
  }
  return data;
};

export const addBus = async (
  busData: Partial<{ license_plate_number: string; number_of_seat: number }>
) => {
  const { data, error } = await supabase
    .from("bus")
    .insert([
      {
        license_plate_number: busData.license_plate_number,
        number_of_seats: busData.number_of_seat,
      },
    ])
    .select()
    .single();
  if (error) {
    throw new Error(`Error adding bus: ${error.message}`);
  }
  return data;
};
