import axiosClient from "@/lib/axiosClient";

export const pickupService = {
    getAllPickup:  async () => {
        const res = await axiosClient.get<{ok: boolean, data: any[]}>("api/pickup_point");
        return res.data.data;
    }
}