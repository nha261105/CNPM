import axiosClient from "./axiosClient";

/**
 * Gọi OSRM qua backend proxy (tránh CORS)
 */
export async function getRouteFromOSRM(coords: [number, number][]) {
  try {
    // Convert [[lat,lng], [lat,lng]] → "lat,lng;lat,lng"
    const coordStr = coords.map(([lat, lng]) => `${lat},${lng}`).join(";");

    console.log("  Fetching route via backend proxy...");

    // Gọi backend thay vì trực tiếp OSRM
    const response = await axiosClient.get("/api/osrm/route", {
      params: { coords: coordStr },
    });

    const { coordinates } = response.data;

    console.log("Route fetched:", coordinates.length, "points");

    return coordinates as [number, number][];
  } catch (err: any) {
    console.error(" getRouteFromOSRM error:", err.response?.data || err.message);
    return null;
  }
}