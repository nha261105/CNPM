import supabase from "../../config/supabaseClient.js";

export const getAllRoutes = async () => {
    const {data, error} = await supabase
        .from('routes')
        .select(`
            route_id,
            route_name,
            status,
            routes_detail (
                pickup_point_id,
                pickup_point (
                    students (count)
                )
            ) 
            `);
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

        return {
            route_id: route.route_id,
            route_name: route.route_name,
            status: route.status,
            total_points: totalPoints,
            total_students: totalStudents,
        };
    });

    return result;
}
