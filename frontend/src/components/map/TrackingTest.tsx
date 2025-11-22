import { useEffect, useRef, useState } from "react";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import bus from "../../../public/icon/bus.png";

const busIcon = L.icon({
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  iconUrl: bus.src,
});

export default function TrackingTest({
  data,
  timestamp,
}: {
  data: { lat: number; lng: number };
  timestamp?: string;
}) {
  const { lat, lng } = data;
  const lastPosRef = useRef<[number , number]>([lat,lng]);
  const [prevPos, setPrevPos] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    if (prevPos[0] !== lat || prevPos[1] !== lng) {
      setPrevPos(lastPosRef.current);
      lastPosRef.current = [lat,lng]
    }
  }, [lat, lng]);

  return (
    <LeafletTrackingMarker
      icon={busIcon}
      position={[lat, lng]}
      previousPosition={prevPos}
      duration={100}
    />
  );
}
