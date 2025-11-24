"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import axiosClient from "@/lib/axiosClient";
import TrackingTest from "./TrackingTest";
import { getRouteFromOSRM } from "@/lib/osrm";
import studentIconImg from "../../../public/icon/student.png";
import { useBusRealtime } from "@/hooks/useBusRealTime";
import { Dot } from "lucide-react";

// Fix default icon
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

const studentIcon = L.icon({
  iconUrl: studentIconImg.src,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const SCHOOL: [number, number] = [10.76006, 106.68229];

export default function MapClient() {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [studentMarkers, setStudentMarkers] = useState<
    Array<{ name: string; pos: [number, number]; index: number }>
  >([]);
  const [simPos, setSimPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const BUS_ID = 2;

  const realtimePos = useBusRealtime(BUS_ID);

  const busCurrentPos = realtimePos
    ? { lat: realtimePos.latitude, lng: realtimePos.longitude }
    : simPos
    ? simPos
    : { lat: SCHOOL[0], lng: SCHOOL[1] };

  // 1. Fetch student pickup points từ backend
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await axiosClient.get(
          `/api/admin/realtime/${BUS_ID}/students`
        );
        if (!mounted) return;

        const students = res?.data?.data ?? [];

        const studentPointsWithNames: Array<{
          name: string;
          pos: [number, number];
        }> = students
          .map((s: any) => {
            const pp = s?.pickup_point;
            if (!pp) return null;
            const lat = Number(pp.latitude);
            const lng = Number(pp.longitude);
            if (!isFinite(lat) || !isFinite(lng)) return null;
            return {
              name: s?.student_name || `Student ${s?.student_id}`,
              pos: [lat, lng] as [number, number],
            };
          })
          .filter(Boolean);
        console.log("Student pickup points:", studentPointsWithNames);

        setStudentMarkers(
          studentPointsWithNames.map((sp, idx) => ({
            ...sp,
            index: idx,
          }))
        );

        const studentPoints = studentPointsWithNames.map((sp) => sp.pos);

        const waypoints: [number, number][] = [
          SCHOOL,
          ...studentPoints,
          SCHOOL,
        ];

        if (waypoints.length < 2) {
          console.warn("Not enough waypoints for routing");
          return;
        }

        const osrmRoute = await getRouteFromOSRM(waypoints);
        if (!mounted) return;

        if (osrmRoute && osrmRoute.length > 0) {
          setRoute(osrmRoute);
          console.log("Route geometry received, points:", osrmRoute.length);
        }
      } catch (err) {
        console.error("Error fetching students or route:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // 2. TỰ ĐỘNG chạy khi có route
  useEffect(() => {
    if (route.length === 0) return;

    let currentIndex = 0;
    let t = 0;
    const lastUpdatePosFromBackend = Date.now();

    const interval = setInterval(async () => {
      if (currentIndex >= route.length - 1) {
        currentIndex = 0;
        t = 0;
      }

      const p1 = route[currentIndex];
      const p2 = route[currentIndex + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;

      setSimPos({ lat, lng });
      const now = Date.now();
      if (now - lastUpdatePosFromBackend >= 3000) {
        console.log(
          `vi tri xe bus hien tai: [${lat.toFixed(6)}, ${lng.toFixed(6)}]`
        );
        try {
          await axiosClient.post("/api/tracking", {
            bus_id: BUS_ID,
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Auto-simulator error:", err);
        }
      }
      t += 0.05;
      if (t >= 1) {
        t = 0;
        currentIndex++;
      }
    }, 50);

    return () => {
      console.log(" Stopping auto GPS simulator");
      clearInterval(interval);
    };
  }, [route, BUS_ID]);

  return (
    <div className="relative w-full h-[800px] rounded-2xl overflow-hidden shadow-md">
      <MapContainer center={SCHOOL} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={SCHOOL}>
          <Popup>School</Popup>
        </Marker>

        {studentMarkers.map((student) => (
          <Marker key={student.index} position={student.pos} icon={studentIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{student.name}</p>
                <p className="text-gray-600">Pickup #{student.index + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {route.length > 0 && <Polyline positions={route} color="blue" />}

        <TrackingTest data={busCurrentPos} timestamp={realtimePos?.timestamp} />
      </MapContainer>

      <div className="absolute top-4 right-4 bg-white/95 p-4 rounded shadow-lg z-[1000] max-w-xs">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <span className={realtimePos ? "text-green-500" : "text-red-500"}>
            <Dot />
          </span>
          Realtime (Bus {BUS_ID})
        </h3>
        {realtimePos ? (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Lat:</span>
              <span className="font-mono">
                {realtimePos.latitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lng:</span>
              <span className="font-mono">
                {realtimePos.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-mono text-[10px]">
                {new Date(realtimePos.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Đang chờ dữ liệu...</div>
        )}
      </div>
    </div>
  );
}
