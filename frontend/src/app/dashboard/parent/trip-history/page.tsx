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
  date: string;
  tripType: string;
  pickupTime: string;
  dropoffTime: string;
  status: string;
};

// API thật lấy lịch sử chuyến đi cho học sinh
async function fetchTripHistoryByStudentId(
  student_id: number
): Promise<TripHistoryItem[]> {
  try {
    const { data } = await StudentsApi.getTripHistoryByStudentId(student_id);
    return Array.isArray(data) ? (data as TripHistoryItem[]) : [];
  } catch (e) {
    // Nếu lỗi hoặc không có dữ liệu, trả về mảng rỗng
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
    <div className="flex flex-row flex-wrap justify-center items-start w-full min-h-full p-[30px] bg-[#f9fafb] gap-5">
      {/* Select Child */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5]">
        <div className="text-lg">
          <p>Select Child</p>
        </div>
        <div className="w-full flex flex-row gap-5 flex-wrap">
          {students.map((student) => (
            <div
              key={student.student_id}
              className={`flex flex-col ${
                selectedStudent?.student_id === student.student_id
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-black"
              } rounded-xl min-w-[200px] py-3 justify-center items-center cursor-pointer hover:bg-blue-500 group`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="">
                <p
                  className={`text-sm ${
                    selectedStudent?.student_id === student.student_id
                      ? "text-white"
                      : "group-hover:text-white"
                  }`}
                >
                  {student.student_name}
                </p>
                <p
                  className={`text-xs ${
                    selectedStudent?.student_id === student.student_id
                      ? "text-gray-300"
                      : "group-hover:text-gray-300 text-gray-600"
                  }`}
                >
                  {student.grade || ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trip History */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5]">
        <div className="text-lg">
          Trip History - {selectedStudent?.student_name}
        </div>
        <div className="rounded-xl flex flex-col">
          {/* Column grid */}
          <div className="grid grid-cols-5 font-semibold gap-x-10 hover:bg-[#f5f5f7] p-2 items-center">
            <div className="">Date</div>
            <div className="">Trip Type</div>
            <div className="">Pickup Time</div>
            <div className="">Drop-off Time</div>
            <div className="">Status</div>
          </div>
          {/* Rows */}
          {isLoadingHistory ? (
            <div className="p-4 text-gray-500">
              Đang tải lịch sử chuyến đi...
            </div>
          ) : errorHistory ? (
            <div className="p-4 text-red-500">Lỗi: {String(errorHistory)}</div>
          ) : tripHistory && tripHistory.length > 0 ? (
            tripHistory.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-5 text-sm gap-x-10 hover:bg-[#f5f5f7] p-2 items-center border-t border-t-[#e5e5e5]"
              >
                <div className="">{item.date}</div>
                <div className="">{item.tripType}</div>
                <div className="">{item.pickupTime}</div>
                <div className="">{item.dropoffTime}</div>
                <div className="text-[#ffffff] font-semibold rounded-lg bg-green-600 w-fit p-[5px]">
                  {item.status}
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-gray-500">
              Không có dữ liệu lịch sử chuyến đi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
