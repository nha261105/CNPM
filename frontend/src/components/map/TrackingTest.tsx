import { useEffect, useState } from "react";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import taxiIcon from "../../../public/icon/taxi.png";

const busIcon = L.icon({
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  iconUrl: taxiIcon.src,
});

export default function TrackingTest({
  data,
}: {
  data: { lat: number; lng: number };
}) {
  const { lat, lng } = data;
  const [prevPos, setPrevPos] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    if (prevPos[0] !== lat || prevPos[1] !== lng) {
      setPrevPos([lat, lng]);
    }
  }, [lat, lng, prevPos]);

  return (
    <LeafletTrackingMarker
      icon={busIcon}
      position={[lat, lng]}
      previousPosition={prevPos}
      duration={500}
    />
  );
}
