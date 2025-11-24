import supabase from "../../config/supabaseClient.js";

export class TripHistoryService {
  static async getByStudentId(student_id: number) {
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .eq("student_id", student_id)
      .order("check_in_time", { ascending: false });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  static async getByParentId(parent_id: number) {
    // Lấy tất cả student_id của parent
    const { data: students, error: errStudents } = await supabase
      .from("students")
      .select("student_id")
      .eq("parent_id", parent_id);
    if (errStudents) return { success: false, message: errStudents.message };
    if (!students || students.length === 0) return { success: true, data: [] };
    const studentIds = students.map(
      (s: { student_id: number }) => s.student_id
    );
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .in("student_id", studentIds)
      .order("check_in_time", { ascending: false });
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }

  static async create(entry: any) {
    const { data, error } = await supabase
      .from("attendance_logs")
      .insert(entry)
      .select("*");
    if (error) return { success: false, message: error.message };
    return { success: true, data };
  }
}
