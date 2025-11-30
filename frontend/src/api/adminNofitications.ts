import axiosClient from "@/lib/axiosClient";

export class adminNofitication {
  // gửi tin nhắn tới driver (receiver_id đang hard-code = 2 ở backend)
  static async sendMessageFromAdminToDriverApi(adminId: number, mes: string) {
    const res = await axiosClient.post(
      "/api/admin/nofitications/send/driver",
      {
        adminId,
        mes,
      }
    );
    return res.data;
  }

  // gửi tin nhắn tới parent (receiver_id đang hard-code = 3 ở backend)
  static async sendMessageFromAdminToParentApi(adminId: number, mes: string) {
    const res = await axiosClient.post(
      "/api/admin/nofitications/send/parent",
      {
        adminId,
        mes,
      }
    );
    return res.data;
  }

 
  static async getAllMessageWhileSendApi(id: number) {
    const res = await axiosClient.get(
      `/api/admin/nofitications/send/${id}`
    );
    return res.data;
  }
}
