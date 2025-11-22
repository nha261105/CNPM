import supabase from "../../config/supabaseClient.js";

// export const getUsers = async () => {
//     const { data: users, error } = await supabase
//         .from("user")
//         .select("*");
//     if (error) {
//         throw new Error(`Error fetching users: ${error.message}`);
//     }  
//     const {data: accounts, error: accountError} = await supabase
//         .from("account")
//         .select('*');
//     if (accountError) {
//         throw new Error(`Error fetching accounts: ${accountError.message}`);
//     }

//     const { data: typeUsers, error: typeUserError } = await supabase
//         .from("type_user")
//         .select("*");
//     if (typeUserError) {
//         throw new Error(`Error fetching type users: ${typeUserError.message}`);
//     }

//     const mergedArray = users.map(user => {
//         const account = accounts.find(acc => acc.user_id === user.user_id);
//         return { ...user, ...account };
//     });

//     const result = mergedArray.map(user => {
//         const typeUser = typeUsers.find(tu => tu.type_user_id === user.type_user_id);
//         return { ...user, type_user_name: typeUser ? typeUser.type_user_name : null };
//     });

//     return result;
// }

export const getUsers = async () => {
    // Cú pháp select relation của Supabase
    const { data, error } = await supabase
        .from("user")
        .select(`
            *,
            account (*),               
            type_user (type_user_name) 
        `); 
        // Giải thích:
        // account (*): Lấy tất cả cột của bảng account liên quan
        // type_user (type_user_name): Chỉ lấy cột tên của bảng type_user

    if (error) {
        throw new Error(`Error fetching users: ${error.message}`);
    }

    // Supabase trả về dạng lồng nhau (Nested Object)
    // Ví dụ: { name: "A", account: { balance: 100 }, type_user: { type_user_name: "Admin" } }
    
    // Nếu bạn muốn làm phẳng (Flat) object giống hệt code cũ của bạn:
    const result = data.map((user: any) => ({
        ...user,
        // Bóc tách dữ liệu từ object con ra ngoài (nếu có)
        ...(user.account ? user.account : {}), // Gộp field của account vào user
        type_user_name: user.type_user?.type_user_name, // Lấy tên type ra
        
        // Xóa các key thừa sau khi gộp (tuỳ chọn)
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
