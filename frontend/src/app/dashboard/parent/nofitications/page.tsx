"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Send } from "lucide-react";
import { MessageApi } from "@/api/messageApi";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Messages = {
  message_id: number;
  message_content: string;
  send_time: string;
  sender_id:
    | {
        account: {
          user_id: number;
          user_name: string;
        }[];
      }[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any;
  receiver_id:
    | {
        account: {
          user_id: number;
          user_name: string;
        }[];
      }[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | any;
}[];

export default function Nofitications() {
  const [userParent, setUserParent] = useState<User>();
  const [posMessage, setPosMessage] = useState<number>(0);
  const [messageContent, setMessageContent] = useState<string>("");
  const [DBMessage, setDBMessage] = useState<Messages>();

  useEffect(() => {
    const storedUser: string | null = localStorage.getItem("user");
    const data: User = JSON.parse(storedUser!);
    setUserParent(data);
  }, []);

  const {
    data: MessageDataLoad,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["messages", userParent?.id],
    queryFn: async () => {
      try {
        if (!userParent) return [];
        const { data, error } = await MessageApi.getMessageByIdParent(
          userParent.id
        );
        if (error) throw error;
        return data as Messages;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!userParent,
  });

  async function sendMessageToAdminByIdParent() {
    if(!userParent) return;
    try {
      const data = await MessageApi.sendMessageToAdminByIdParent(userParent.id, messageContent)
      if(!DBMessage) return
      const newData = [data.data[0], ...DBMessage]
      setDBMessage(newData)
      setMessageContent("")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Error: " + error.message)
    }
  }

  useEffect(() => {
    setDBMessage(MessageDataLoad)
    console.log(MessageDataLoad)
  }, [MessageDataLoad]);

  if (isLoading) return <p className="text-lg text-gray-500">Đang tải...</p>;
  if (error)
    return <p className="text-lg text-red-500">Lỗi: {error.message}</p>;

  return (
    <div className="flex flex-row flex-wrap justify-center items-start w-full min-h-full p-[30px] bg-[#f9fafb] gap-5">
      {/* Notifications ----------------------------------------------------------------------------- */}
      <div className="w-full flex flex-col gap-5 p-[20px_30px] bg-[#ffffff] rounded-xl border border-solid border-[#e5e5e5]">
        <div className="text-lg">Notifications & Alerts</div>
        <div className="flex flex-row w-full bg-gray-200 p-1 rounded-2xl gap-1">
          <div
            className={`flex-1 flex justify-center items-center cursor-pointer font-medium ${
              posMessage == 0 ? "bg-white rounded-2xl" : ""
            }`}
            onClick={() => setPosMessage(0)}
          >
            Recieve from Admin
          </div>
          <div
            className={`flex-1 flex justify-center items-center cursor-pointer font-medium ${
              posMessage == 1 ? "bg-white rounded-2xl" : ""
            }`}
            onClick={() => setPosMessage(1)}
          >
            Send to Admin
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {posMessage == 0 && (
            <>
              {DBMessage?.map((item, index) => {
                const time = new Date(item.send_time).toLocaleString("vi-VN");
                if (userParent?.id == item.receiver_id.account[0].user_id)
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 bg-blue-50 border-l-blue-500 rounded-lg border-l-4 p-[10px_20px]"
                    >
                      <div className="flex justify-between">
                        <div className="flex jutify-center items-center gap-2.5">
                          <Bell size={20} className="text-blue-600" />
                          <div className="text-base">
                            Người gửi {item.sender_id.account[0].user_name} - {item.sender_id.type_user.type_user_name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {time}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground ml-[30px]">
                        {item.message_content}
                      </div>
                    </div>
                  );
              })}
            </>
          )}
          {posMessage == 1 && (
            <>
              <div className="w-full flex flex-col gap-1">
                <label htmlFor="txt" className="text-sm font-medium">
                  Message to Admin
                </label>
                <textarea
                  name="txt"
                  id="txt"
                  value={messageContent}
                  onChange={(item) => {
                    setMessageContent(item.target.value);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Enter your message here..."
                ></textarea>
              </div>
              <div
                className="w-full gap-3 flex justify-center items-center bg-green-500 hover:bg-green-600 active:bg-green-700 py-3 rounded-lg cursor-pointer"
                onClick={() => {
                  sendMessageToAdminByIdParent()
                }}
              >
                <Send className="text-white" size={20} />
                <div className="text-white font-semibold">
                  Send notification to Admin
                </div>
              </div>
              <div className="w-full gap-3 flex items-center bg-red-50 p-3 rounded-lg">
                <div className="text-gray-500 text-sm">
                  Use this to communicate route updates, student issues, or
                  schedule requests to the admin.
                </div>
              </div>
              {DBMessage?.map((item, index) => {
                const time = new Date(item.send_time).toLocaleString("vi-VN");
                if (userParent?.id == item.sender_id.account[0].user_id)
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 bg-green-50 border-l-green-500 rounded-lg border-l-4 p-[10px_20px]"
                    >
                      <div className="flex justify-between">
                        <div className="flex jutify-center items-center gap-2.5">
                          <Bell size={20} className="text-green-600" />
                          <div className="text-base">
                            Gửi đến {item.receiver_id.account[0].user_name} - {item.receiver_id.type_user.type_user_name}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {time}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground ml-[30px]">
                        {item.message_content}
                      </div>
                    </div>
                  );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
