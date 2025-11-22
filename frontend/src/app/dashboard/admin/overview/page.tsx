"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Baby, Bus, Route, User } from "lucide-react";
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axiosClient";


export default function Overview() {
  const [overview, setOverview] = useState({
    total_buses: 0,
    total_drivers: 0,
    total_routes: 0,
    total_students: 0
  });

  useEffect(() => {
    axiosClient.get("/api/admin/overview/card").then((res) => {
      if(res.data.ok) {
        setOverview(res.data.data)
      }
    }).catch((err) => {
      console.error("Error overview: ", err)
    })
  },[])
  const cardItem = [
    {
      title: "Tổng số xe buýt",
      value: overview.total_buses,
      change: "+2 this month",
      icon: <Bus />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Tổng số tài xế",
      value: overview.total_drivers,
      change: "+4 this month",
      icon: <User />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Tuyến đường hoạt động",
      value: overview.total_routes,
      change: "No changes",
      icon: <Route />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Tổng số học sinh",
      value: overview.total_students,
      change: "+28 this month",
      icon: <Baby />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  console.log("bus: ", overview.total_buses)
  console.log("driver: ", overview.total_drivers)
  console.log("routes: ", overview.total_routes)
  console.log("student: ", overview.total_students)

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="space-y-6">
        {/* Card */}
        <div className="grid grid-cols-4 lg:grid-cols-4 gap-6 md:grid-cols-2">
          {cardItem.map((item) => (
            <div
              key={item.title}
              className="hover:shadow-md transition-shadow border border-gray-300 rounded-xl"
            >
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-[15px]">{item.title}</CardTitle>
                <div className={`${item.bg} ${item.color} p-2 rounded-lg`}>
                  {item.icon}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col">
                <div className="text-3xl">{item.value}</div>
                <p className="text-gray-500 italic text-xs font-medium">
                  {item.change}
                </p>
              </CardContent>
            </div>
          ))}
        </div>

        {/*System status and active alerts  */}
        <Card className="border border-gray-300 hover:shadow-md rounded-2xl mt-10 mb-10">
          <CardHeader>
            <CardTitle className="text-xl">
              Trạng thái hệ thống và thông tin thông báo
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-5">
              <div className="flex justify-start gap-3 items-center bg-green-100 p-4 rounded-lg border-l-4 border-l-green-500">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="font-bold">
                  Tất cả hệ thống hoạt động và có 24 xe buýt hoạt động trên các
                  tuyến
                </p>
              </div>
              <div className="flex justify-start gap-3 items-center bg-yellow-100 p-4 rounded-lg border-l-4 border-l-yellow-500">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <p className="font-bold">
                  2 yêu cầu của phụ huynh cần được xem xét
                </p>
              </div>
              <div className="flex justify-start gap-3 items-center bg-blue-100 p-4 rounded-lg border-l-4 border-l-blue-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <p className="font-bold">1 xe buýt đang bảo trì</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 lg:grid-cols-3 gap-6 md:grid-cols-2">
          {/* Today Trip */}
          <Card className="border border-gray-300 hover:shadow-lg rounded-lg">
            <CardHeader className="mb-5">
              <CardTitle>Chuyến đi hôm nay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl">156</div>
              <p className="text-gray-500 italic text-sm">142 chuyến hoạt động, 2 12 chuyến delay, 2 chuyến bị hủy</p>
            </CardContent>
          </Card>

          {/* Current Attendance */}
          <Card className="border border-gray-300 hover:shadow-lg rounded-lg">
            <CardHeader className="mb-5">
              <CardTitle>Tỉ lệ học sinh tham gia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl">96.5%</div>
              <p className="text-gray-500 italic text-sm">1,205 trong 1,247 tổng số học sinh hiện tại</p>
            </CardContent>
          </Card>


          {/* Avg Trip Duration */}
          <Card className="border border-gray-300 hover:shadow-lg rounded-lg">
            <CardHeader className="mb-5">
              <CardTitle>Thời gian chuyến đi trung bình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl">45 min</div>
              <p className="text-gray-500 italic text-sm">Nhanh hơn 3 phút so với mức trung bình</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
