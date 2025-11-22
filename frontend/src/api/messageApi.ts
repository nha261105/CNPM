import axiosClient from "@/lib/axiosClient";


export class MessageApi {
    static async getMessageByIdParent(idParent: number){
        const res = await axiosClient.get("/api/message", {
            params: { idParent: idParent }
        });
        return res.data;
    };
    
    static async sendMessageToAdminByIdParent(idParent: number, message: string){
        try {
            const res = await axiosClient.post("/api/message/send/parent", {
                idParent: idParent,
                message: message
            });
            return res.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if(error.response && !error.response.ok) throw new Error(error.response.data.error)
        }
    }
}