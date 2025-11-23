export interface AttendanceActionDto {
    schedule_id: number;
    student_id: number;
    latitude?: number;  // Tọa độ GPS lúc bấm
    longitude?: number;
}

export interface StudentAttendanceView {
    student_id: number;
    student_name: string;
    avatar_url?: string;
    parent_phone?: string;
    pickup_point_name?: string;
    status: 'Pending' | 'Boarded' | 'Dropped' | 'Absent'; // Trạng thái hiện tại
    last_updated?: string;
}