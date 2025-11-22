"use client";
import { SideBar } from "@/app/dashboard/components/SideBar";
import { TopBar } from "@/app/dashboard/components/TopBar";
import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = useMemo(() => {
    if (pathname.includes("/dashboard/admin")) return "admin";
    if (pathname.includes("/dashboard/driver")) return "driver";
    if (pathname.includes("/dashboard/parent")) return "parent";
    return "admin";
  }, [pathname]);
  // Chỉ render lại khi role đổi
  const memoizedSidebar = useMemo(() => <SideBar role={role} />, [role]);
  const memoizedTopbar = useMemo(() => <TopBar role={role} />, [role]);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-full flex bg-gray-50">
        {/* Sidebar cố định */}
        <div className="w-[240px] h-full border-r border-gray-200 bg-white">
          {memoizedSidebar}
        </div>

        {/* top + page */}
        <div className="flex flex-col flex-1 h-full">
          {/* Topbar cố định */}
          <div className="h-[80px] w-full border-b border-gray-200 bg-white flex items-center">
            {memoizedTopbar}
          </div>

          {/* Nội dung chính */}
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
