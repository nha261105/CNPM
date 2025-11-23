"use client";
import { ClipboardCheck } from "lucide-react";
import CheckListCard from "./CheckListCard";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { driverScheduleService, DriverSchedule } from "@/api/schedule_driver";
import axiosClient from "@/lib/axiosClient";

export type Student = {
  student_id: number;
  parent_id: number;
  student_name: string;
  pickup_point_id: number;
  bus_id: number;
  pickup_point: {
    latitude: number;
    longitude: number;
  };
};

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function StudentsCheckList() {
  const [ currentSchedule, setCurrentSchedule ] = useState<DriverSchedule | null>(null);
  const { data: studentsFromAPI = [], isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: ["schedule-students", currentSchedule?.bus_id],
    queryFn: async () => {
      if (!currentSchedule?.bus_id) return [];
      const res = await axiosClient.get(
        `/api/admin/realtime/${currentSchedule.bus_id}/students`
      );
      if (res.data?.ok && res.data?.data) {
        return res.data.data as Student[];
      }
      return [];
    },
    enabled: !!currentSchedule?.bus_id,
  });

  console.log(studentsFromAPI);
  
  console.log("Schedule ID:", currentSchedule?.schedule_id);
  console.log("Current schedule:", currentSchedule);
  console.log("Students:", studentsFromAPI);
  console.log("Students loading:", studentsLoading);
  console.log("Students error:", studentsError);

  const fetchSchedule = async (userId: number) => {
    if (!userId) return;
    try {
      const schedules = await driverScheduleService.getMySchedules(userId);
      console.log("Fetched schedules:", schedules);
      if (schedules && schedules.length > 0) {
        setCurrentSchedule(schedules[0]);
      } else {
        console.warn("No schedules found for user:", userId);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    }
  }

  useEffect(() => {
    const storedUser: string | null = localStorage.getItem("user");
    if (storedUser) {
      const data: User = JSON.parse(storedUser);
      fetchSchedule(data.id);
    }
  }, [])
  return (
    <section className="flex-1 overflow-y-auto p-8 ">
      <div className="space-y-6 border border-gray-200 rounded-lg bg-white">
        <div className="flex flex-col gap-4 p-6">
          <p className="text-xl font-medium">
            Student Boarding & Safety Checklist
          </p>
          <div className="bg-blue-100 rounded-lg flex gap-4 p-4 items-center">
            <ClipboardCheck color="blue" size={33} />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-lg">
                Ensure all students are checked in when boarding and checked out
                when leaving the bus.
              </p>
              <p className="text-gray-600 text-md">
                Missing student reports will notify parents and admin
                immediately.
              </p>
            </div>
          </div>
          {studentsLoading ? (
            <p className="text-lg text-gray-500 p-4">Đang tải danh sách học sinh...</p>
          ) : studentsError ? (
            <p className="text-lg text-red-500 p-4">
              Lỗi: {studentsError instanceof Error ? studentsError.message : 'Không thể tải danh sách học sinh'}
            </p>
          ) : studentsFromAPI.length === 0 ? (
            <p className="text-lg text-gray-500 p-4">Không có học sinh nào trong tuyến này.</p>
          ) : (
            studentsFromAPI.map((student, key) => (
              <CheckListCard student={student} schedule={currentSchedule} key={key} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}