import axiosClient from "@/lib/axiosClient";

export class AttendanceLogApi {
    static async checkIn(schedule_id: number, student_id: number) {
        const res = await axiosClient.post("/api/attendance-log/check-in", {
            schedule_id,
            student_id,
        });
        return res.data;
    }

    static async checkOut(schedule_id: number, student_id: number) {
        const res = await axiosClient.patch("/api/attendance-log/check-out", {
            schedule_id,
            student_id,
        });
        return res.data;
    }
}