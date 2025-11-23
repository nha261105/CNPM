import { json } from "zod";
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

export const updatePickUp = async(pickup_point_id: number, latitude: number, longitude: number, description: string) => {
    const newData = {
        pickup_point_id: pickup_point_id,
        latitude: latitude,
        longitude: longitude,
        description: description
    }
    const {data, error} = await supabase.from('pickup_point').update(newData).eq('pickup_point_id', pickup_point_id).select("pickup_point_id, latitude, longitude, description");
    if(error) throw new Error(error.message)
    return data;
}