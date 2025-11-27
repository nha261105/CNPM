import axiosClient from "@/lib/axiosClient";

export class driverReports {
  static async sendMessageFromDriverToAdmin(driverId: number, mes: string) {
    const res = await axiosClient.post(
      "/api/driver/reports/admin",
      {
        driverId,
        mes,
      }
    );
    return res.data;
  }

 
  static async getAllReportFromAdmin(driverId: number) {
    const res = await axiosClient.get(
      `/api/driver/reports/admin/${driverId}`
    );
    return res.data;
  }
}
