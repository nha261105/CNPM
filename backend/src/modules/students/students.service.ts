import supabase from "../../config/supabaseClient.js";

export class StudentsService {
  static async getStudentsByIdParent(idParent: number) {
    try {
      const { data, error } = await supabase.from("students")
      .select(` 
        student_id, 
        parent_id,
        student_name,
        pickup_point(pickup_point_id,latitude,longitude,description),
        bus(bus_id,license_plate_number,number_of_seats)
      `)
      .eq("parent_id", idParent)
      if (error) {
        return {
          success: false,
          message: error,
        };
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error,
      };
    }
  }
}
