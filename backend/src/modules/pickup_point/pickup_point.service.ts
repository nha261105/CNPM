import supabase from "../../config/supabaseClient.js";

export const getAllPickup = async () => {
    const {data, error} = await supabase
        .from('pickup_point')
        .select('*')
    if (error) {
        throw new Error(`Error fetching pickup points: ${error.message}`);
    }
    return data;
}