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

// Có thể nhận props: studentMarkers, busPos, route. Nếu không truyền thì giữ nguyên logic cũ.
import React from "react";

type StudentMarker = { name: string; pos: [number, number]; index: number };
type BusPos = { lat: number; lng: number };

interface MapClientProps {
  studentMarkers?: StudentMarker[];
  busPos?: BusPos;
  route?: [number, number][];
}

export default function MapClient(props: MapClientProps) {
  const [route, setRoute] = useState<[number, number][]>(props.route || []);
  const [busPos, setBusPos] = useState<BusPos>(
    props.busPos || { lat: SCHOOL[0], lng: SCHOOL[1] }
  );
  const [studentMarkers, setStudentMarkers] = useState<StudentMarker[]>(
    props.studentMarkers || []
  );
  const stepRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const BUS_ID = 2; // hardcode or pass as prop

  // Nếu không truyền props thì giữ nguyên logic fetch cũ
  useEffect(() => {
    if (props.studentMarkers && props.busPos && props.route) return;
    let mounted = true;
    (async () => {
      try {
        const res = await axiosClient.get(
          `/api/admin/realtime/${BUS_ID}/students`
        );
        if (!mounted) return;
        const students = res?.data?.data ?? [];
        const studentPointsWithNames: StudentMarker[] = students
          .map((s: any, idx: number) => {
            const pp = s?.pickup_point;
            if (!pp) return null;
            const lat = Number(pp.latitude);
            const lng = Number(pp.longitude);
            if (!isFinite(lat) || !isFinite(lng)) return null;
            return {
              name: s?.student_name || `Student ${s?.student_id}`,
              pos: [lat, lng] as [number, number],
              index: idx,
            };
          })
          .filter(Boolean) as StudentMarker[];
        setStudentMarkers(studentPointsWithNames);
        const studentPoints = studentPointsWithNames.map((sp) => sp.pos);
        const waypoints: [number, number][] = [
          SCHOOL,
          ...studentPoints,
          SCHOOL,
        ];
        if (waypoints.length < 2) return;
        const osrmRoute = await getRouteFromOSRM(waypoints);
        if (!mounted) return;
        if (osrmRoute && osrmRoute.length > 0) setRoute(osrmRoute);
      } catch (err) {
        console.error("Error fetching students or route:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [props.studentMarkers, props.busPos, props.route]);

  // Animate bus nếu không truyền props
  useEffect(() => {
    if (props.route && props.busPos) return;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (route.length === 0) return;
    stepRef.current = 0;
    setBusPos({ lat: route[0][0], lng: route[0][1] });
    intervalRef.current = window.setInterval(() => {
      stepRef.current = (stepRef.current + 1) % route.length;
      const [lat, lng] = route[stepRef.current];
      setBusPos({ lat, lng });
    }, 300);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [route, props.route, props.busPos]);

  return (
    <div className="w-full h-[800px] rounded-2xl overflow-hidden shadow-md">
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
        <TrackingTest data={busPos} />
      </MapContainer>
    </div>
  );
}
