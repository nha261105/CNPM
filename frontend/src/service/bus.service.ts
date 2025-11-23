import axiosClient from "@/lib/axiosClient";

export interface bus {
    bus_id: number;
    license_plate_number: string;
    number_of_seats: number;
    status: string;

}

export const busService = {
    getBuses: async () => {
        const res = await axiosClient.get<{ ok: boolean, data: any[] }> (
            "api/bus"
        )
        return res.data.data;
    },

    updateBus: async (bus_id: number, updateData: Partial<{ license_plate_number: string; number_of_seats: number; status: string }>) => {
        const res = await axiosClient.put<{ ok: boolean, data: any }>(
            `api/bus/${bus_id}`, 
            updateData
        );
        return res.data.data;
    }, 
    
    addBus: async (busData: Partial<{ license_plate_number: string; number_of_seats: number; status: string}>) => {
        const res = await axiosClient.post<{ ok: boolean, data: any }>(
            "api/bus",
            busData
        );
        return res.data.data;
    }, 

    deleteBus: async (bus_id: number) => {
        const res = await axiosClient.delete<{ ok: boolean, data: any }>(
            `api/bus/${bus_id}`
        );
        return res.data.data;
    }
}