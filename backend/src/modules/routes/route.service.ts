import { pick } from "zod/mini";
import supabase from "../../config/supabaseClient.js";

export const getAllRoutes = async () => {
    const { data, error } = await supabase
        .from('routes')
        .select(`
            route_id,
            route_name,
            status,
            is_delete,
            routes_detail (
                pickup_point_id,
                pickup_point (
                    students (count)
                )
            ) 
        `)
        .is('is_delete', false)
        .order('route_id', { ascending: true });

    if (error) {
        throw new Error(`Error fetching routes: ${error.message}`);
    }

    const result = (data || []).map((route: any) => {
        const details = route.routes_detail || [];
        const totalPoints = Array.isArray(details) ? details.length : 0;
        const totalStudents = Array.isArray(details)
            ? details.reduce((sum: number, detail: any) => {
                const studentsAgg = detail.pickup_point?.students;
                const count = Array.isArray(studentsAgg)
                    ? (studentsAgg[0]?.count ?? 0)
                    : (typeof studentsAgg === "number" ? studentsAgg : 0);
                return sum + (count || 0);
            }, 0)
            : 0;
        const pickupPointIds = Array.isArray(details) 
            ? details.map((d: any) => d.pickup_point_id) 
            : [];

        return {
            route_id: route.route_id,
            route_name: route.route_name,
            status: route.status,
            total_points: totalPoints,
            total_students: totalStudents,
            pickup_points: pickupPointIds,
        };
    });

    return result;
}

export const addRoute = async (routeData : Partial<{route_name : string, status: string, pickup_points: number[]}>) => {
    const { data: dataRoute, error: errorRoute } = await supabase
        .from('routes')
        .insert([{
            route_name : routeData.route_name,
            status : routeData.status
        }]).select().single();
    if (errorRoute) {
        return {
          success: false,
          message: errorRoute.message,
        };
    }
    if (routeData.pickup_points && routeData.pickup_points.length > 0) {
        const rows = routeData.pickup_points.map((pickupPointId) => ({
            pickup_point_id: pickupPointId,
            route_id: dataRoute.route_id,
        }));
        const { error: errorRouteDetail } = await supabase
            .from('routes_detail')
            .insert(rows);
        if (errorRouteDetail) {
            return {
              success: false,
              message: errorRouteDetail.message,
            };
        }
    }

    const { data: routeSelected, error: selectError } = await supabase
        .from('routes')
        .select(`
            route_id,
            route_name,
            status,
            is_delete,
            routes_detail (
                pickup_point_id,
                pickup_point (
                    students (count)
                )
            )
        `)
        .eq('route_id', dataRoute.route_id)
        .single();
    if (selectError) {
        return dataRoute;
    }
    const details = routeSelected?.routes_detail || [];
    const totalPoints = Array.isArray(details) ? details.length : 0;
    const totalStudents = Array.isArray(details)
        ? details.reduce((sum: number, detail: any) => {
            const studentsAgg = detail.pickup_point?.students;
            const count = Array.isArray(studentsAgg)
                ? (studentsAgg[0]?.count ?? 0)
                : (typeof studentsAgg === 'number' ? studentsAgg : 0);
            return sum + (count || 0);
        }, 0)
        : 0;
    const pickupPointIds = Array.isArray(details) ? details.map((d: any) => d.pickup_point_id) : [];
    return {
        route_id: routeSelected.route_id,
        route_name: routeSelected.route_name,
        status: routeSelected.status,
        total_points: totalPoints,
        total_students: totalStudents,
        pickup_points: pickupPointIds,
    };
}

export const deleteRoute = async (route_id: number) => {
    const {data, error} = await supabase
        .from('routes')
        .update({ is_delete: true})
        .eq('route_id', route_id);
    if (error) {
        throw new Error(`Error deleting route: ${error.message}`);
    }
    return data;
}

export const updateRoute = async (id: number, payload: any) => {
    const { data, error: updateError } = await supabase
        .from('routes')
        .update({
            route_name: payload.route_name,
            status: payload.status
        })
        .eq('route_id', id).select()
        .single();;

    if (updateError) throw new Error("Lỗi update route: " + updateError.message);
    const { error: deleteError } = await supabase
        .from('routes_detail')
        .delete()
        .eq('route_id', id);

    if (deleteError) throw new Error("Lỗi xóa chi tiết cũ: " + deleteError.message);
    if (payload.pickup_points && payload.pickup_points.length > 0) {
        const newDetails = payload.pickup_points.map((pointId: number, index: number) => ({
            route_id: id,
            pickup_point_id: pointId,
        }));

        const { error: insertError } = await supabase
            .from('routes_detail')
            .insert(newDetails);

        if (insertError) throw new Error("Lỗi thêm chi tiết mới: " + insertError.message);
    }

    return data;
};
