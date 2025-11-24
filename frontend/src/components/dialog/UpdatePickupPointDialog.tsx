"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import TrackingTest from "../map/TrackingTest";
import MapClient from "../map/MapClient";
import { Dot, LocateFixed, MapPin } from "lucide-react";
import { PickupPointApi } from "@/api/pickupPointApi";

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
  description
}: PickupPointDialogProps) {
  const [currLatitude, setCurrLatitude] = useState<number>(latitude);
  const [currLongitude, setCurrLongitude] = useState<number>(longitude);
  const [selectedLat, setSelectedLat] = useState<number>(latitude);
  const [selectedLng, setSelectedLng] = useState<number>(longitude);
  const [dec, setDec] = useState(description);

  useEffect(() => {
    setSelectedLat(latitude);
    setSelectedLng(longitude);
    setCurrLatitude(latitude);
    setCurrLongitude(longitude);
    setDec(description);
  }, [open]);

  const handleSubmit = () => {
    try {
      if (onSuccess) {
        setCurrLatitude(selectedLat);
        setCurrLongitude(selectedLng);
        
        onSuccess({
          idPickUp: idPickUp,
          child_name: child_name,
          latitude: selectedLat,
          longitude: selectedLng,
          description: dec
        });

        PickupPointApi.updatePickUp(idPickUp, selectedLat, selectedLng, dec)

        alert("Cập nhật thông tin thành công!")
      }
    } catch (error) {
      const err = error as Error;
      console.log(err.message)
    }
  };

function MapController() {
  const map = useMapEvents({
    move: () => {
      const c = map.getCenter();
      setSelectedLat(c.lat);
      setSelectedLng(c.lng);
    },
  });

  return (
    <div className="absolute bottom-4 right-4 z-[999]">
      <button
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform"
        onClick={() => map.flyTo([currLatitude, currLongitude], 16)}
      >
        <LocateFixed className="w-6 h-6 text-blue-600" />
      </button>
    </div>
  );
}


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[50%] min-w-[500px] max-w-none bg-white" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Cập nhật điểm đón học sinh</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="flex flex-row items-center gap-5">
            <div className="flex flex-col gap-2 flex-1">
              <Label>Tên học sinh</Label>
              <div className="cursor-text p-2 bg-gray-300 outline-0 border border-gray-800 rounded-xl">
                {child_name}
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label>Mô tả điểm đón</Label>
              <input type="text" name="dec" id="dec" value={dec} onChange={(e) => setDec(e.target.value)} className="cursor-text p-2 outline-0 border border-gray-800 rounded-xl"/>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Bản đồ</Label>
            <div className="relative w-full h-80 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
              <MapContainer
                center={[currLatitude!, currLongitude!]}
                zoom={14}
                className="w-full h-full rounded-xl"
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[currLatitude!, currLongitude!]}>
                  <Popup>Vị trí hiện tại</Popup>
                </Marker>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-[999] pointer-events-none flex flex-col items-center">
                  <div className="bg-white px-2 py-1 rounded-md shadow-md text-xs font-semibold text-gray-800 mb-1 border border-gray-200">
                    Vị trí mới
                  </div>
                  <div className="relative">
                    <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black opacity-20 rounded-full"></span>
                  </div>
                </div>

                <div className="absolute top-4 right-4 bg-white/95 p-4 rounded shadow-lg z-[1000] max-w-xs">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <span
                      className={
                        selectedLat && selectedLng
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      <Dot />
                    </span>
                    Vị trí đón mới
                  </h3>
                  {selectedLat && selectedLng ? (
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kinh độ:</span>
                        <span className="font-mono">
                          {selectedLat.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vĩ độ:</span>
                        <span className="font-mono">
                          {selectedLng.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      Đang chờ dữ liệu...
                    </div>
                  )}
                </div>
                <MapController />
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-red-400 hover:bg-red-500 active:bg-red-600 cursor-pointer text-white"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-400 hover:bg-green-500 active:bg-green-600 cursor-pointer text-white"
          >
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
