import { success } from "zod";
import supabase from "../../config/supabaseClient.js";

export async function sendMessageFromAdminToDriver(
  adminId: number,
  mes: string
) {
  try {
    const new_nofitications = {
      sender_id: adminId,
      receiver_id: 2,
      message_content: mes,
    };
    const { data, error } = await supabase
      .from("message")
      .insert(new_nofitications)
      .select(
        `
                message_id,
                message_content,
                send_time,
                sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
                receiver_id(type_user!type_user_id(type_user_id,type_user_name), account!user_id(user_id, user_name))
            `
      );
    if (error) return { success: false, message: error };
    return data;
  } catch (err) {
    return { success: false, message: err };
  }
}

export async function sendMessageFromAdminToParent(
  adminId: number,
  mes: string
) {
  try {
    const new_nofitications = {
      sender_id: adminId,
      receiver_id: 3,
      message_content: mes,
    };
    const { data, error } = await supabase
      .from("message")
      .insert(new_nofitications)
      .select(
        `
                message_id,
                message_content,
                send_time,
                sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
                receiver_id(type_user!type_user_id(type_user_id,type_user_name), account!user_id(user_id, user_name))
            `
      );
    if (error) return { success: false, message: error };
    return data;
  } catch (err) {
    return { success: false, message: err };
  }
}

export async function getAllMessageWhileSend(id: number) {
  try {
    const { data, error } = await supabase
      .from("message")
      .select(
        `
            message_id,
            message_content,
            send_time,
            sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id,user_name)),
            receiver_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name))
        `
      )
      .or(`sender_id.eq.${id}, receiver_id.eq.${id} `)
      .order("message_id", { ascending: false });

    if (error) return { success: false, message: error.message };
    return data;
  } catch (error) {
    const err = error as Error;
    return { success: false, message: err.message };
  }
}
