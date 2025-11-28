"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send } from "lucide-react";
import { storage } from "@/help/sessionStorage";
import { driverReports } from "@/api/driverReports";

type User = {
  id: number;
  name: string;
  role: string;
};

type Message = {
  message_id: number;
  message_content: string;
  send_time: string;
  sender_id: {
    account: { user_id: number; user_name: string }[];
    type_user: { type_user_name: string };
  };
  receiver_id: {
    account: { user_id: number; user_name: string }[];
    type_user?: { type_user_name: string };
  };
};

export default function Reports() {
  const [userDriver, setUserDriver] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    const raw = storage.getUser();
    if (raw) {
      setUserDriver(raw);
    }
  }, []);

  const {
    data: messageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["driver-messages", userDriver?.id],
    queryFn: async () => {
      if (!userDriver) return [];
      const res = await driverReports.getAllReportFromAdmin(userDriver.id);
      if (res.ok) return (res.data || []) as Message[];
      throw new Error(res.message || "Lấy report từ admin lỗi");
    },
    enabled: !!userDriver,
    refetchInterval: 30000, // Refresh mỗi 30s
  });

  useEffect(() => {
    if (messageData) setMessages(messageData);
  }, [messageData]);

  async function sendMessage() {
    if (!messageContent.trim()) return alert("Vui lòng nhập nội dung");
    if (!userDriver) return;

    const res = await driverReports.sendMessageFromDriverToAdmin(
      userDriver.id,
      messageContent.trim()
    );

    if (res.ok) {
      alert("Gửi thành công");
      setMessageContent("");
      refetch();
    } else {
      alert(res.message || "Gửi thất bại");
    }
  }

  function bgByRole(role: string, isSender: boolean) {
    if (isSender) {
      return "bg-green-100 border-l-4 border-l-green-500";
    }
    return "bg-blue-100 border-l-4 border-l-blue-500";
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleString("vi-VN");
  }

  if (isLoading) return <p className="p-8">Đang tải...</p>;
  if (error)
    return <p className="p-8 text-red-500">Lỗi: {(error as any).message}</p>;

  return (
    <div className="flex-1 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="receive">
            <TabsList className="grid grid-cols-2 w-full rounded-3xl bg-gray-300 h-12">
              <TabsTrigger
                value="receive"
                className="data-[state=active]:bg-white data-[state=active]:rounded-3xl"
              >
                Thông báo từ Admin
              </TabsTrigger>
              <TabsTrigger
                value="send"
                className="data-[state=active]:bg-gray-200 data-[state=active]:rounded-3xl"
              >
                Gửi đến Admin
              </TabsTrigger>
            </TabsList>

            {/* Tab: Nhận tin từ Admin */}
            <TabsContent value="receive" className="mt-8 space-y-5">
              {messages
                .filter(
                  (m) => m.receiver_id?.account?.[0]?.user_id === userDriver?.id
                )
                .map((m) => {
                  const senderName =
                    m.sender_id?.account?.[0]?.user_name || "Unknown";
                  const senderRole =
                    m.sender_id?.type_user?.type_user_name || "Unknown";
                  return (
                    <div
                      key={m.message_id}
                      className={`flex justify-between p-5 rounded-2xl ${bgByRole(
                        senderRole,
                        false
                      )}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`${
                              m.sender_id?.type_user?.type_user_name === "Admin"
                                ? "text-blue-500"
                                : "text-yellow-500"
                            }`}
                          >
                            <Bell size={20} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            Từ: {senderName}
                          </span>
                          <Badge className="bg-blue-500">new</Badge>
                        </div>
                        <p className="text-base text-gray-800">
                          {m.message_content}
                        </p>
                        <span className="text-sm text-gray-600">
                          {formatTime(m.send_time)}
                        </span>
                      </div>
                      <Button className="bg-white text-black border hover:bg-green-400 hover:text-white">
                        Đã xem
                      </Button>
                    </div>
                  );
                })}

              {messages.filter(
                (m) => m.receiver_id?.account?.[0]?.user_id === userDriver?.id
              ).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Chưa có thông báo nào từ Admin
                </div>
              )}
            </TabsContent>

            {/* Tab: Gửi tin đến Admin */}
            <TabsContent value="send" className="mt-8 space-y-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm">Tin nhắn gửi đến Admin</span>
                <Textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="bg-gray-200 border-none"
                />
              </div>

              <Button
                onClick={sendMessage}
                className="w-full bg-green-500 hover:bg-green-700 text-white"
              >
                <Send className="mr-2" /> Gửi tin nhắn
              </Button>

              <div className="bg-gray-100 rounded-lg p-5">
                <p className="text-md text-gray-500 font-normal">
                  Sử dụng để báo cáo cập nhật tuyến đường, vấn đề về học sinh,
                  hoặc yêu cầu thay đổi lịch trình cho Admin.
                </p>
              </div>

              {/* Lịch sử tin đã gửi */}
              <div className="space-y-3 mt-8">
                <h3 className="text-sm font-medium">Tin nhắn đã gửi:</h3>
                {messages
                  .filter(
                    (m) =>
                      m.sender_id?.account?.[0]?.user_id === userDriver?.id
                  )
                  .map((m) => {
                    const receiverName =
                      m.receiver_id?.account?.[0]?.user_name || "Admin";
                    const receiverRole =
                      m.receiver_id?.type_user?.type_user_name || "Admin";
                    return (
                      <div
                        key={m.message_id}
                        className={`p-4 rounded-lg ${bgByRole(
                          receiverRole,
                          true
                        )}`}
                      >
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2.5">
                            <Bell className="text-green-600" />
                            <div>
                              Gửi đến {receiverName} - {receiverRole}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatTime(m.send_time)}
                          </div>
                        </div>
                        <div className="text-sm mt-1 ml-7">
                          {m.message_content}
                        </div>
                      </div>
                    );
                  })}

                {messages.filter(
                  (m) => m.sender_id?.account?.[0]?.user_id === userDriver?.id
                ).length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    Chưa có tin nhắn nào được gửi
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
