import axiosClient from "@/lib/axiosClient";

export const routeService = {
    getRoutes: async () => {
        const res = await axiosClient.get<{ok: boolean, data: any[]}>("api/routes");
        return res.data.data;
    }  
}