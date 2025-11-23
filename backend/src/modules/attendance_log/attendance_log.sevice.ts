import supabase from "../../config/supabaseClient.js";
import type { AttendanceActionDto } from './attendance_log.dto.ts';

export const getAttendanceLogByStudentId = async (studentId: number) => {
    const { data, error } = await supabase
        .from("attendance_log")
        .select("*")
        .eq("student_id", studentId);
    if (error) {
        throw new Error(`Error fetching attendance log: ${error.message}`);
    }
    return data;
}

export const checkIn = async (payload: AttendanceActionDto) => {
    const { data, error } = await supabase
        .from('attendance_logs')
        .upsert({
            schedule_id: payload.schedule_id,
            student_id: payload.student_id,
            status: 'Boarded',
            check_in_time: new Date().toISOString(),
            check_in_lat: payload.latitude,
            check_in_lng: payload.longitude
        }, { onConflict: 'schedule_id, student_id' })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

export const checkOut = async (payload: AttendanceActionDto) => {
    const { data, error } = await supabase
        .from('attendance_logs')
        .update({
            status: 'Dropped',
            check_out_time: new Date().toISOString(),
            check_out_lat: payload.latitude,
            check_out_lng: payload.longitude
        }).match({
            student_id: payload.student_id,
            schedule_id: payload.schedule_id
        }).select().single();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}