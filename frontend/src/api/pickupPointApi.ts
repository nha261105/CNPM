import axiosClient from "@/lib/axiosClient";

export class PickupPointApi {
    static async updatePickUp(pickup_point_id: number, latitude: number, longitude: number, description: string){
        try {
            const res = await axiosClient.post("/api/pickup_point/update", {
                pickup_point_id: pickup_point_id,
                latitude: latitude,
                longitude: longitude,
                description: description,
            });
            return res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if(error.response && !error.response.ok) throw new Error(error.response.data.error)
            else throw new Error(error.message)
        }
    }
}