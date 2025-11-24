"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentsApi } from "@/api/studentsApi";
import { MapPin, MapPinned } from "lucide-react";
import UpdatePickupPointDialog from "@/components/dialog/UpdatePickupPointDialog";
import { Description } from "@radix-ui/react-dialog";
import { storage } from "@/help/sessionStorage";
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
  const [DBStudents, setDBStudents] = useState<StudentsType[]>();
  const [openPickupDialog, setOpenPickupDialog] = useState(false);
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [childName, setChildName] = useState("");
  const [description, setDescription] = useState("");
  const [idPickUp, setIdPickup] = useState(0);
  const [indexPickup, setIndexPickup] = useState(0);

  useEffect(() => {
    const storedUser = storage.getUser()
    setUserParent(storedUser);
  }, []);

  const {
    data: DBLoadStudents,
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
    setDBStudents(DBLoadStudents);
  }, [DBLoadStudents]);

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
                  <div className="text-base">
                    {item.bus.license_plate_number}
                  </div>
                </div>
                <div className="">
                  <div className="text-sm text-gray-500">Số ghế</div>
                  <div className="text-base">{item.bus.number_of_seats}</div>
                </div>
              </div>
              <div className="w-[50%] flex flex-col justify-between gap-2.5">
                <div className="flex flex-row gap-3">
                  <div className="">
                    <div className="text-sm text-gray-500">Điểm đón</div>
                    <div className="bg-blue-50 w-fit p-3 rounded-lg flex flex-row gap-2 items-center">
                      <MapPin
                        strokeWidth={1.5}
                        size={20}
                        className="text-blue-500"
                      />
                      <div className="text-sm text-gray-800">
                        {item.pickup_point.description}
                      </div>
                    </div>
                  </div>
                  <div className="">
                    <div className="text-sm text-gray-500">Tọa độ</div>
                    <div className="bg-blue-50 w-fit p-3 rounded-lg flex flex-row gap-2 items-center">
                      <div className="text-sm text-gray-800">
                        ({item.pickup_point.latitude},{" "}
                        {item.pickup_point.longitude})
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => {
                    setChildName(item.student_name);
                    setLatitude(item.pickup_point.latitude);
                    setLongitude(item.pickup_point.longitude);
                    setDescription(item.pickup_point.description);
                    setIdPickup(item.pickup_point.pickup_point_id);
                    setIndexPickup(index);
                    setOpenPickupDialog(true);
                  }}
                  className="cursor-pointer border border-gray-500 rounded-lg p-2 flex items-center w-fit gap-2 group hover:bg-green-500 hover:border-green-500 active:bg-green-600"
                >
                  <MapPinned
                    strokeWidth={1.5}
                    size={20}
                    className="text-black group-hover:text-white"
                  />
                  <div className="text-sm font-semibold group-hover:text-white">
                    Cập nhật vị trí đón
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dialog */}
      <UpdatePickupPointDialog
        open={openPickupDialog}
        onOpenChange={setOpenPickupDialog}
        latitude={latitude} // kinh độ ban đầu
        longitude={longitude} // vĩ độ ban đầu
        child_name={childName}
        description={description}
        idPickUp={idPickUp}
        onSuccess={(data) => {
          console.log("Dữ liệu đã chọn:", data);

          setDBStudents((prev) =>
            (prev ?? []).map((item) =>
              item.pickup_point.pickup_point_id === data.idPickUp
                ? {
                    ...item,
                    pickup_point: {
                      ...item.pickup_point,
                      latitude: data.latitude,
                      longitude: data.longitude,
                      description: data.description,
                    },
                  }
                : item
            )
          );
        }}
      />
    </div>
  );
}
