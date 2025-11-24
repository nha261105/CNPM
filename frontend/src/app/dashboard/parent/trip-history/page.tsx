"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentsApi } from "@/api/studentsApi";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Student = {
  student_id: number;
  parent_id: number;
  student_name: string;
  grade?: string;
  pickup_point?: {
    pickup_point_id: number;
    latitude: number;
    longitude: number;
    description: string;
  };
  bus?: {
    bus_id: number;
    license_plate_number: string;
    number_of_seats: number;
  };
};

type TripHistoryItem = {
  attendance_id: number;
  created_at: string;
  schedule_id: number;
  student_id: number;
  status: string;
  check_in_time: string;
  check_out_time: string;
  check_in_lat?: number;
  check_in_lng?: number;
  check_out_lat?: number;
  check_out_lng?: number;
};

// API lấy lịch sử chuyến đi cho học sinh
async function fetchTripHistoryByStudentId(
  student_id: number
): Promise<TripHistoryItem[]> {
  try {
    const res = await StudentsApi.getTripHistoryByStudentId(student_id);
    if (res.success && Array.isArray(res.data)) {
      return res.data as TripHistoryItem[];
    }
    return [];
  } catch (e) {
    return [];
  }
}

export default function TripHistory() {
  const [userParent, setUserParent] = useState<User>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const storedUser: string | null = localStorage.getItem("user");
    if (storedUser) {
      const data: User = JSON.parse(storedUser);
      setUserParent(data);
    }
  }, []);

  // Lấy danh sách học sinh
  const {
    data: students,
    isLoading: isLoadingStudents,
    error: errorStudents,
  } = useQuery({
    queryKey: ["students", userParent?.id],
    queryFn: async () => {
      if (!userParent) return [];
      const { data } = await StudentsApi.getStudentsByIdParent(userParent.id);
      return data as Student[];
    },
    enabled: !!userParent,
  });

  // Chọn mặc định học sinh đầu tiên
  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // Lấy lịch sử chuyến đi cho học sinh được chọn
  const {
    data: tripHistory,
    isLoading: isLoadingHistory,
    error: errorHistory,
  } = useQuery({
    queryKey: ["trip-history", selectedStudent?.student_id],
    queryFn: async () => {
      if (!selectedStudent) return [];
      return fetchTripHistoryByStudentId(selectedStudent.student_id);
    },
    enabled: !!selectedStudent,
  });

  if (isLoadingStudents)
    return <p className="text-lg text-gray-500">Đang tải...</p>;
  if (errorStudents)
    return <p className="text-lg text-red-500">Lỗi: {String(errorStudents)}</p>;
  if (!students || students.length === 0)
    return <p className="text-lg text-gray-500">Không có học sinh nào.</p>;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex items-start justify-center pt-8">
      <div
        className="w-full p-8 bg-white rounded-2xl shadow-lg mx-auto flex flex-col"
        style={{ maxWidth: "100vw", minHeight: "unset" }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Chọn học sinh</h2>
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {students.map((student: Student) => (
            <button
              key={student.student_id}
              className={`px-6 py-2 rounded-lg border transition-colors duration-200 ${
                selectedStudent?.student_id === student.student_id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              {student.student_name}
            </button>
          ))}
        </div>
        {selectedStudent && (
          <>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Lịch sử chuyến đi - {selectedStudent.student_name}
            </h3>
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "50vh", overflowY: "auto" }}
            >
              <table className="w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-3 px-6 text-left font-semibold text-blue-900">
                      Check-in
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-blue-900">
                      Check-out
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-blue-900">
                      Status
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-blue-900">
                      Schedule ID
                    </th>
                    <th className="py-3 px-6 text-left font-semibold text-blue-900">
                      Trip ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingHistory ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        Đang tải lịch sử chuyến đi...
                      </td>
                    </tr>
                  ) : errorHistory ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-red-500">
                        Lỗi: {String(errorHistory)}
                      </td>
                    </tr>
                  ) : !tripHistory || tripHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        Không có dữ liệu lịch sử chuyến đi.
                      </td>
                    </tr>
                  ) : (
                    tripHistory.map((trip: TripHistoryItem) => (
                      <tr
                        key={trip.attendance_id}
                        className="border-b last:border-b-0"
                      >
                        <td className="py-3 px-6">
                          {trip.check_in_time
                            ? new Date(trip.check_in_time).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 px-6">
                          {trip.check_out_time
                            ? new Date(trip.check_out_time).toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              trip.status === "Pending"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {trip.status}
                          </span>
                        </td>
                        <td className="py-3 px-6">{trip.schedule_id}</td>
                        <td className="py-3 px-6">{trip.attendance_id}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
