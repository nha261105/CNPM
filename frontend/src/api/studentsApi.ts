import axiosClient from "@/lib/axiosClient";


export class StudentsApi {
    static async getStudentsByIdParent(idParent: number){
        const res = await axiosClient.get("/api/students", {
            params: { idParent }
        });
        return res.data;
    }

    static async sendMessageToAdminByIdParent(idParent: number, message: string){
        const res = await axiosClient.get("/api/students", {
            params: { idParent, message }
        });
        return res.data;
    }
}