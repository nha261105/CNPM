"use client";
import { CircleCheck, CircleX } from "lucide-react";
import { Student } from "./page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { AttendanceLogApi } from "@/api/attendanceLog";
const CheckListCard = ({ student, schedule }: { student: Student, schedule: any }) => {
  const [checking, setChecking] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const handleCheckIn = async () => {
    const res = await AttendanceLogApi.checkIn(schedule.schedule_id, student.student_id, schedule.latitude, schedule.longitude);
    if (res.ok) {
      setChecking(true);
    }
  }
  const handleCheckOut = async () => {
    const res = await AttendanceLogApi.checkOut(schedule.schedule_id, student.student_id, schedule.latitude, schedule.longitude);
    if (res.ok) {
      setLeaving(true);
    }
  }
  return (
    <section className="border border-gray-300 rounded-lg flex flex-col gap-6 p-6">
      <div className="flex flex-col items-start gap-1">
        <p className="text-xl font-semibold">{student.student_name}</p>
        {/* <p className="text-gray-600 text-lg">
          {student.grade} • {student.pickup_point?.description}
        </p> */}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <p className="text-lg">Boarding Status</p>
            {checking ? <CircleCheck size={20} color="green" /> : ""}
          </div>
          <div className="flex items-start w-full">
            <button
              className={`${
                checking ? "inline-flex px-2 mt-2" : "w-full p-2"
              } bg-green-600 rounded-xl cursor-pointer transition-all duration-200 ease-in-out items-center justify-center`}
              onClick={() => {
                setChecking(true);
                handleCheckIn();
              }}
            >
              <p className="text-white font-medium">
                {checking ? "Checked In" : "Check in (board)"}
              </p>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center w-full">
            <p className="text-lg">Leaving Status</p>
            {leaving ? <CircleCheck size={20} color="green" /> : ""}
          </div>
          <div className="flex items-start w-full">
            <button
              disabled={checking === false}
              className={`${
                leaving ? "inline-flex px-2 mt-2 bg-blue-600" : "w-full p-2"
              } ${
                checking ? "" : "bg-gray-200"
              } rounded-xl cursor-pointer border border-gray-200 transition-all duration-200 ease-in-out items-center justify-center`}
              onClick={() => {
                setLeaving(true);
                handleCheckOut();
              }}
            >
              <p
                className={`${
                  leaving ? "text-white" : "text-gray-700"
                } font-medium`}
              >
                {leaving ? "Check out" : "Check out (Leaving)"}
              </p>
            </button>
          </div>
        </div>
      </div>
      <button
        className="bg-red-700 p-2 rounded-xl cursor-pointer"
        onClick={() => setOpenReport(true)}
      >
        <div className="flex justify-center items-center gap-4">
          <CircleX size={20} color="white" />
          <p className="text-white font-medium">Report Student Missing</p>
        </div>
      </button>
      <Dialog open={openReport} onOpenChange={setOpenReport}>
        <DialogContent className="bg-white w-[90vw] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              Report Missing Student
            </DialogTitle>
            <DialogDescription className="text-gray-700 font-normal text-md">
              This will immediately notify the parent and admin about Emma
              Johnson.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start flex-1 gap-2 flex-col">
            <div className="flex flex-row gap-2 items-center">
              <p className="font-normal text-xl">Student:</p>
              <p className="font-bold text-xl">{student.student_name}</p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <p className="font-normal text-xl">Expected at:</p>
              {/* <p className="font-bold text-xl">{student.pickup_point?.description}</p> */}
            </div>
          </div>
          <textarea
            className="resize-none border-input placeholder:text-muted-foreground w-full border border-gray-200 rounded-md bg-gray-100 p-3"
            placeholder="Additional notes (optional)..."
          />
          <DialogFooter>
            <button
              className="bg-red-700 text-white rounded-lg px-3 py-2 hover:bg-red-800 w-full cursor-pointer"
              onClick={() => {
                setOpenReport(false);
              }}
            >
              <p className="text-white font-semibold text-[17px] ">
                Send Missing Student Alert
              </p>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CheckListCard;