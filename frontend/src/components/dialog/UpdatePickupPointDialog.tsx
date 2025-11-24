"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { PickupPointApi } from "@/api/pickupPointApi";
import dynamic from "next/dynamic";

const PickupMap = dynamic(() => import("@/components/map/PickUpMapForStudent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 border rounded-xl bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Đang tải bản đồ...</p>
    </div>
  ),
});

interface PickupPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: {
    idPickUp: number;
    child_name: string;
    latitude: number;
    longitude: number;
    description: string;
  }) => void;
  idPickUp: number;
  child_name: string;
  latitude: number;
  longitude: number;
  description: string;
}

export default function UpdatePickupPointDialog({
  open,
  onOpenChange,
  onSuccess,
  idPickUp,
  latitude,
  longitude,
  child_name,
  description,
}: PickupPointDialogProps) {
  const [currLatitude, setCurrLatitude] = useState<number>(latitude);
  const [currLongitude, setCurrLongitude] = useState<number>(longitude);
  const [selectedLat, setSelectedLat] = useState<number>(latitude);
  const [selectedLng, setSelectedLng] = useState<number>(longitude);
  const [dec, setDec] = useState(description);

  useEffect(() => {
    if (open) {
      setSelectedLat(latitude);
      setSelectedLng(longitude);
      setCurrLatitude(latitude);
      setCurrLongitude(longitude);
      setDec(description);
    }
  }, [open, latitude, longitude, description]);

  const handleSubmit = async () => {
    try {
      if (onSuccess) {
        setCurrLatitude(selectedLat);
        setCurrLongitude(selectedLng);

        onSuccess({
          idPickUp: idPickUp,
          child_name: child_name,
          latitude: selectedLat,
          longitude: selectedLng,
          description: dec,
        });

        await PickupPointApi.updatePickUp(idPickUp, selectedLat, selectedLng, dec);

        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      const err = error as Error;
      console.log(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[50%] min-w-[500px] max-w-none bg-white"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Cập nhật điểm đón học sinh</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex flex-row items-center gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <Label>Tên học sinh</Label>
              <div className="p-2 bg-gray-300 border border-gray-800 rounded-xl">
                {child_name}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label>Mô tả điểm đón</Label>
              <input
                type="text"
                value={dec}
                onChange={(e) => setDec(e.target.value)}
                className="p-2 border border-gray-800 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Bản đồ</Label>
            <PickupMap
              currLatitude={currLatitude}
              currLongitude={currLongitude}
              selectedLat={selectedLat}
              selectedLng={selectedLng}
              setSelectedLat={setSelectedLat}
              setSelectedLng={setSelectedLng}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-red-400 hover:bg-red-500 active:bg-red-600 text-white"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-400 hover:bg-green-500 active:bg-green-600 text-white"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}