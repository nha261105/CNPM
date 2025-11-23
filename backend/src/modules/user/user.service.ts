import supabase from "../../config/supabaseClient.js";

export const getUsers = async () => {
    const { data, error } = await supabase
        .from("user")
        .select(`
            *,
            account (*),               
            type_user (type_user_name) 
        `).is('is_delete', false); 

    if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
    }
    const result = data.map((user: any) => ({
        ...user,
        ...(user.account ? user.account : {}),
        type_user_name: user.type_user?.type_user_name,
        account: undefined, 
        type_user: undefined
    }));

    return result;
}

export const updateUser = async (id: number, updateData: Partial<{ name: string; phone_number: string; email: string; }>) => {
    const { data, error } = await supabase
        .from("user")
        .update(updateData)
        .eq("user_id", id);
    if (error) {
        throw new Error(`Error updating user: ${error.message}`);
    }

    return data;
}

export const addUser = async (userData: Partial<{ name: string; phone_number: string; email: string; type_user_id: number}>) => {
    const { data, error } = await supabase
        .from("user")
        .insert([{
            type_user_id: userData.type_user_id, 
            name: userData.name, 
            phone_number: userData.phone_number, 
            email: userData.email
        }])
        .select().single();
    if (error) {
        throw new Error(`Error adding user: ${error.message}`);
    }   
    return data;
}

export const deleteUser = async (id: number) => {
    const {data, error} = await supabase
        .from("user")
        .update({is_delete: true})
        .eq("user_id", id);
    if (error) {
        throw new Error(`Error deleting user: ${error.message}`);
    }
    return data;
}