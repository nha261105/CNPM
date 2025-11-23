import axiosClient from "@/lib/axiosClient";

export interface User {
    user_id: number;
    type_user_id: number;
    name: string;
    phone_number: string;
    email: string;
    user_name: string;
    type_account_id: number;
    password: string;
    account_status: string;
    type_user_name: string;
}

export interface CreateUserPayload {
    name: string;
    phone_number: string;
    email: string;
    type_user_id: number;
}

export const userService = {
    getUsers: async () => {
        const res = await axiosClient.get<{ ok: boolean; data: User[] }>(
            "api/users"
        );
        return res.data.data;
    },

    updateUser: async (id: number, updateData: Partial<{ name: string; phone_number: string; email: string; }>) => {
        const res = await axiosClient.put<{ok: boolean, data: User}>(`api/users/${id}`, updateData);
        return res.data.data;
    }, 

    addUser: async (userData: CreateUserPayload) => {
        const res = await axiosClient.post<{ ok: boolean; data: CreateUserPayload}>("api/users", userData);
        return res.data.data;
    }, 
    
    deleteUser: async (id: number) => {
        const res = await axiosClient.delete<{ ok: boolean, data: User }>(`api/users/${id}`);
        return res.data.data;
    }

}