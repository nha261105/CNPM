import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type BusPos = {
  bus_id: number;
  latitude: number;
  longitude: number;
  timestamp: string;
};

export function useBusRealtime(busId: number) {
    const [pos, setPos] = useState<BusPos | null>(null)
    
    useEffect(() => {
        if(!busId) return;
        const channel = supabase.channel(`tracking-bus-${busId}`).on("broadcast", {event: "position_update"}, (payload) => {
            setPos(payload.payload as BusPos)
        }).subscribe();

        return () => {
            supabase.removeChannel(channel)
        }
    },[busId])
    return pos;
}
