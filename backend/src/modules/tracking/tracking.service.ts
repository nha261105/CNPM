import supabase from "../../config/supabaseClient.js";

type tracking_realtime = {
  bus_id: number;
  latitude: number;
  longitude: number;
  route_id?: number;
};

async function broadcastPosition(
  busId: number,
  latitude: number,
  longitude: number,
  time: string
) {
  try {
    const chanel = supabase.channel(`tracking-bus-${busId}`);
    await chanel.subscribe();
    await chanel.send({
      type: "broadcast",
      event: "position_update",
      payload: {
        bus_id: busId,
        latitude,
        longitude,
        time,
      },
    });
  } catch (error) {
    console.error("Broadcast lỗi:", error);
  }
}

type LastPos = { lat: number; lng: number; time: Date };

const lastPositions = new Map<number, LastPos>();
/**
 * Manhattan Distance (nhanh hơn, đủ cho check di chuyển)
 * Chỉ dùng khi khoảng cách ngắn (< 10km)
 */
function calculateManhattanDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Chuyển đổi sang km (xấp xỉ)
  // 1 độ latitude ≈ 111 km
  // 1 độ longitude ≈ 111 km * cos(latitude)
  const R = 111; // km per degree (xấp xỉ)
  const dLat = Math.abs(lat2 - lat1) * R;
  const dLon =
    Math.abs(lon2 - lon1) * R * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  return dLat + dLon; // Manhattan: |x1-x2| + |y1-y2|
}


export async function handleTracking(data: tracking_realtime) {
  const now = new Date().toISOString();
  await broadcastPosition(data.bus_id, data.latitude, data.longitude, now);
  const lastPos = lastPositions.get(data.bus_id);
  let shouldSave = false;
  if (!lastPos) {
    shouldSave = true;
  } else {
    const dist = calculateManhattanDistance(
      lastPos.lat,
      lastPos.lng,
      data.latitude,
      data.longitude
    );
    if (dist > 0.1) {
      shouldSave = true;
    } else {
      const threeMinuteAgo = new Date();
      threeMinuteAgo.setMinutes(threeMinuteAgo.getMinutes() - 3);
      if (new Date(lastPos.time) < threeMinuteAgo) {
        shouldSave = true;
      }
    }
  }
  if (shouldSave) {
    const threeMinuteAgo = new Date();
    threeMinuteAgo.setMinutes(threeMinuteAgo.getMinutes() - 3);
    const { data: lastRecord } = await supabase
      .from("tracking_realtime")
      .select("timestamp")
      .eq("bus_id", data.bus_id)
      .gte("timestamp", threeMinuteAgo.toISOString())
      .limit(1)
      .single();
    if (!lastRecord) {
      await supabase.from("tracking_realtime").insert([
        {
          bus_id: data.bus_id,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: now,
        },
      ]);
      lastPositions.set(data.bus_id, {
        lat: data.latitude,
        lng: data.longitude,
        time: new Date(),
      });
    }
  }
}

export async function getCurrrentPosition(busId: number) {
  const { data, error } = await supabase
    .from("tracking_realtime")
    .select("*")
    .eq("bus_id", busId)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  if (error) throw new Error(error.message);
  const latestPositions = new Map();
  data?.forEach((record: any) => {
    if (!latestPositions.has(record.bus_id)) {
      latestPositions.set(record.bus_id, record);
    }
  });

  return Array.from(latestPositions.values());
}

export async function getAllCurrentPos() {
  const { data, error } = await supabase
    .from("tracking_realtime")
    .select("*")
    .order("timestamp", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function getStudentWithPosition(busId: number) {
  const { data, error } = await supabase
    .from("students")
    .select(`*, pickup_point:pickup_point_id(latitude,longitude)`)
    .eq("bus_id", busId);

  if (error) {
    console.error("get student error: ", error);
    return [];
  }

  console.log("danh sach student co pickup point: ", data);

  return data || [];
}
