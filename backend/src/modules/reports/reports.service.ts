import supabase from "../../config/supabaseClient.js";

export async function sendReportFromDriverToAdmin(
  driverId: number,
  mes: string
) {
  try {
    const new_report = {
      sender_id: driverId,
      receiver_id: 1,
      message_content: mes,
    };
    const { data, error } = await supabase
      .from("message")
      .insert(new_report)
      .select(
        `
                message_id,
                message_content,
                send_time,
                sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
                receiver_id(type_user!type_user_id(type_user_id,type_user_name), account!user_id(user_id, user_name))
            `
      );

    if (error) return { success: false, error: error.message };
    return data;
  } catch (err) {
    return { success: false, err };
  }
}

export async function getAllReportFromAdmin(adminId: number) {
  try {
    const { data, error } = await supabase
      .from("message")
      .select(
        `
                message_id,
                message_content,
                send_time,
                sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
                receiver_id(type_user!type_user_id(type_user_id,type_user_name), account!user_id(user_id, user_name))
            `
      )
      .eq("receiver_id", adminId)
      .order("message_id", { ascending: false });
    if (error) return { success: false, error: error.message };
    return data;
  } catch (err) {
    return { success: false, err };
  }
}
