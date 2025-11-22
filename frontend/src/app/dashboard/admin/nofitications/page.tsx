"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send } from "lucide-react";
import { adminNofitication } from "@/api/adminNofitications";

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

export default function AdminNofitications() {
  const [userAdmin, setUserAdmin] = useState<User>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [recipientType, setRecipientType] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      setUserAdmin(JSON.parse(raw));
    }
  }, []);

  const {
    data: messageData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-messages", userAdmin?.id],
    queryFn: async () => {
      if (!userAdmin) return [];
      const res = await adminNofitication.getAllMessageWhileSendApi(
        userAdmin.id
      );
      if (res.ok) return (res.data || []) as Message[];
      throw new Error(res.message || "Fetch messages failed");
    },
    enabled: !!userAdmin,
  });

  useEffect(() => {
    if (messageData) setMessages(messageData);
  }, [messageData]);

  async function sendMessage() {
    if (!messageContent.trim()) return alert("Vui lòng nhập nội dung");
    if (!recipientType) return alert("Chọn người nhận");
    if (!userAdmin) return;

    let res;
    if (recipientType === "driver") {
      res = await adminNofitication.sendMessageFromAdminToDriverApi(
        userAdmin.id,
        messageContent.trim()
      );
    } else {
      res = await adminNofitication.sendMessageFromAdminToParentApi(
        userAdmin.id,
        messageContent.trim()
      );
    }

    if (res.ok) {
      alert("Gửi thành công");
      setMessageContent("");
      setRecipientType("");
      refetch();
    } else {
      alert(res.message || "Gửi thất bại");
    }
  }

  function bgByRole(role: string, isSender: boolean) {
    if (isSender) {
      return role === "driver"
        ? "bg-green-100 border-l-4 border-l-green-500"
        : "bg-blue-100 border-l-4 border-l-blue-500";
    }
    return role === "parent"
      ? "bg-yellow-100 border-l-4 border-l-yellow-500"
      : "bg-purple-100 border-l-4 border-l-purple-500";
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
                Thông báo đến
              </TabsTrigger>
              <TabsTrigger
                value="send"
                className="data-[state=active]:bg-gray-200 data-[state=active]:rounded-3xl"
              >
                Gửi thông báo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receive" className="mt-8 space-y-5">
              {messages
                .filter(
                  (m) => m.receiver_id?.account?.[0]?.user_id === userAdmin?.id
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
                          <Bell />
                          <span>
                            Từ {senderRole} - {senderName}
                          </span>
                          <Badge className="bg-blue-500">new</Badge>
                        </div>
                        <p>{m.message_content}</p>
                        <span className="text-sm text-gray-600">
                          {formatTime(m.send_time)}
                        </span>
                      </div>
                      <Button className="bg-white text-black border hover:bg-green-400 hover:text-white">
                        Đã xác nhận
                      </Button>
                    </div>
                  );
                })}

              {messages.filter(
                (m) => m.receiver_id?.account?.[0]?.user_id === userAdmin?.id
              ).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Chưa có thông báo nào
                </div>
              )}
            </TabsContent>

            <TabsContent value="send" className="mt-8 space-y-5">
              <div className="flex flex-col gap-2">
                <span className="text-sm">Chọn người nhận</span>
                <Select
                  onValueChange={(v) => {
                    setRecipientType(v);
                  }}
                >
                  <SelectTrigger className="bg-gray-200 border-none rounded-xl">
                    <SelectValue placeholder="Chọn người nhận..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-200 border-none rounded-xl">
                    <SelectItem value="driver">Tài xế</SelectItem>
                    <SelectItem value="parent">Phụ huynh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm">Tin nhắn</span>
                <Textarea
                  rows={4}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Nhập nội dung..."
                  className="bg-gray-200 border-none"
                />
              </div>

              <Button
                onClick={sendMessage}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white"
              >
                <Send className="mr-2" /> Gửi tin nhắn
              </Button>

              <div className="space-y-3 mt-8">
                <h3 className="text-sm font-medium">Tin nhắn đã gửi:</h3>
                {messages
                  .filter(
                    (m) => m.sender_id?.account?.[0]?.user_id === userAdmin?.id
                  )
                  .map((m) => {
                    const receiverName =
                      m.receiver_id?.account?.[0]?.user_name || "Unknown";
                    const receiverRole =
                      m.receiver_id?.type_user?.type_user_name || "Receiver";
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
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
