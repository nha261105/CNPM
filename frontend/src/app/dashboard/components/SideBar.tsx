import React, { useMemo } from "react";
import {
  Bus,
  UserCheck,
  SquareChartGantt,
  User,
  Route,
  CalendarCheck,
  ChartNoAxesCombined,
  MapPin,
  Baby,
  MessageCircle,
  Send,
  LogOut,
  ClipboardCheck,
  BusIcon,
  MapPinHouse,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";

type Role = "admin" | "driver" | "parent";

export const SideBar = ({ role }: { role: Role }) => {
  const pathname = usePathname();
  console.log(pathname);
  const menu = useMemo(
    () =>
      ({
        admin: [
          {
            name: "Tổng quan",
            path: `/dashboard/admin/overview`,
            icon: <SquareChartGantt />,
          },
          {
            name: "Bản đồ",
            path: `/dashboard/admin/realtime-map`,
            icon: <MapPinHouse />,
          },
          {
            name: "Quản lí người dùng",
            path: `/dashboard/admin/users`,
            icon: <User />,
          },
          {
            name: "Quản lí xe Bus",
            path: `/dashboard/admin/bus`,
            icon: <Bus />,
          },
          {
            name: "Quản lí tuyến đường",
            path: `/dashboard/admin/routes`,
            icon: <Route />,
          },
          {
            name: "Quản lí lịch trình",
            path: `/dashboard/admin/schedules`,
            icon: <CalendarCheck />,
          },
          {
            name: "Thông báo",
            path: `/dashboard/admin/nofitications`,
            icon: <Bell />,
          },
        ],
        parent: [
          {
            name: "Vị trí xe Bus",
            path: `/dashboard/parent/bus-gps`,
            icon: <MapPin />,
          },
          {
            name: "Trạng thái con",
            path: `/dashboard/parent/child-status`,
            icon: <Baby />,
          },
          {
            name: "Lịch sử chuyến đi",
            path: `/dashboard/parent/trip-history`,
            icon: <CalendarCheck />,
          },
          {
            name: "Thông báo",
            path: `/dashboard/parent/nofitications`,
            icon: <MessageCircle />,
          },
        ],
        driver: [
          {
            name: "Lịch trình của tôi",
            path: `/dashboard/driver/myschedule`,
            icon: <CalendarCheck />,
          },
          {
            name: "Tuyến đường hôm nay",
            path: `/dashboard/driver/dayroutes`,
            icon: <Route />,
          },
          {
            name: "Báo cáo",
            path: `/dashboard/driver/reports`,
            icon: <Send />,
          },
          {
            name: "Kiểm tra học sinh",
            path: `/dashboard/driver/studentchecklist`,
            icon: <ClipboardCheck />,
          },
          {
            name: "Kiểm tra xe",
            path: `/dashboard/driver/checkvehicle`,
            icon: <BusIcon />,
          },
        ],
      }[role]),
    [role]
  );
  return (
    <aside className="h-full flex flex-col">
      <div className="h-fit flex justify-center items-center gap-3 border-b border-b-gray-300 p-3">
        <div className="w-12 h-12 bg-blue-700 flex items-center justify-center rounded-xl">
          <UserCheck
            size={36}
            color="#f1f2f3"
            strokeWidth={2}
            className="p-1"
          />
        </div>
        <div className="flex flex-col flex-start">
          <h3 className="text-gray-900 text-sm font-medium">
            Smart Bus System SGU
          </h3>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>

      <div className="flex flex-col justify-between grow">
        <div className="w-full shrink">
          <div className="space-y-1 mx-2 my-2 flex flex-col">
            {menu?.map((item) => {
              const active = pathname.startsWith(item.path);
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  className={`flex justify-start gap-4 w-full${
                    active
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <Link href={item.path}>
                    <i>{item.icon}</i>
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full h-fit flex-wrap gap-2 bg-gray-100 p-3">
          <div className="flex w-full items-center gap-2">
            <Avatar>
              <AvatarImage src={"/avt/admin.png"}></AvatarImage>
              <AvatarFallback>Admin</AvatarFallback>
            </Avatar>
            <div>
              <p>{role} USER</p>
              <p className="text-muted-foreground text-[12px]">
                {role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>
          <Button
            variant={"default"}
            className="w-full m-1 items-center bg-blue-600 text-white hover:bg-blue-800 h-8"
          >
            <Link href={"/login"} className="w-full flex justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
};
