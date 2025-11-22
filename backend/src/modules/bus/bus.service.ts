import { da } from "zod/locales";
import supabase from "../../config/supabaseClient.js";

export const getAllBus = async () => {
    const { data: buses, error: busesError } = await supabase
        .from('bus')
        .select(`
            *
            `).is('is_delete', false).order('bus_id', { ascending: true });
    if (busesError) {
        throw new Error(`Error fetching bus: ${busesError.message}`);
    }

    return buses;
}

export const updateBus = async (bus_id : number, updateData: Partial<{ license_plate_number : string;
                number_of_seats: number;
                bus_status: string }>) => {
    const {data, error} = await supabase
        .from('bus')
        .update(updateData)
        .eq('bus_id', bus_id);
    if (error) {
        throw new Error(`Error updating bus: ${error.message}`);
    }
    return data;
}   

export const addBus = async (busData: Partial<{license_plate_number : string, number_of_seats: number, status: string}>) => {
    const {data, error} = await supabase
        .from('bus')
        .insert([{
            license_plate_number: busData.license_plate_number,
            number_of_seats: busData.number_of_seats,
            status: busData.status
        }]).select().single();
    if (error) {
        throw new Error(`Error adding bus: ${error.message}`);
    }
    return data;
}

export const deleteBus = async (bus_id : number) => {
    const { data, error } = await supabase
        .from('bus')
        .update({ is_delete: true })
        .eq('bus_id', bus_id);
    if (error) {
        throw new Error(`Error delete bus: ${error.message}`)
    }
    return data;
}