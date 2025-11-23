"use client";
import dynamic from "next/dynamic";
import { Navigation, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
});
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import CheckpointsCard from "./CheckpointsCard";
export default function ManagerMySchedule() {
  const [routeName, setRouteName] = useState<string>();
  const [busNumber, setBusNumber] = useState<string>();
  const [timeStart, setTimeStart] = useState<string>();
  const [timeEnd, setTimeEnd] = useState<string>();
  const [totalStops, setTotalStops] = useState<number>();
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const dataStudents = [
    {
      id: 1,
      mark: "School - Start Point",
      location: "123 Education Ave",
      time: "07:15 AM",
      student: 0,
    },
    {
      id: 2,
      mark: "Oak Street",
      location: "456 Oak St",
      time: "07:15 AM",
      student: 2,
    },
    {
      id: 3,
      mark: "Maple Avenue",
      location: "789 Maple Ave",
      time: "07:22 AM",
      student: 1,
    },
    {
      id: 4,
      mark: "Pine Road",
      location: "321 Pine Rd",
      time: "07:28 AM",
      student: 2,
    },
    {
      id: 5,
      mark: "School - End Point",
      location: "123 Education Ave",
      time: "08:00 AM",
      student: 0,
    },
  ];
  const [progress, setProgress] = useState(13);
  const [openEmergency, setOpenEmergency] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <section className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="space-y-6">
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-gray-300 border-l-5 border-l-green-600">
          <div className="flex flex-col gap-4 p-8">
            <div className="text-xl font-medium">Today's Route Progress</div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-row justify-between gap-4">
                <p className="text-md font-medium">Route Completion</p>
                <p className="text-md font-medium">0 / 8 stops</p>
              </div>
              <Progress value={progress} className="bg-gray-300 h-2" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Route</p>
                <p className="font-normal text-xl">{routeName}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Bus Number</p>
                <p className="font-normal text-xl">{busNumber}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Time</p>
                <p className="font-normal text-xl">
                  {timeStart} - {timeEnd}
                </p>
              </div>
              <div className="flex flex-col">
                <p className="font-normal text-lg text-gray-700">Students</p>
                <p className="font-normal text-xl">
                  {totalStudents} passengers
                </p>
              </div>
            </div>
            <div className="flex flex-start gap-4 mt-4">
              <button className="bg-green-600 rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer">
                <Navigation size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white ">
                  Start Navigation
                </p>
              </button>
              <button
                onClick={() => setOpenEmergency(true)}
                className="bg-red-700 rounded-lg px-3 py-2 flex flex-row gap-3 items-center cursor-pointer"
              >
                <TriangleAlert size={20} color="white" strokeWidth={2.5} />
                <p className="font-semibold text-md text-white ">
                  Report Emergency
                </p>
              </button>
            </div>
          </div>
        </div>
        <Dialog open={openEmergency} onOpenChange={setOpenEmergency}>
          <DialogContent className="bg-white w-[90vw] sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                Report Vehicle Emergency
              </DialogTitle>
              <DialogDescription className="text-gray-700 font-normal text-md">
                Report vehicle failure or emergency. Admin will be notified and
                nearest driver will be assigned
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-start flex-1 gap-1 flex-col">
              <p className="font-semibold text-md">Emergency Type</p>
              <select
                name=""
                id=""
                className="w-full mt-2 p-2 rounded-md border border-gray-200"
              >
                <option value="">Vehicle Breakdown</option>
                <option value="">Accident</option>
                <option value="">Medical Emergency</option>
                <option value="">Other</option>
              </select>
            </div>
            <div className="flex items-start flex-1 gap-1 flex-col">
              <p className="font-semibold text-md">Details</p>
              <textarea
                className="resize-none border-input placeholder:text-muted-foreground w-full border border-gray-200 rounded-md p-2"
                placeholder="Describe the emergency situation..."
              ></textarea>
            </div>
            <DialogFooter>
              <button
                className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100"
                onClick={() => setOpenEmergency(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-700 text-white rounded-lg px-3 py-2 hover:bg-red-800"
                onClick={() => {
                  setOpenEmergency(false);
                }}
              >
                Confirm report
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="grid grid-cols-2 gap-8">
          <div className="shadow-lg rounded-xl border border-gray-300 p-8 flex flex-col gap-4">
            <p className="text-xl font-medium">Route Checkpoints</p>
            {dataStudents.map((data) => (
              <CheckpointsCard
                id={data.id}
                mark={data.mark}
                location={data.location}
                time={data.time}
                student={data.student}
                key={data.id}
                selected={selectedId === data.id}
                onSelect={() =>
                  setSelectedId((prev) => (prev === data.id ? null : data.id))
                }
              />
            ))}
          </div>
          <div className="shadow-lg rounded-xl border border-gray-300 p-8 flex flex-col gap-4">
            <p className="text-xl font-medium">Route Map</p>
            <MapClient />
          </div>
        </div>
      </div>
    </section>
  );
}
