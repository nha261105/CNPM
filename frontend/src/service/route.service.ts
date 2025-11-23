import axiosClient from "@/lib/axiosClient";

export interface Route {
    route_name: string;
    status: string;
    pickup_points: number[];
}

export const routeService = {
    getRoutes: async () => {
        const res = await axiosClient.get<{ok: boolean, data: any[]}>("api/routes");
        return res.data.data;
    },

    addRoute: async (routeData: Route) => {
        const res = await axiosClient.post<{ok: boolean, data: any}>("api/routes", routeData);
        return res.data.data;
    },

    deleteRoute: async (route_id: number) => {
        const res = await axiosClient.delete<{ok: boolean, data: any}>(`api/routes/${route_id}`);
        return res.data.data;
    },

    updateRoute: async (id: number, payload: any) => {
        const res = await axiosClient.put<{ok: boolean, data: any}>(`api/routes/${id}`, payload);  
        return res.data.data;
    }
}