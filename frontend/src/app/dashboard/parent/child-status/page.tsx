"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentsApi } from "@/api/studentsApi";

type StudentsType = {
  student_id: number;
  parent_id: number;
  student_name: string;
  pickup_point: {
    pickup_point_id: number;
    latitude: number;
    longitude: number;
    description: string;
  };
  bus: {
    bus_id: number;
    license_plate_number: string;
    number_of_seats: number;
  };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function ManagerChildrenStatus() {
  const [userParent, setUserParent] = useState<User>();

  useEffect(() => {
    const storedUser: string | null = localStorage.getItem("user");
    const data: User = JSON.parse(storedUser!);
    setUserParent(data);
  }, []);

  const {
    data: DBStudents,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["students", userParent?.id],
    queryFn: async () => {
      try {
        if (!userParent) return [];
        const { data, error } = await StudentsApi.getStudentsByIdParent(
          userParent.id
        );
        if (error) throw error;
        return data as StudentsType[];
      } catch (error) {
        throw error;
      }
    },
    enabled: !!userParent,
  });

  useEffect(() => {
    console.log(DBStudents);
  }, [DBStudents]);

  if (isLoading) return <p className="text-lg text-gray-500">Đang tải...</p>;
  if (error)
    return <p className="text-lg text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="flex flex-row flex-wrap justify-center items-start w-full min-h-full p-[30px] bg-[#f9fafb] gap-5">
      {DBStudents?.map((item, index) => {
        const nameParts = item.student_name.split(" ");
        const name = nameParts.splice(-1);
        return (
          <div
            key={item.student_id}
            className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5]"
          >
            <div className="flex flex-row justify-between">
              <p className="text-lg">{item.student_name}</p>
              <div className="w-fit bg-blue-600 px-3 py-1 rounded-lg border border-blue-600">
                <div className="text-white text-xs font-medium">Active</div>
              </div>
            </div>

            <div className="w-full flex flex-row items-center">
              <div className="rounded-full bg-blue-50">
                <div className="w-25 h-25 flex justify-center items-center text-blue-600">
                  {name}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-row">
              <div className="w-[50%] flex flex-col justify-between gap-2.5">
                <div className="">
                  <div className="text-sm text-gray-500">Biển số xe</div>
                  <div className="text-base">{item.bus.license_plate_number}</div>
                </div>
                <div className="">
                  <div className="text-sm text-gray-500">Số ghế</div>
                  <div className="text-base">{item.bus.number_of_seats}</div>
                </div>
              </div>
              <div className="w-[50%] flex flex-col justify-between gap-2.5">
                <div className="">
                  <div className="text-sm text-gray-500">Điểm đón</div>
                  <div className="text-base">{item.pickup_point.description}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
