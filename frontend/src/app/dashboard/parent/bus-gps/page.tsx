"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Navigation, Clock, Phone, Send, CircleX } from "lucide-react";
import { scheduleService, AdminScheduleWithStudents } from "@/api/schedule_admin";
import { BusApi } from "@/api/busApi";
import { StudentsApi } from "@/api/studentsApi";
import { MessageApi } from "@/api/messageApi";
import { storage } from "@/help/sessionStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DriverMap = dynamic(() => import("@/components/map/DriverMap"), {
  ssr: false,
});

interface Checkpoint {
  id: number;
  mark: string;
  location: string;
  time: string;
  student: number;
  lat?: number;
  lng?: number;
  student_id?: number;
  parent_id?: number;
  completed?: boolean;
}


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
    const storedUser = storage.getUser()
    setUserParent(storedUser);
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
  const [selectedSchedule, setSelectedSchedule] = useState<AdminScheduleWithStudents | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  
  const school_toado = { lat: 10.76006, lng: 106.68229 };
  
  //  Query schedules
  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ["today-schedules"],
    queryFn: () => scheduleService.getTodaySchedulesWithStudents(),
    refetchInterval: 5000,
    staleTime: 0,
  });
  
  //  Build checkpoints khi chọn schedule (giống logic driver)
  useEffect(() => {
    if (!selectedSchedule || selectedSchedule.students.length === 0 || !selectedStudent) {
      setCheckpoints([]);
      return;
    }

    // setCheckpoints([startPoint, studentCheckpoint]);
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371000;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const startPoint: Checkpoint = {
      id: 1,
      mark: "Đại học Sài Gòn (Điểm xuất phát)",
      location: "",
      time: selectedSchedule.time,
      student: 0,
      lat: school_toado.lat,
      lng: school_toado.lng,
      completed: selectedSchedule.status === "in_progress" || selectedSchedule.status === "completed",
    };

    const studentCheckpoints: Checkpoint[] = selectedSchedule.students
      .map((s: any) => {
        const pp = s?.pickup_point;
        if (!pp) return null;
        return {
          id: 0, // Sẽ gán lại sau khi sort
          mark: s.student_name,
          location: pp.description,
          time: selectedSchedule.time,
          student: 1,
          lat: Number(pp.latitude),
          lng: Number(pp.longitude),
          student_id: s.student_id,
          parent_id: s.parent_id,
          completed: false,
        };
      })
      .filter(Boolean) as Checkpoint[];

    // Sort theo khoảng cách
    const sortedStudentCheckpoints = [...studentCheckpoints].sort((a, b) => {
      if (!a.lat || !a.lng || !b.lat || !b.lng) return 0;
      const distA = calculateDistance(school_toado.lat, school_toado.lng, a.lat, a.lng);
      const distB = calculateDistance(school_toado.lat, school_toado.lng, b.lat, b.lng);
      return distA - distB;
    });

    sortedStudentCheckpoints.forEach((cp, index) => {
      cp.id = index + 2;
    });

    const endPoint: Checkpoint = {
      id: sortedStudentCheckpoints.length + 2,
      mark: "Đại học Sài Gòn (Điểm kết thúc)",
      location: "",
      time: selectedSchedule.time,
      student: 0,
      lat: school_toado.lat,
      lng: school_toado.lng,
      completed: selectedSchedule.status === "completed",
    };

    setCheckpoints([startPoint, ...sortedStudentCheckpoints, endPoint]);
    console.log("Selected schedule changed:", selectedSchedule);
  }, [selectedSchedule]);

  useEffect(() => {
    let found = false;
    schedules.forEach(schedule => {
      // if(schedule.status === "in_progress" || schedule.status === "scheduled") {
        schedule.students.forEach(student => {
          if (selectedStudent && student.student_id === selectedStudent.student_id) {
            setSelectedSchedule(schedule);
            found = true;
          }
        });
      // }
    });
    if (!found) setSelectedSchedule(null);
    console.log("Schedules updated or selected student changed:", schedules, selectedStudent);
  }, [selectedStudent, schedules]);

  if (isLoadingStudents)
    return <p className="text-lg text-gray-500">Đang tải...</p>;
  if (errorStudents)
    return (
      <p className="text-lg text-red-500">
        Lỗi:{" "}
        {typeof errorStudents === "object" && errorStudents !== null
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      {/* Pickup Point Location ----------------------------------------------------------------------------- */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Pickup Point</div>
        <div className="rounded-xl border border-dashed border-[#9e9d9d] bg-[#eff7fe]">
          <div className="w-full flex justify-center items-center p-4">
            <div className="w-full" style={{ minHeight: 600 }}>
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

      {/* Bản đồ realtime */}
      <div className="w-full p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5] flex flex-col gap-5">
        <div className="text-lg">Realtime</div>
        {selectedSchedule && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {selectedSchedule.bus_number} - {selectedSchedule.route_name}
                </CardTitle>
              </div>
              <p className="text-sm text-gray-500">
                Driver: {selectedSchedule.driver_name} | {selectedSchedule.schedule_date} - {selectedSchedule.time} |{" "}
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedSchedule.status === "in_progress"
                      ? "bg-green-100 text-green-700"
                      : selectedSchedule.status === "completed"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedSchedule.status}
                </span>
              </p>
            </CardHeader>
            <CardContent>
              {/*  Dùng chung DriverMap với driver */}
              <DriverMap
                checkpoints={checkpoints}
                busId={selectedSchedule.bus_id}
                isNavigating={selectedSchedule.status === "in_progress" }
                adminMode={selectedSchedule.status === "in_progress" ? true : false}
              />
            </CardContent>
          </Card>
        )}
        {
          !selectedSchedule && (
            <p className="text-lg text-gray-500">No active trip for the selected student.</p>
          )
        }
      </div>

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
