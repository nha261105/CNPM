"use client";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Dot, LocateFixed, MapPin } from "lucide-react";
import L from "leaflet";

interface PickupMapProps {
  currLatitude: number;
  currLongitude: number;
  selectedLat: number;
  selectedLng: number;
  setSelectedLat: (lat: number) => void;
  setSelectedLng: (lng: number) => void;
}

function MapController({
  currLatitude,
  currLongitude,
  setSelectedLat,
  setSelectedLng,
}: {
  currLatitude: number;
  currLongitude: number;
  setSelectedLat: (lat: number) => void;
  setSelectedLng: (lng: number) => void;
}) {
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

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function PickupMapForStudent({
  currLatitude = 0,
  currLongitude = 0,
  selectedLat = 0,
  selectedLng = 0,
  setSelectedLat,
  setSelectedLng,
}: PickupMapProps) {
  return (
    <div className="relative w-full h-80 border rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
      <MapContainer
        center={[currLatitude, currLongitude]}
        zoom={14}
        className="w-full h-full rounded-xl"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[currLatitude, currLongitude]}>
          <Popup>Vị trí hiện tại</Popup>
        </Marker>

        {/* Pin giữa màn hình */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-[999] pointer-events-none flex flex-col items-center">
          <div className="bg-white px-2 py-1 rounded-md shadow-md text-xs font-semibold text-gray-800 mb-1 border border-gray-200">
            Vị trí mới
          </div>
          <div className="relative">
            <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black opacity-20 rounded-full"></span>
          </div>
        </div>

        {/* Thông tin tọa độ */}
        <div className="absolute top-4 right-4 bg-white/95 p-4 rounded shadow-lg z-[1000] max-w-xs">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <span
              className={
                selectedLat && selectedLng ? "text-green-500" : "text-red-500"
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
                <span className="font-mono">{selectedLat.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vĩ độ:</span>
                <span className="font-mono">{selectedLng.toFixed(6)}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-500">Đang chờ dữ liệu...</div>
          )}
        </div>

        <MapController
          currLatitude={currLatitude}
          currLongitude={currLongitude}
          setSelectedLat={setSelectedLat}
          setSelectedLng={setSelectedLng}
        />
      </MapContainer>
    </div>
  );
}