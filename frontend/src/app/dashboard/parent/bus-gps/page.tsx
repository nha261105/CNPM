"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Navigation, Clock, Phone, Send, CircleX } from "lucide-react";
import { BusApi } from "@/api/busApi";
import { StudentsApi } from "@/api/studentsApi";
import { MessageApi } from "@/api/messageApi";

// Emergency contacts (cứng, có thể lấy từ config sau)
const emergencyContacts = [
  {
    label: "School Admin Office",
    role: "Administrator",
    phone: "+1 (555) 123-4567",
  },
  {
    label: "Transport Coordinator",
    role: "Coordinator",
    phone: "+1 (555) 234-5678",
  },
  {
    label: "Emergency Hotline",
    role: "Emergency",
    phone: "+1 (555) 911-0000",
  },
];

const StudentMap = dynamic(() => import("@/components/map/StudentMap"), {
  ssr: false,
});

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

interface BusLocation {
  bus_id: number;
  license_plate_number: string;
  driver_name: string;
  latitude: number;
  longitude: number;
  status: string;
  eta: string;
}

export default function BusGp() {
  const [userParent, setUserParent] = useState<User>();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  // ...existing code...

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

  // Nếu muốn lấy vị trí realtime, có thể bổ sung API lấy theo bus_id ở đây
  // Hiện tại chỉ dùng dữ liệu bus, pickup_point từ selectedStudent (giống child-status)

  // Chọn mặc định học sinh đầu tiên
  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  // ...existing code...

  if (isLoadingStudents)
    return <p className="text-lg text-gray-500">Đang tải...</p>;
  if (errorStudents)
    return (
      <p className="text-lg text-red-500">
        Lỗi:{" "}
        {typeof errorStudents === "object" && errorStudents !== null
          ? (errorStudents as any).message
          : String(errorStudents)}
      </p>
    );
  if (!students || students.length === 0)
    return <p className="text-lg text-gray-500">Không có học sinh nào.</p>;
  if (!selectedStudent || !selectedStudent.bus)
    return (
      <p className="text-lg text-gray-500">
        Không có dữ liệu xe bus cho học sinh này.
      </p>
    );

  return (
    <div className="flex flex-row flex-wrap justify-center items-start w-full min-h-full p-[30px] bg-[#f9fafb] gap-5">
      {/* Select Child ----------------------------------------------------------------------------- */}
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
        {/* Không còn status/ETA realtime, chỉ hiển thị thông tin bus của học sinh */}
      </div>

      {/* Active Trip ----------------------------------------------------------------------------- */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] border-l-4 border-l-[#155dfc]">
        <div className="text-lg">
          <p>Active Trip - {selectedStudent?.student_name}</p>
        </div>
        <div className="w-full flex flex-row">
          <div className="w-[50%] flex flex-col justify-between gap-2.5">
            <div className="">
              <div className="text-sm text-gray-500">Student</div>
              <div className="text-base">{selectedStudent?.student_name}</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Class</div>
              <div className="text-base">{selectedStudent?.grade || "N/A"}</div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Bus Details</div>
              <div className="text-base">
                {selectedStudent.bus.license_plate_number} - Bus ID:{" "}
                {selectedStudent.bus.bus_id}
              </div>
            </div>
          </div>
          <div className="w-[50%] flex flex-col justify-between gap-2.5">
            <div className="">
              <div className="text-sm text-gray-500">Driver</div>
              {/* Nếu có driver_name trong selectedStudent.bus, hiển thị, nếu không thì bỏ qua */}
              <div className="text-base">
                {(selectedStudent.bus as any).driver_name || ""}
              </div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Vehicle Number</div>
              <div className="text-base">
                {selectedStudent.bus.license_plate_number}
              </div>
            </div>
            <div className="">
              <div className="text-sm text-gray-500">Vị trí hiện tại</div>
              <div className="text-base">
                {selectedStudent.pickup_point
                  ? `(${selectedStudent.pickup_point.latitude}, ${selectedStudent.pickup_point.longitude})`
                  : "Không có điểm đón"}
              </div>
            </div>
          </div>
        </div>
        {/* Không còn status/ETA realtime, chỉ hiển thị thông tin bus của học sinh */}
      </div>

      {/* Real-Time Bus Location ----------------------------------------------------------------------------- */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Real-Time Bus Location</div>
        <div className="rounded-xl border border-dashed border-[#9e9d9d] bg-[#eff7fe]">
          <div className="w-full flex justify-center items-center p-4">
            <div className="w-full" style={{ minHeight: 400 }}>
              {selectedStudent && selectedStudent.pickup_point ? (
                <StudentMap
                  latitude={Number(selectedStudent.pickup_point.latitude)}
                  longitude={Number(selectedStudent.pickup_point.longitude)}
                  studentName={selectedStudent.student_name}
                />
              ) : (
                <div className="text-center text-gray-500">
                  Chưa có vị trí học sinh
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ...existing code... */}

      {/* Emergency Contacts */}
      <div className="w-full bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-3 mt-6">
        <div className="text-lg font-semibold mb-2">Emergency Contacts</div>
        <div className="flex flex-col gap-2">
          {emergencyContacts.map((c, idx) => (
            <div
              key={idx}
              className="flex flex-row items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100"
            >
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-gray-500">{c.role}</div>
              </div>
              <a
                href={`tel:${c.phone}`}
                className="flex flex-row gap-2 items-center text-blue-600 font-semibold"
              >
                <Phone size={18} />
                {c.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
