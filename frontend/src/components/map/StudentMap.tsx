"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { LocateFixed } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface StudentMapProps {
  latitude: number;
  longitude: number;
  studentName: string;
}

function RecenterButton({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  return (
    <div className="absolute bottom-5 right-4 z-[999]">
      <div
        className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-transform cursor-pointer"
        onClick={() => {
          map.flyTo([lat, lng], map.getZoom());
        }}
      >
        <LocateFixed className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  );
}

export default function StudentMap({
  latitude,
  longitude,
  studentName,
}: StudentMapProps) {
  useEffect(() => {}, [latitude, longitude]);

  return (
    <div className="">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        style={{ height: "600px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>Vị trí học sinh: {studentName}</Popup>
        </Marker>
        <RecenterButton lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
