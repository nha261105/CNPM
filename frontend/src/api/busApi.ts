import axiosClient from "@/lib/axiosClient";

export class BusApi {
  // Lấy thông tin bus và vị trí realtime dựa vào parent_id
  static async getBusLocationByParentId(parent_id: number) {
    const res = await axiosClient.get("/api/bus/location", {
      params: { parent_id },
    });
    return res.data;
  }
}
