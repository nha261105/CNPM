import supabase from "../../config/supabaseClient.js";

export const MessageService = {
  async getMessageByIdParent(idParent: number) {
    try {
      const { data, error } = await supabase
        .from("message")
        .select(
          `
        message_id,
        message_content,
        send_time,
        sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
        receiver_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name))
        `
        )
        .or(`sender_id.eq.${idParent}, receiver_id.eq.${idParent}`)
        .order("message_id", { ascending: false });
      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }
      return data;
    } catch (error) {
      const err = error as Error
      return {
        success: false,
        message: err.message,
      };
    }
  },

  // Để set id message tăng dần sau khi update cần thực hiện 2 bước trên csdl
  // SELECT pg_get_serial_sequence('message', 'message_id');  =====> RETURN {VALUE}
  // SELECT setval('VALUE', (SELECT MAX(message_id) FROM message));
  async sendMessageToAdminByIdParent(idParent: number, message: string){
    try {
      const newData = {
        sender_id: idParent,
        receiver_id: 1,
        message_content: message
      }
      const {data, error} = await supabase.from("message").insert(newData).select(
                  `
        message_id,
        message_content,
        send_time,
        sender_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name)),
        receiver_id(type_user!type_user_id(type_user_id, type_user_name), account!user_id(user_id, user_name))
        `
      )
      if(error) return { success: false, message: error };
      return data
    } catch (error) {
      return { success: false, message: error };
    }
  }
}
