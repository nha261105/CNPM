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
import { useEffect, useMemo, useRef, useState } from "react";
import TrackingTest from "./TrackingTest";
import { getRouteFromOSRM } from "@/lib/osrm";
import studentIconImg from "../../../public/icon/student.png";
import { useBusRealtime } from "@/hooks/useBusRealTime";
import { Dot } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

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

interface Checkpoint {
  id: number;
  mark: string;
  lat?: number;
  lng?: number;
  student_id?: number;
  parent_id?: number;
  completed?: boolean;
}

interface DriverMapProps {
  checkpoints: Checkpoint[];
  busId: number;
  isNavigating?: boolean;
  onCheckpointComplete?: (checkpointId: number, parentId?: number) => void;
}

export default function DriverMap({
  checkpoints,
  busId,
  isNavigating = false,
  onCheckpointComplete,
}: DriverMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Set<number>>(
    new Set()
  );
  const realtimePos = useBusRealtime(busId);
  const [simPos, setSimPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const simulationRef = useRef({
    currentIndex: 0,
    t: 0,
    lastUpdatePosFromBackend: Date.now(),
  });
  const routeKey = useMemo(() => {
    return checkpoints
      .filter((cp) => cp.lat !== undefined && cp.lng !== undefined)
      .map((cp) => `${cp.id}-${cp.lat}-${cp.lng}`)
      .join(",");
  }, [
    checkpoints.length,
    checkpoints.map((cp) => `${cp.id}-${cp.lat}-${cp.lng}`).join(","),
  ]);
  function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // Bán kính Trái Đất (mét)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Khoảng cách tính bằng mét
  }

  const maxId = useMemo(
    () => Math.max(...checkpoints.map((cp) => cp.id)),
    [checkpoints]
  );

  const studentMarkers = checkpoints
    .filter(
      (cp) =>
        cp.lat !== undefined &&
        cp.lng !== undefined &&
        cp.id !== 1 &&
        cp.id !== maxId &&
        cp.student_id
    )
    .map((cp) => ({
      name: cp.mark,
      pos: [cp.lat!, cp.lng!] as [number, number],
      id: cp.id,
    }));

  useEffect(() => {
    if (checkpoints.length === 0) return;

    const startpoint = checkpoints.find((cp) => cp.id === 1);
    if (!startpoint || !startpoint.lat || !startpoint.lng) {
      console.warn("Startpoint not found");
      return;
    }

    const incompleteCheckpoints = checkpoints.filter(
      (cp) =>
        cp.id !== 1 &&
        cp.id !== maxId &&
        !cp.completed &&
        !completedCheckpoints.has(cp.id) &&
        cp.lat !== undefined &&
        cp.lng !== undefined
    );

    const studentCheckpoints = checkpoints.filter(
      (cp) => cp.student_id && cp.id !== 1 && cp.id !== maxId
    );
    const allStudentCheckpointsCompleted =
      studentCheckpoints.length > 0 &&
      studentCheckpoints.every(
        (cp) => cp.completed || completedCheckpoints.has(cp.id)
      );

    const endpoint = checkpoints.find((cp) => cp.id === maxId);

    let routeStartPoint: [number, number];
    if (isNavigating && completedCheckpoints.size > 0 && simPos) {
      const completedCheckpointList = checkpoints.filter(
        (cp) => completedCheckpoints.has(cp.id) && cp.lat && cp.lng
      );

      if (completedCheckpointList.length > 0) {
        let nearestCheckpoint = completedCheckpointList[0];
        let minDist = calculateDistance(
          simPos.lat,
          simPos.lng,
          completedCheckpointList[0].lat!,
          completedCheckpointList[0].lng!
        );

        completedCheckpointList.forEach((cp) => {
          const dist = calculateDistance(
            simPos.lat,
            simPos.lng,
            cp.lat!,
            cp.lng!
          );
          if (dist < minDist) {
            minDist = dist;
            nearestCheckpoint = cp;
          }
        });

        routeStartPoint = [nearestCheckpoint.lat!, nearestCheckpoint.lng!];
      } else {
        routeStartPoint = [startpoint.lat, startpoint.lng];
      }
    } else {
      routeStartPoint = [startpoint.lat, startpoint.lng];
    }

    const waypoints: [number, number][] = [
      routeStartPoint,
      ...incompleteCheckpoints.map(
        (cp) => [cp.lat!, cp.lng!] as [number, number]
      ),
    ];

    if (
      allStudentCheckpointsCompleted &&
      endpoint &&
      endpoint.lat &&
      endpoint.lng
    ) {
      waypoints.push([endpoint.lat, endpoint.lng]);
    }

    if (waypoints.length < 2) {
      console.warn("Not enough waypoints for routing");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const osrmRoute = await getRouteFromOSRM(waypoints);
        if (!mounted) return;
        if (osrmRoute && osrmRoute.length > 0) {
          setRoute(osrmRoute);
        }
      } catch (err) {
        console.error("Error calculating route:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [checkpoints, completedCheckpoints, isNavigating, maxId]);

  const findNearestPointOnRoute = (
    route: [number, number][],
    currentPos: { lat: number; lng: number }
  ): { index: number; t: number } => {
    if (route.length === 0) return { index: 0, t: 0 };
    if (route.length === 1) return { index: 0, t: 0 };

    let minDist = Infinity;
    let bestIndex = 0;
    let bestT = 0;

    for (let i = 0; i < route.length - 1; i++) {
      const p1 = route[i];
      const p2 = route[i + 1];

      for (let t = 0; t <= 1; t += 0.1) {
        const lat = p1[0] + (p2[0] - p1[0]) * t;
        const lng = p1[1] + (p2[1] - p1[1]) * t;
        const dist = calculateDistance(
          currentPos.lat,
          currentPos.lng,
          lat,
          lng
        );

        if (dist < minDist) {
          minDist = dist;
          bestIndex = i;
          bestT = t;
        }
      }
    }

    return { index: bestIndex, t: bestT };
  };

  const prevRouteRef = useRef<[number, number][]>([]);
  useEffect(() => {
    if (!isNavigating || route.length === 0) {
      prevRouteRef.current = route;
      return;
    }

    const routeChanged =
      prevRouteRef.current.length > 0 &&
      JSON.stringify(prevRouteRef.current) !== JSON.stringify(route);

    if (routeChanged && simPos) {
      const nearest = findNearestPointOnRoute(route, simPos);

      const p1 = route[nearest.index];
      const p2 = route[nearest.index + 1] || route[nearest.index];
      const nearestLat = p1[0] + (p2[0] - p1[0]) * nearest.t;
      const nearestLng = p1[1] + (p2[1] - p1[1]) * nearest.t;
      const dist = calculateDistance(
        simPos.lat,
        simPos.lng,
        nearestLat,
        nearestLng
      );

      console.log(
        `Route changed - Nearest point on new route: index=${
          nearest.index
        }, t=${nearest.t.toFixed(2)}, distance=${dist.toFixed(2)}m`
      );

      if (dist < 1000) {
        simulationRef.current.currentIndex = nearest.index;
        simulationRef.current.t = nearest.t;
      } else {
        console.warn(
          `Distance too far (${dist.toFixed(2)}m), keeping current position`
        );
      }
    }

    prevRouteRef.current = route;
  }, [route, isNavigating, simPos]);

  const prevIsNavigatingRef = useRef(isNavigating);
  useEffect(() => {
    if (isNavigating && !prevIsNavigatingRef.current) {
      const startpoint = checkpoints.find((cp) => cp.id === 1);
      if (startpoint && startpoint.lat && startpoint.lng) {
        setSimPos({ lat: startpoint.lat, lng: startpoint.lng });
        simulationRef.current.currentIndex = 0;
        simulationRef.current.t = 0;
        prevRouteRef.current = [];

        if (!completedCheckpoints.has(1)) {
          setCompletedCheckpoints((prev) => {
            const newSet = new Set(prev);
            newSet.add(1);
            return newSet;
          });
          if (onCheckpointComplete) {
            onCheckpointComplete(1, startpoint.parent_id);
          }
        }
      }
    }
    prevIsNavigatingRef.current = isNavigating;
  }, [isNavigating, checkpoints, completedCheckpoints, onCheckpointComplete]);

  useEffect(() => {
    if (!isNavigating || route.length === 0) {
      setSimPos(null);
      return;
    }

    let currentIndex = 0;
    let t = 0;
    let lastUpdatePosFromBackend = Date.now();

    const interval = setInterval(async () => {
      const { currentIndex, t, lastUpdatePosFromBackend } =
        simulationRef.current;
      if (currentIndex >= route.length - 1) {
        clearInterval(interval);
        return;
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
            bus_id: busId,
            latitude: lat,
            longitude: lng,
            timestamp: new Date().toISOString(),
          });
          simulationRef.current.lastUpdatePosFromBackend = Date.now();
        } catch (err) {
          console.error("Auto-simulator error:", err);
        }
      }

      let newT = t + 0.2;
      let newIndex = currentIndex;
      if (newT >= 1) {
        newT = 0;
        newIndex = currentIndex + 1;
      }
      simulationRef.current.t = newT;
      simulationRef.current.currentIndex = newIndex;
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [isNavigating, route, busId]);

  useEffect(() => {
    const currentPos =
      isNavigating && simPos
        ? simPos
        : realtimePos
        ? { lat: realtimePos.latitude, lng: realtimePos.longitude }
        : null;

    if (!currentPos) return;

    const checkDistance = () => {
      const studentCheckpoints = checkpoints.filter(
        (cp) => cp.student_id && cp.id !== 1 && cp.id !== maxId
      );
      const allStudentCheckpointsCompleted =
        studentCheckpoints.length > 0 &&
        studentCheckpoints.every(
          (cp) => cp.completed || completedCheckpoints.has(cp.id)
        );

      checkpoints.forEach((checkpoint) => {
        if (checkpoint.id === maxId && !allStudentCheckpointsCompleted) {
          return;
        }

        if (
          checkpoint.completed ||
          completedCheckpoints.has(checkpoint.id) ||
          !checkpoint.lat ||
          !checkpoint.lng
        ) {
          return;
        }

        const dist = calculateDistance(
          currentPos.lat,
          currentPos.lng,
          checkpoint.lat,
          checkpoint.lng
        );

        if (dist <= 2000) {
          console.log(
            `Xe gần checkpoint ${checkpoint.mark}: ${dist.toFixed(2)}m`
          );
        }

        if (dist <= 1000) {
          if (!completedCheckpoints.has(checkpoint.id)) {
            console.log(
              `Đánh dấu hoàn thành checkpoint: ${checkpoint.mark} (id: ${
                checkpoint.id
              }) - Khoảng cách: ${dist.toFixed(2)}m`
            );
            setCompletedCheckpoints((prev) => {
              const newSet = new Set(prev);
              newSet.add(checkpoint.id);
              return newSet;
            });
            if (onCheckpointComplete) {
              onCheckpointComplete(checkpoint.id, checkpoint.parent_id);
            }
          }

          if (checkpoint.parent_id && checkpoint.student_id) {
            // sendNotificationToParent(
            //   checkpoint.parent_id,
            //   checkpoint.student_id,
            //   checkpoint.mark
            // );
          }
        }
      });
    };

    checkDistance();
    const interval = setInterval(checkDistance, 1000);
    return () => clearInterval(interval);
  }, [
    isNavigating,
    simPos,
    realtimePos,
    busId,
    checkpoints,
    completedCheckpoints,
    onCheckpointComplete,
    maxId,
  ]);

  useEffect(() => {
    const completedIds = new Set(
      checkpoints.filter((cp) => cp.completed).map((cp) => cp.id)
    );
    setCompletedCheckpoints(completedIds);
  }, [checkpoints]);

  // const sendNotificationToParent = async();

  const busCurrentPos =
    isNavigating && simPos
      ? simPos
      : realtimePos
      ? { lat: realtimePos.latitude, lng: realtimePos.longitude }
      : { lat: SCHOOL[0], lng: SCHOOL[1] };

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
          <Marker key={student.id} position={student.pos} icon={studentIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{student.name}</p>
                <p className="text-gray-600">Pickup #{student.id}</p>
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
          Realtime (Bus {busId})
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
